# Form module: `src/scripts/form.ts` + `src/scripts/analytics.ts`

The same two files ship in `iron-sound-solutions` and `techsolutions-fl`. If you change one, change the other too. There are no dependencies, and the two files come to 4.5 KB gzip together. They implement ADR 0001 §6 and each site's CRO spec (§3 Iron Sound, §4–§5 TechSolutions).

```astro
<script>
  import { initMultiStepForm } from '../../scripts/form';
  const form = document.querySelector<HTMLFormElement>('#consult');
  if (form) initMultiStepForm(form, { /* options, see below */ });
</script>
```

Importing `analytics.ts` (`form.ts` imports it for you) installs one delegated click listener for `[data-track]` and `tel:`/`sms:`/`mailto:` links. Any page that has tracked CTAs but no form needs `import '../../scripts/analytics';`.

## HTML contract

All markup must work without JS. With JS off, every step renders and the form posts natively, so set `action` to the endpoint and `method="post"`. All copy comes from `content.ts`. The module reads copy from attributes and never invents it. The defaults in the table are English fallbacks only.

| Attribute | On | Effect |
|---|---|---|
| `data-step="<step_name>"` | each step `<fieldset>` | One step is visible at a time. The value is the `step_name` sent with `form_step` and `form_error` |
| `<legend>` or `data-step-heading` | inside a step | Gets `tabindex="-1"` and receives focus when the step changes |
| `data-next` / `data-back` | `type="button"` buttons | Next validates the current step. Back never validates and keeps every answer |
| `type="submit"` + `data-busy-label="Sending…"` | final button | Disabled while submitting, and its label is swapped. Put the label in a `<span data-label>` if the button also contains an icon |
| `data-js-only` + `hidden` | e.g. Next/Back, progress | JS removes `hidden`, so these elements never show without JS |
| `data-progress` | bar element | Gets `aria-valuenow/min/max` and the CSS variable `--progress` (0–1) |
| `data-progress-text` + `data-template="Step {n} of {total}"` | text | Filled with `{n}`, `{total}` and `{title}` |
| `data-live` + `data-live-step="Step {n} of {total}: {title}"` + `data-live-errors="{count} answers need attention."` | one polite live region | Announces step changes and how many errors a step has |
| `data-field` | wrapper around one field or one group | The error `<p>` is appended here, and `data-error*` is looked up here as well as on the control |
| `data-error="…"`, `data-error-required` / `-format` / `-length` / `-range` | control or `data-field` | The error message. The type-specific attribute wins |
| `data-error-for="<name>"` | optional `<p>` | Places the error yourself. Otherwise one is created. Each error gets an `id`, `aria-describedby` and `aria-invalid` |
| `data-error-summary` + `role="alert"` | optional `<ul>` in a step | Lists anchor links to each field when a step has 2 or more errors (TechSolutions) |
| `required`, `type`, `pattern`, `min`/`max`, `minlength` | controls | Native constraint validation. Text is trimmed before it is checked |
| `type="email"` | input | Also requires `x@y.z` |
| `data-validate="phone"` | input | 10 digits after stripping formatting. A leading 1 is allowed. The area code cannot start with 0 or 1 |
| `data-required-group` (`="2"` for a minimum of 2) | wrapper of checkboxes | At least N boxes must be checked. Put `data-field` and `data-error` on the same element |
| `data-show-if="type=marine\|commercial"` | wrapper | Hidden and its controls disabled until the field holds one of those values. Disabled controls are not validated or sent |
| `data-required-if="contact_pref=email"` | control | `required` is toggled on and off |
| `<input name="website">` | honeypot | Visually hidden wrapper with `aria-hidden="true"`, `tabindex="-1"` and `autocomplete="off"`. **Never `display:none`** |
| `<input type="hidden" name="lead_id">` / `entry_cta` / `utm_source` … | hidden | Filled by the module. The id and entry are always added to the POST |
| `data-success` + `hidden` | panel **inside** the form | Shown on success. Every other child of the form gets `hidden`. Focus moves to its heading (`data-success-heading`, or the first `h1`–`h4`) |
| `data-fill="<field>"` | inside success | Text of that field's answer (label text for choices). Set with `textContent` |
| `data-demo-notice` + `hidden` | inside success | Shown only in demo mode. Text per ADR: "Concept site: this form is not connected yet." |
| `data-error-panel` + `hidden` + `role="alert"` | in the last step | Shown on a failed send, with all answers kept. Put `data-retry` on its Try again button. The `mailto:` and `tel:` fallbacks are plain links you write in markup |

