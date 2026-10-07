# Runbook: TechSolutions FL (GitHub Pages)

**Reader:** whoever is on the hook when the site is down, wrong, or needs to move. Written to be followed at 3am: copy the commands, compare the output, follow the "if not" line.
**Source of truth:** `.github/workflows/deploy.yml` and `docs/adr/0001-stack-and-structure.md` (section 5 and Rollback). If this file and the workflow disagree, the workflow is right. Fix this file.

| | |
|---|---|
| Repo | `qognitionagency/techsolutions-fl-site` |
| Live URL | `https://qognitionagency.github.io/techsolutions-fl-site/` |
| Hosting | GitHub Pages, source "GitHub Actions". Static files only: no server, database, or cache |
| Deploys on | Push to `main`, or manual `workflow_dispatch` |
| Build env | `BASE_PATH=/techsolutions-fl-site`, `SITE_URL=https://qognitionagency.github.io`, both derived by the workflow. Nothing to edit when the repo is renamed |
| Secrets in CI | **None. By design.** The Pexels key lives only in a developer's local `.env`. If CI ever asks for it, something is wrong |

Every command below assumes this once per shell:

```bash
export REPO=qognitionagency/techsolutions-fl-site
export URL=https://qognitionagency.github.io/techsolutions-fl-site/
```

## 0. First-time setup (once per repo)

1. Repo Settings > Pages > Build and deployment > Source: **GitHub Actions**. Until this is set, the deploy job fails.
   Same setting by CLI: `gh api -X POST repos/$REPO/pages -f build_type=workflow` `[UNVERIFIED: not run against a live repo; use the Settings page if it errors]`.
2. Settings > Environments: `github-pages` is created on first deploy. Leave its default branch rule (main only).
3. Private repo? Pages on a private repo needs a paid GitHub plan. If Pages is unavailable, use section 4 (Vercel). ADR 0001 lists this as an open question.
4. Optional repo variables, see section 4: `PUBLIC_FORM_ENDPOINT`, `PUBLIC_FORM_ACCESS_KEY`. Leave `PUBLIC_INDEXABLE` unset.
5. Push to `main`, or run section 1 manually.

## 1. Deploy

Normal path: merge or push to `main`. Nothing else to do.

Manual deploy of the current `main`:

```bash
gh workflow run deploy.yml --repo $REPO --ref main
gh run watch --repo $REPO $(gh run list --repo $REPO --workflow=deploy.yml --limit 1 --json databaseId --jq '.[0].databaseId') --exit-status
```

Expected: `build` then `deploy` jobs both green. Build runs about 1 to 3 minutes `[UNVERIFIED: no run observed yet]`.

**A green run is not a successful deploy. Check the site:**

```bash
curl -sS -o /dev/null -w '%{http_code}\n' $URL
# expect: 200
curl -sS $URL | grep -o '/techsolutions-fl-site/_astro/[^"]*' | head -3
# expect: at least one line. Every asset path starts with /techsolutions-fl-site/
curl -sS $URL | grep -o '<meta name="robots"[^>]*>'
# expect: noindex,nofollow while PUBLIC_INDEXABLE is unset
```

| If you see | Meaning | Do |
|---|---|---|
| `404` on `$URL` | Pages not enabled, or the first deploy has not finished | Section 0 step 1. Then `gh run list --repo $REPO --workflow=deploy.yml --limit 3` |
| `200` but unstyled page, console 404s on `/_astro/...` | Built with `BASE_PATH=/`, so assets are not under `/techsolutions-fl-site/` | Check the workflow's `BASE_PATH` line is unchanged. Re-run section 1 |
| Assets are under `/techsolutions-fl-site/` but a link or image 404s | A hard-coded leading `/` in `src/` that bypasses `withBase()`. ADR section 5 calls this a bug | Not a platform fix. Escalate to the frontend owner with the broken URL. Roll back (section 2) if it is user-visible |
| No `robots` meta line, or `index` | `PUBLIC_INDEXABLE` was set to `true` | Section 6 |
| Old content still showing | CDN cache, or the deploy job did not run | Wait 2 minutes, retry with `curl -H 'Cache-Control: no-cache' $URL`. Check the deploy job ran, not just build |