**Opening and prefilling from elsewhere on the page:**
- A click on any `a`/`button` with `data-prefill-<field>="value"` (comma-separated for checkboxes) prefills the form.
- A link whose `#hash` targets the form, or a section containing it, focuses the current step heading. Focus uses `preventScroll`, so the anchor does the scrolling.
- The entry is recorded from `data-entry`, then `data-track-id`, otherwise `direct`.
- Other scripts can dispatch `document.dispatchEvent(new CustomEvent('form:prefill', { detail: { type: 'marine' } }))`.
- The URL query, and anything after `?` in the hash, prefill **only the fields named in `Object.values(urlParams)` (radios, checkboxes, selects) and `utm_*` hidden fields**. Everything else, consent boxes included, is ignored. They are read once.
- Prefill never touches `website` or the id/entry fields. Prefills do not fire `form_start`.

## Example (two of six steps, Iron Sound naming)

```html
<form id="consult" action={endpoint} method="post" novalidate>
  <p data-progress-text data-template="Step {n} of 6" data-js-only hidden></p>
  <div data-progress role="progressbar" aria-label="Form progress" data-js-only hidden></div>
  <p data-live aria-live="polite" class="sr-only"></p>
  <input type="hidden" name="lead_id"><input type="hidden" name="entry_cta">
  <input type="hidden" name="utm_source"><input type="hidden" name="utm_medium"><input type="hidden" name="utm_campaign">
  <div class="sr-only" aria-hidden="true"><label>Leave this empty <input name="website" tabindex="-1" autocomplete="off"></label></div>

  <fieldset data-step="type">
    <legend>What are we working on?</legend>
    <div data-field data-error="Choose home, business or boat so we can ask the right questions.">
      <label><input type="radio" name="type" value="residential" required> Home</label>
      <label><input type="radio" name="type" value="commercial" required> Business</label>
      <label><input type="radio" name="type" value="marine" required> Boat</label>
    </div>
    <button type="button" data-next data-js-only hidden>Next</button>
  </fieldset>

  <!-- steps 2–5 … -->

  <fieldset data-step="contact">
    <legend>How do we reach you?</legend>
    <div data-field><label for="f-name">Name</label>
      <input id="f-name" name="name" autocomplete="name" required minlength="2" data-error="Add your name so we know who to ask for."></div>
    <div data-field><label for="f-phone">Phone (optional)</label>
      <input id="f-phone" name="phone" type="tel" autocomplete="tel" data-validate="phone" data-error="Use a 10-digit number, like 561 555 0123."></div>
    <div data-field data-show-if="contact_pref=text">
      <label><input type="checkbox" name="sms_consent" value="yes" required data-error="Tick the box to allow texts, or choose call or email."> …consent wording…</label></div>
    <div data-error-panel hidden role="alert">That didn't send. Your answers are still here.
      <button type="button" data-retry>Try again</button> <a href="mailto:…">Email us</a></div>
    <button type="button" data-back data-js-only hidden>Back</button>
    <button type="submit" data-busy-label="Sending…">Request my consultation</button>
  </fieldset>

  <div data-success hidden>
    <h2>Thanks, <span data-fill="name"></span>. We've got your project details.</h2>
    <p data-demo-notice hidden>Concept site: this form is not connected yet.</p>
  </div>
</form>

<a href="#consult" data-track="cta_click" data-track-id="env_marine_book" data-track-location="environment"
   data-track-type="contextual" data-prefill-type="marine">Book a boat consultation</a>
```