### When the run fails

Open the failed run: `gh run view --repo $REPO --log-failed`.

| Failing step | Cause | Do |
|---|---|---|
| `Build with Astro`, message `check-dist: forbidden string found` (or `postbuild: "PEXELS" found in dist`) | The word `PEXELS` is in the built output. `check-dist.mjs` is case-sensitive, so the "Pexels" footer credit does not trip it | Stop. See "Key leak response" below. Do not bypass the check |
| `Guard - no Pexels key in dist` | `PEXELS_API_KEY` appears in a built file, or a 56-character key-shaped string does. The log lists file names only, never content | Inspect **locally**, never in CI: `npm ci && npm run build && grep -rIlE '[A-Za-z0-9]{56}' dist`. If it is a hash or encoded blob and not a key, record that in the PR and adjust the pattern in `deploy.yml` through review. If it could be a key, treat it as one |
| `Build with Astro`, a TypeScript, Astro or Tailwind error | Code problem | Frontend owner. Roll back (section 2) if `main` must be live now |
| `Build with Astro`, message `PUBLIC_INDEXABLE=true but content.ts still lists N NEEDS DATA items` (TechSolutions only, from `src/lib/indexing.ts`) | The indexing switch is on while sample content remains | Section 6 |
| `Deploy to GitHub Pages` fails, mentions Pages or environment | Pages source not set to GitHub Actions, or branch rule on `github-pages` blocks the ref | Section 0 steps 1 and 2 |
| Run is "queued" or "waiting" for a long time | The `pages` concurrency group holds one deploy at a time and never cancels one in flight | `gh run list --repo $REPO --workflow=deploy.yml --limit 5`. Wait for the earlier run. Cancel it only if it is stuck: `gh run cancel <id> --repo $REPO` |

### Key leak response

If the Pexels key may have reached `dist/`, a commit, or a log:

1. Do not deploy. If a bad build is already live, roll back (section 2) first.
2. Revoke and reissue the key in the Pexels account that owns it. Rotation is the fix. Editing git history is not.
3. Tell the operator. `[NEEDS DATA: named on-call/escalation contact. Not defined in the repo]`

## 2. Rollback

Pages serves the last successful deploy. A failed build or guard never replaces the live site, so a red run needs no rollback. Roll back only when a **successful** deploy is wrong.

**Fastest: re-run the last good run (no code change).**

```bash
gh run list --repo $REPO --workflow=deploy.yml --status=success --limit 5
# pick the newest run BEFORE the bad one. Note its databaseId and head SHA.
gh run rerun <databaseId> --repo $REPO
gh run watch <databaseId> --repo $REPO --exit-status
```

A re-run rebuilds the old commit on `main`, so it uses that commit's code. Then verify with the section 1 curl checks.
Whether a re-run uses repository variables as they were at the original run or as they are now is `[UNVERIFIED]`. To change a variable, trigger a fresh run with section 1 instead.
Limitation: the next push to `main` redeploys `main`, which still contains the bad commit. So follow up with the revert below.

**Durable: revert the bad commit.**

```bash
git switch main && git pull --ff-only
git revert <bad-sha>        # for a merge commit: git revert -m 1 <merge-sha>
git push origin main        # triggers a deploy
```

Then verify with the section 1 curl checks. Pushing to `main` may need a PR, depending on branch protection. If it does, go through review (Owen) as usual.

**Pull the site entirely.** Settings > Pages > Unpublish, or `gh api -X DELETE repos/$REPO/pages` `[UNVERIFIED: not run]`. Then `curl -sS -o /dev/null -w '%{http_code}\n' $URL` should return `404`. To restore, re-enable per section 0 and run section 1.

**Bad variable value** (for example a wrong form endpoint): set the right value (section 4), run section 1. This is a new deploy, not a revert.