## Options (per site)

The defaults follow the Iron Sound spec. TechSolutions renames four things:

```ts
// iron-sound-solutions
initMultiStepForm(form, {
  params: (event, d) =>
    event === 'form_step' ? { project_type: String(d.get('type') ?? '') }
    : event === 'form_submit' ? { project_type: String(d.get('type') ?? ''), scope_count: d.getAll('scope').length, /* stage, budget_band, timeline, contact_pref, has_phone, … */ }
    : {},
});

// techsolutions-fl
initMultiStepForm(form, {
  names: { id: 'submission_id', entry: 'entry_point', field: 'field', submitFail: 'form_submit_fail' },
  skipPrefilledSteps: true,        // picker "Book" opens on step 2 and counts as form_start
  urlParams: { service: 'services' },
  params: (event, d) => {
    const services = d.getAll('services').map(String).sort().join(',');
    return event === 'form_step' ? { services }
      : event === 'form_submit' ? { services, property_type: String(d.get('property_type') ?? ''), page_variant: 'control' /* timing, in_area, coi_needed, contact_pref */ }
      : {};
  },
});
```

The other options are `endpoint` and `accessKey` (which default to `PUBLIC_FORM_ENDPOINT` and `PUBLIC_FORM_ACCESS_KEY`), `timeoutMs` (15000), `retryDelayMs` (800), `minFillMs` (the time trap, `0` = off, Anton decides), and `onState(state, formData)`. Use `onState` for anything site-specific on success or error. Examples are TechSolutions' masked last 4 digits of the phone, or a `mailto:` body built from the visitor's own answers.

`params` returns **enums, counts and booleans only**. `track()` drops PII keys (`name`, `email`, `phone`, `zip`, `notes`, `location`, `date`, …), any string with an `@` or 7 or more digits (a whole-value UUID is exempt), numbers of 7 or more digits, objects, and strings over 100 characters.

## Events fired

| Event | When | Params |
|---|---|---|
| `form_view` | Form is 50% or more in view, once | `params()` |
| `form_start` | First real input or change, once. Also on a prefilled CTA when `skipPrefilledSteps` is set | `entry`, `prefilled`, `id` |
| `form_step` | A step passes validation and advances, **including the final step on submit** | `step_number`, `step_name` |
| `form_error` | A field fails on Next or Submit, once per field per attempt | `step_name`, `field`, `error_type` (`required\|format\|length\|range`) |
| `form_submit` | 2xx (`mode: 'live'`), or a validated submit with no endpoint (`mode: 'demo'`). Once per id. Never fires for a honeypot or time-trap hit | `mode`, `id`, `entry` |
| `form_submit_error` / `_fail` | Send failed after the automatic retry | `error_type` (`network\|http_4xx\|http_5xx\|timeout`), `id` |
| `call_click` / `text_click` / `email_click` | `tel:` / `sms:` / `mailto:` clicked | `cta_id`, `cta_location`, `cta_type`, `section` |
| `<data-track>` | Element click | `data-track-id\|location\|type` → `cta_*`, other `data-track-x-y` → `x_y`, plus `section`, `service`, `prefill_type` |

## Not included (build per site if the spec needs it)

- `sessionStorage` persistence. TechSolutions spec §4 is pending Anton. Iron Sound says nothing is persisted.
- The phone display mask, character counters, and the soft out-of-area ZIP warning.

## Tests

`npm test` (happy-dom + `node:test`, `tests/form-module.test.mjs` and `tests/url.test.mjs`) bundles these files with esbuild and runs the behaviour suite. It also runs as `prebuild`, so a red suite fails every build, Vercel included. Iron Sound has no runner yet: its `form.ts`/`analytics.ts` are byte-identical to these, so run this suite after any change and copy the file across.