## 3. Switch to Vercel (BASE_PATH=/)

Use when Pages is unavailable (private repo on a free plan) or the prospect wants a root-path domain. ADR 0001 Rollback > Host: no code changes are needed, because `astro.config.mjs` reads `SITE_URL` and `BASE_PATH` from the environment and falls back to `/`.

1. Vercel dashboard > Add New Project > import `qognitionagency/techsolutions-fl-site`.
2. Framework preset: Astro. Build command: `npm run build`. Output directory: `dist`. `[UNVERIFIED: preset auto-detection; set these two by hand if it does not pick them]`
3. Environment variables (Production and Preview):

   | Name | Value |
   |---|---|
   | `BASE_PATH` | `/` |
   | `SITE_URL` | `https://<project>.vercel.app`, or the custom domain with no trailing slash |
   | `PUBLIC_FORM_ENDPOINT` | same value as the GitHub variable, if one is set |
   | `PUBLIC_FORM_ACCESS_KEY` | same, if set |

   **Do not add `PEXELS_API_KEY` to Vercel.** Builds do not need it (media is committed), and a key in a build environment is one `console.log` from a leak.
4. Deploy, then verify:

   ```bash
   export URL=https://<project>.vercel.app/
   curl -sS -o /dev/null -w '%{http_code}\n' $URL     # expect 200
   curl -sS $URL | grep -c '/techsolutions-fl-site/'               # expect 0: no repo-name prefix on asset paths
   ```
5. Once Vercel is confirmed good, stop the Pages copy so two public copies do not drift: `gh workflow disable deploy.yml --repo $REPO`, then section 2 "Pull the site entirely".
6. `SITE_URL` drives canonical, OG and sitemap URLs. If the domain changes later, change it in Vercel and redeploy. Nothing in the repo changes.
7. **Security headers live in `vercel.json`** (Anton, 2026-10-07): CSP, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `X-Frame-Options`, `X-Robots-Tag: noindex, nofollow`. They apply on Vercel only (Pages ignores the file). Verify after deploy:

   ```bash
   curl -sI $URL | grep -iE 'content-security-policy|x-robots-tag|x-frame-options'
   # expect all three lines
   ```

   The CSP allows inline scripts by **sha256 hash only**. Editing an inline script (`Nav.astro`, `MobileBar.astro`, or any component script small enough for Astro to inline) or upgrading Astro changes the hashes. `npm run build` fails in postbuild (`csp-hashes: vercel.json script-src does not match`) until you run `npm run build; node scripts/csp-hashes.mjs`, paste the printed hashes into `script-src` in `vercel.json` and rebuild. Symptom if this is bypassed: no mobile menu button, sticky bar renders as a static block, browser console shows "Refused to execute inline script".

Back to Pages: `gh workflow enable deploy.yml --repo $REPO`, section 0 step 1, section 1.

## 4. Set `PUBLIC_FORM_ENDPOINT`

This is a repository **variable**, not a secret. It is inlined into the public JavaScript at build time (ADR 0001 section 6), so anyone can read it. Never put a private credential in it. The same applies to the optional `PUBLIC_FORM_ACCESS_KEY` (Web3Forms-style keys are public by design).

```bash
gh variable set PUBLIC_FORM_ENDPOINT --repo $REPO --body 'https://<endpoint-url>'
gh variable list --repo $REPO
# expect a row for PUBLIC_FORM_ENDPOINT
# optional:
gh variable set PUBLIC_FORM_ACCESS_KEY --repo $REPO --body '<public-access-key>'
```

**Vercel: widen the CSP first.** `vercel.json` sets `connect-src 'self'` and `form-action 'self'`, which block a third-party endpoint: the form would fail every send (`form_submit_fail`, error_type `network`) and the no-JS post would be refused. Before setting the variable on Vercel, add the endpoint's origin (for example `https://api.web3forms.com`) to both `connect-src` and `form-action` in `vercel.json`, through review.

Rules, from `src/scripts/form.ts`:
- The value must start with `https://`. Anything else (including an empty value) leaves the form in **demo mode**, which shows "Concept site: this form is not connected yet."
- The value is baked in at build. **Changing the variable does nothing until you redeploy**: run section 1.

Verify it took effect:

```bash
for f in $(curl -sS $URL | grep -o '/techsolutions-fl-site/_astro/[^"]*\.js' | sort -u); do
  echo -n "$f: "; curl -sS "https://qognitionagency.github.io$f" | grep -c '<endpoint-host>'
done
# expect a non-zero count on at least one file
curl -sS $URL | grep -c '<endpoint-host>'   # small scripts can be inlined in the HTML instead
```

Then submit the form once yourself using obviously fake data (name "Test Do Not Call"). That sends a real request to the live endpoint, so tell whoever reads that inbox first.

Unset (return to demo mode): `gh variable delete PUBLIC_FORM_ENDPOINT --repo $REPO`, then section 1.

## 5. Re-fetch media (local `.env` only)

Media (photos and videos from Pexels) is fetched once on a developer machine and **committed**. CI never fetches it and never has the key (ADR 0001 section 4). Re-fetch only to swap or add a slot.

You need: Node 22.12 or newer, `npm ci` done, and a Pexels API key. The rate limit is 200 requests per hour.

```bash
cp .env.example .env            # .env is gitignored. Never commit it
# edit .env, set PEXELS_API_KEY=<your key>. Do not paste the key into chat, tickets or PRs.
git check-ignore -v .env        # expect a line naming .gitignore. If blank, STOP: .env is not ignored
```

| Goal | Command |
|---|---|
| Fetch what is missing (existing files are skipped) | `npm run media` |
| Re-download everything | `npm run media -- --force` |
| Only some slots | `npm run media -- --only hero,band-pool` |
| Browse candidates before choosing (small previews go to gitignored `media-raw/candidates/`) | `npm run media -- --candidates "query" [--video] [--n 12] [--orientation landscape]` |

After a fetch:

1. If the script printed resolved ids, pin each `id` into `media-manifest.json` so reruns are deterministic.
2. Read the last line: `credits: N entries. Committed media: X MB (budget 60 MB).` Over 60 MB is a failure of the ADR budget. Do not commit. If it is over, escalate to Kyle (architect).
3. `npm run build`. The postbuild check must print `no PEXELS string in dist/`.
4. `git status`: expect media files, `media-manifest.json` and `src/data/media-credits.json` (generated, never hand-edited). **No `.env`.**
5. Commit and push through the normal review. The footer credit comes from `media-credits.json`.

| Script message | Cause | Do |
|---|---|---|
| `PEXELS_API_KEY is not set` | `.env` missing or empty | Fill `.env`, run again |
| `Pexels 401` | Bad or revoked key | Get a new key |
| `Pexels 429`, or `rate limit: N requests left` | Over 200/hour | Wait an hour, rerun. Existing files are skipped |
| `no mp4 rendition <= 1920px and <= 6 MB for slot "<slot>"` (exit 2) | No video rendition fits the budget | Pick another video id for that slot |

## 6. Make the site indexable (do not do this casually)

These are concept sites on a real business's name. Noindex is deliberate (ADR 0001 section 5). `PUBLIC_INDEXABLE=true` removes it. Per the ADR it is set only after every `NEEDS DATA` item in `src/data/content.ts` is real. `gh variable set PUBLIC_INDEXABLE --repo $REPO --body true` then section 1. The build fails while any `NEEDS DATA` item remains (`src/lib/indexing.ts`), and this site carries sample prices, phone and reviews. To undo: `gh variable delete PUBLIC_INDEXABLE --repo $REPO`, then section 1.

On Vercel, `vercel.json` also sends `X-Robots-Tag: noindex, nofollow` on every response. Remove that header (through review) in the same change that sets `PUBLIC_INDEXABLE=true`, or the site stays noindexed.
