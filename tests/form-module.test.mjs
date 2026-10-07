// Behavioural tests for src/scripts/{analytics,form}.ts. Run: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Window } from 'happy-dom';

const OUT = new URL('./.out/', import.meta.url);
let n = 0;
const GLOBALS = ['document', 'location', 'Event', 'CustomEvent', 'FormData', 'HTMLElement', 'Element', 'IntersectionObserver'];

async function setup(html, { url = 'https://site.test/', fetchImpl } = {}) {
  const w = new Window({ url });
  globalThis.window = w;
  for (const k of GLOBALS) globalThis[k] = w[k];
  const calls = [];
  globalThis.fetch = async (u, init) => { calls.push({ u, init }); return fetchImpl ? fetchImpl(calls.length, init) : { ok: true, status: 200 }; };
  w.document.body.innerHTML = html;
  const v = ++n;
  const analytics = await import(new URL(`analytics.mjs?v=${v}`, OUT).href);
  const form = await import(new URL(`form.mjs?v=${v}`, OUT).href);
  const events = () => (w.dataLayer || []).map((e) => ({ ...e }));
  const ev = (name) => events().filter((e) => e.event === name);
  return { w, d: w.document, analytics, form, calls, events, ev };
}
const tick = (ms = 0) => new Promise((r) => setTimeout(r, ms));
const click = (el) => el.dispatchEvent(new window.Event('click', { bubbles: true, cancelable: true }));
const change = (el) => el.dispatchEvent(new window.Event('change', { bubbles: true }));
const pick = (el) => { el.checked = true; change(el); };
const type = (el, v) => { el.value = v; el.dispatchEvent(new window.Event('input', { bubbles: true })); };

const FORM = `
<section id="consult">
<form id="f" novalidate>
  <p data-progress-text data-template="Step {n} of {total}"></p>
  <div data-progress role="progressbar"></div>
  <p data-live aria-live="polite"></p>
  <input type="hidden" name="lead_id"><input type="hidden" name="entry_cta"><input type="hidden" name="utm_source">
  <div aria-hidden="true" style="position:absolute;left:-9999px"><label>Leave empty<input name="website" tabindex="-1" autocomplete="off"></label></div>
  <fieldset data-step="type">
    <legend>What are we working on?</legend>
    <div data-field data-error="Choose home, business or boat.">
      <label><input type="radio" name="type" value="residential" required> Home</label>
      <label><input type="radio" name="type" value="commercial" required> Business</label>
      <label><input type="radio" name="type" value="marine" required> Boat</label>
    </div>
    <button type="button" data-next hidden data-js-only>Next</button>
  </fieldset>
  <fieldset data-step="scope">
    <legend>What do you want in it?</legend>
    <fieldset data-field data-required-group data-error="Pick at least one.">
      <label><input type="checkbox" name="scope" value="audio"> Audio</label>
      <label><input type="checkbox" name="scope" value="lighting"> Lighting</label>
    </fieldset>
    <div data-show-if="type=marine" data-field>
      <label>Length <select name="length" required data-error="Pick a length."><option value="">-</option><option value="under_30">Under 30 ft</option></select></label>
    </div>
    <button type="button" data-back>Back</button><button type="button" data-next>Next</button>
  </fieldset>
  <fieldset data-step="contact">
    <legend>Contact</legend>
    <div data-field><label>Name <input id="nm" name="name" required minlength="2" data-error-required="Add your name." data-error-length="Name is too short."></label></div>
    <div data-field><label>Email <input id="em" name="email" type="email" data-required-if="contact_pref=email" data-error="That email doesn't look complete."></label></div>
    <div data-field><label>Phone <input id="ph" name="phone" type="tel" data-validate="phone" data-error="Use a 10-digit number."></label></div>
    <div data-field data-error="Choose how to reply.">
      <label><input type="radio" name="contact_pref" value="call" required> Call</label>
      <label><input type="radio" name="contact_pref" value="email" required> Email</label>
    </div>
    <div data-error-panel hidden role="alert">That didn't send. <button type="button" data-retry>Try again</button></div>
    <button type="button" data-back>Back</button>
    <button type="submit" data-busy-label="Sending…">Request my consultation</button>
  </fieldset>
  <div data-success hidden>
    <h2>Thanks, <span data-fill="name"></span>.</h2>
    <p>Type: <span data-fill="type"></span>; scope: <span data-fill="scope"></span></p>
    <p data-demo-notice hidden>Concept site: this form is not connected yet.</p>
  </div>
</form>
</section>`;

const LIVE = { endpoint: 'https://forms.test/submit', retryDelayMs: 1, timeoutMs: 200 };
const $ = (d, s) => d.querySelector(s);
const steps = (d) => [...d.querySelectorAll('[data-step]')];
const visible = (d) => steps(d).map((s) => !s.hidden);

async function fillAll(d) {
  pick($(d, '[value=residential]'));
  click($(d, '[data-step=type] [data-next]'));
  pick($(d, '[value=audio]'));
  click($(d, '[data-step=scope] [data-next]'));
  type($(d, '#nm'), 'Alex Doe');
  type($(d, '#ph'), '(561) 555-0123');
  pick($(d, '[name=contact_pref][value=call]'));
}
const submit = (d) => $(d, 'form').dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));

// ---------------- analytics.ts ----------------

test('track pushes {event, ...params} onto window.dataLayer', async () => {
  const { analytics, events } = await setup('');
  analytics.track('cta_click', { cta_id: 'hero_book' });
  assert.deepEqual(events(), [{ event: 'cta_click', cta_id: 'hero_book' }]);
});

test('track drops PII keys but keeps step_name, field_name, cta_location, has_phone', async () => {
  const { analytics, events } = await setup('');
  analytics.track('x', { name: 'Al', first_name: 'Al', email: 'e', phone: '1', zip: '33131', notes: 'n', message: 'm', website: 'w', location: 'Miami', date: 'd', step_name: 'contact', field_name: 'email', cta_location: 'hero', has_phone: true });
  assert.deepEqual(events()[0], { event: 'x', step_name: 'contact', field_name: 'email', cta_location: 'hero', has_phone: true });
});

test('track drops email-like and phone-like values under innocent keys', async () => {
  const { analytics, events } = await setup('');
  analytics.track('x', { a: 'me@x.com', b: '(305) 555-0123', c: '3055550123', d: '+1 305 555 0123', e: 3055550123, ok: 'tv,wifi', n: 4 });
  assert.deepEqual(events()[0], { event: 'x', ok: 'tv,wifi', n: 4 });
});

test('track keeps a UUID lead_id even when it contains a long digit run', async () => {
  const { analytics, events } = await setup('');
  const id = '12345678-1234-4123-8123-123456789012';
  analytics.track('form_submit', { lead_id: id });
  assert.equal(events()[0].lead_id, id);
});

test('track drops objects/arrays and truncates strings to 100 chars', async () => {
  const { analytics, events } = await setup('');
  analytics.track('x', { o: { a: 1 }, arr: ['a'], long: 'a'.repeat(150) });
  assert.deepEqual(events()[0], { event: 'x', long: 'a'.repeat(100) });
});

test('delegated [data-track] click maps id/location/type to cta_* and adds section, service, prefill_type', async () => {
  const { d, ev } = await setup(`<section id="hero"><a href="#consult" data-track="cta_click" data-track-id="hero_book" data-track-location="hero" data-track-type="primary" data-prefill-type="residential" data-service="tv"><span id="in">Book</span></a></section>`);
  click($(d, '#in'));
  assert.deepEqual(ev('cta_click'), [{ event: 'cta_click', cta_id: 'hero_book', cta_location: 'hero', cta_type: 'primary', section: 'hero', service: 'tv', prefill_type: 'residential' }]);
});

test('tel:, sms:, mailto: links fire call_click, text_click, email_click without data-track', async () => {
  const { d, events } = await setup(`<footer><a id="t" href="tel:+15615550123" data-track-id="footer_call">c</a><a id="s" href="sms:+13055550100?&body=hi">s</a><a id="m" href="mailto:x@y.z">m</a></footer>`);
  click($(d, '#t')); click($(d, '#s')); click($(d, '#m'));
  assert.deepEqual(events().map((e) => e.event), ['call_click', 'text_click', 'email_click']);
  assert.equal(events()[0].cta_id, 'footer_call');
});

test('one element, one event: tel link with data-track fires once', async () => {
  const { d, events } = await setup(`<a id="t" href="tel:+1" data-track="call_click" data-track-id="hero_call">c</a>`);
  click($(d, '#t'));
  assert.equal(events().length, 1);
});

test('extra data-track-* params are snake_cased', async () => {
  const { d, ev } = await setup(`<button id="b" data-track="faq_open" data-track-faq-id="coi">q</button>`);
  click($(d, '#b'));
  assert.equal(ev('faq_open')[0].faq_id, 'coi');
});

// ---------------- form.ts ----------------

test('init shows only step 1, reveals [data-js-only], sets progress', async () => {
  const { d, form } = await setup(FORM);
  form.initMultiStepForm($(d, 'form'), LIVE);
  assert.deepEqual(visible(d), [true, false, false]);
  assert.equal($(d, '[data-step=type] [data-next]').hidden, false);
  assert.equal($(d, '[data-progress]').getAttribute('aria-valuenow'), '1');
  assert.equal($(d, '[data-progress]').getAttribute('aria-valuemax'), '3');
  assert.equal($(d, '[data-progress-text]').textContent, 'Step 1 of 3');
});

test('Next on an invalid step shows the data-error message, links it, focuses the field, fires form_error once', async () => {
  const { d, form, ev } = await setup(FORM);
  form.initMultiStepForm($(d, 'form'), LIVE);
  click($(d, '[data-step=type] [data-next]'));
  assert.deepEqual(visible(d), [true, false, false]);
  const r = $(d, '[value=residential]');
  assert.equal(r.getAttribute('aria-invalid'), 'true');
  const err = d.getElementById(r.getAttribute('aria-describedby').split(' ').pop());
  assert.equal(err.textContent, 'Choose home, business or boat.');
  assert.equal(d.activeElement, r);
  assert.deepEqual(ev('form_error'), [{ event: 'form_error', step_name: 'type', field_name: 'type', error_type: 'required' }]);
});

test('error clears as soon as the value becomes valid', async () => {
  const { d, form } = await setup(FORM);
  form.initMultiStepForm($(d, 'form'), LIVE);
  click($(d, '[data-step=type] [data-next]'));
  assert.equal($(d, '[value=residential]').getAttribute('aria-invalid'), 'true');
  const r = $(d, '[value=marine]'); pick(r);
  assert.equal($(d, '[value=residential]').hasAttribute('aria-invalid'), false);
  assert.equal(d.querySelector('[data-error-for=type]').textContent, '');
});

test('valid Next advances, focuses the legend, announces, fires form_step; Back keeps answers and fires nothing', async () => {
  const { d, form, ev } = await setup(FORM);
  form.initMultiStepForm($(d, 'form'), { ...LIVE, params: (e, fd) => (e === 'form_step' ? { project_type: fd.get('type') } : {}) });
  const r = $(d, '[value=commercial]'); pick(r);
  click($(d, '[data-step=type] [data-next]'));
  assert.deepEqual(visible(d), [false, true, false]);
  assert.equal(d.activeElement, $(d, '[data-step=scope] legend'));
  assert.equal($(d, '[data-live]').textContent, 'Step 2 of 3: What do you want in it?');
  assert.deepEqual(ev('form_step'), [{ event: 'form_step', step_number: 1, step_name: 'type', project_type: 'commercial' }]);
  click($(d, '[data-step=scope] [data-back]'));
  assert.deepEqual(visible(d), [true, false, false]);
  assert.equal($(d, '[value=commercial]').checked, true);
  assert.equal(ev('form_step').length, 1);
});

test('form_start fires once on first interaction and writes a UUID lead_id', async () => {
  const { d, form, ev } = await setup(FORM);
  form.initMultiStepForm($(d, 'form'), LIVE);
  const r = $(d, '[value=residential]'); pick(r); change(r);
  const s = ev('form_start');
  assert.equal(s.length, 1);
  assert.equal(s[0].entry_cta, 'direct');
  assert.match($(d, '[name=lead_id]').value, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  assert.equal(s[0].lead_id, $(d, '[name=lead_id]').value);
});

test('required checkbox group needs at least one box', async () => {
  const { d, form, ev } = await setup(FORM);
  form.initMultiStepForm($(d, 'form'), LIVE);
  const r = $(d, '[value=residential]'); pick(r);
  click($(d, '[data-step=type] [data-next]'));
  click($(d, '[data-step=scope] [data-next]'));
  assert.deepEqual(visible(d), [false, true, false]);
  assert.equal(ev('form_error')[0].field_name, 'scope');
});

test('data-show-if hides and disables controls until the condition holds', async () => {
  const { d, form } = await setup(FORM);
  form.initMultiStepForm($(d, 'form'), LIVE);
  const wrap = $(d, '[data-show-if]'), sel = $(d, '[name=length]');
  assert.equal(wrap.hidden, true); assert.equal(sel.disabled, true);
  const m = $(d, '[value=marine]'); pick(m);
  assert.equal(wrap.hidden, false); assert.equal(sel.disabled, false);
  click($(d, '[data-step=type] [data-next]'));
  pick($(d, '[value=audio]'));
  click($(d, '[data-step=scope] [data-next]'));
  assert.deepEqual(visible(d), [false, true, false], 'length is required once shown');
});

test('contact-step rules: trim + minlength, email x@y.z, phone 10 digits, required-if', async () => {
  const { d, form, ev } = await setup(FORM);
  form.initMultiStepForm($(d, 'form'), LIVE);
  form.initMultiStepForm; // noop
  await fillAll(d);
  type($(d, '#nm'), '  A ');
  type($(d, '#em'), 'a@b');
  type($(d, '#ph'), '12345');
  submit(d);
  const errs = ev('form_error').map((e) => `${e.field_name}:${e.error_type}`);
  assert.deepEqual(errs, ['name:length', 'email:format', 'phone:format']);
  assert.equal($(d, '#nm').value, 'A', 'trimmed');
  assert.equal(d.getElementById($(d, '#nm').getAttribute('aria-describedby')).textContent, 'Name is too short.');
  type($(d, '#nm'), 'Al'); type($(d, '#em'), ''); type($(d, '#ph'), '+1 (561) 555-0123');
  const e = $(d, '[name=contact_pref][value=email]'); pick(e);
  submit(d);
  assert.deepEqual(ev('form_error').slice(3).map((x) => `${x.field_name}:${x.error_type}`), ['email:required']);
  type($(d, '#ph'), '(105) 555-0123');
  type($(d, '#em'), 'al@x.co');
  submit(d);
  assert.equal(ev('form_error').at(-1).field_name, 'phone', 'area code cannot start with 1');
});

test('form:prefill event sets choices without firing form_start; honeypot and id are not prefillable', async () => {
  const { d, form, ev } = await setup(FORM);
  form.initMultiStepForm($(d, 'form'), LIVE);
  d.dispatchEvent(new window.CustomEvent('form:prefill', { detail: { type: 'marine', scope: 'audio,lighting', website: 'x', lead_id: 'evil' } }));
  assert.equal($(d, '[value=marine]').checked, true);
  assert.equal($(d, '[value=audio]').checked && $(d, '[value=lighting]').checked, true);
  assert.equal($(d, '[name=website]').value, '');
  assert.equal($(d, '[name=lead_id]').value, '');
  assert.equal($(d, '[data-show-if]').hidden, false, 'show-if re-evaluated');
  assert.equal(ev('form_start').length, 0);
  assert.deepEqual(visible(d), [true, false, false], 'prefilled step still shown');
});

test('a CTA with data-prefill-* prefills, records entry from data-track-id, and focuses step 1 heading', async () => {
  const { d, form, ev } = await setup(`<a id="cta" href="#f" data-track="cta_click" data-track-id="env_marine_book" data-prefill-type="marine">Boat</a>` + FORM);
  form.initMultiStepForm($(d, 'form'), LIVE);
  click($(d, '#cta'));
  assert.equal($(d, '[value=marine]').checked, true);
  assert.equal(d.activeElement, $(d, '[data-step=type] legend'));
  const r = $(d, '[value=residential]'); pick(r);
  assert.equal(ev('form_start')[0].entry_cta, 'env_marine_book');
  assert.equal(ev('form_start')[0].prefilled, true);
  assert.equal($(d, '[name=entry_cta]').value, 'env_marine_book');
});

// Owen, 2026-10-07: a link to <main> (the skip link) or <body> contains the form but is not a
// booking CTA. Only the form itself or something up to its nearest <section> counts.
test('a skip link to <main> is not a booking CTA; a link to the form\'s section still is', async () => {
  const { d, form } = await setup(`<a id="skip" href="#main">Skip</a><a id="sec" href="#consult">Book</a><main id="main">` + FORM + `</main>`);
  form.initMultiStepForm($(d, 'form'), LIVE);
  click($(d, '#skip'));
  assert.notEqual(d.activeElement, $(d, '[data-step=type] legend'), 'skip link must not jump focus into the form');
  click($(d, '#sec'));
  assert.equal(d.activeElement, $(d, '[data-step=type] legend'));
});

// Amended 2026-10-07 (Anton, security review): URL prefill is an allowlist. Only fields named
// in Object.values(urlParams) and utm_* hidden fields; any other control, choice or not, is ignored.
test('URL query/hash prefill only touches urlParams targets and utm_* hidden fields', async () => {
  const { d, form } = await setup(FORM, { url: 'https://site.test/?service=commercial&utm_source=ig&website=x&name=Bob&lead_id=1#f?scope=lighting' });
  form.initMultiStepForm($(d, 'form'), { ...LIVE, urlParams: { service: 'type' } });
  assert.equal($(d, '[value=commercial]').checked, true);
  assert.equal($(d, '[value=lighting]').checked, false, 'scope is not a urlParams target');
  assert.equal($(d, '[name=utm_source]').value, 'ig');
  assert.equal($(d, '[name=website]').value, '');
  assert.equal($(d, '#nm').value, '');
  assert.equal($(d, '[name=lead_id]').value, '');
});

test('a crafted link can never tick consent or any checkbox/radio/select outside the urlParams allowlist', async () => {
  const consent = `<label><input type="checkbox" name="sms_consent" value="yes"> Text me</label><label><input type="checkbox" name="email_consent" value="yes"> Email me</label>`;
  const html = FORM.replace('<div data-error-panel', consent + '<div data-error-panel');
  const url = 'https://site.test/?sms_consent=yes&email_consent=yes&contact_pref=email&length=under_30&scope=audio#f?sms_consent=yes&type=marine';
  const { d, form, ev } = await setup(html, { url });
  form.initMultiStepForm($(d, 'form'), { ...LIVE, urlParams: { service: 'type' } });
  assert.equal($(d, '[name=sms_consent]').checked, false);
  assert.equal($(d, '[name=email_consent]').checked, false);
  assert.equal($(d, '[name=contact_pref][value=email]').checked, false);
  assert.equal($(d, '[name=length]').value, '');
  assert.equal($(d, '[value=audio]').checked, false);
  assert.equal($(d, '[value=marine]').checked, true, 'the allowlisted target itself is still prefillable from the hash');
  assert.equal(ev('form_start').length, 0);
});

test('without urlParams only utm_* fields are prefilled from the URL', async () => {
  const { d, form } = await setup(FORM, { url: 'https://site.test/?type=marine&utm_campaign=fall' });
  form.initMultiStepForm($(d, 'form'), LIVE);
  assert.equal($(d, '[value=marine]').checked, false);
});

test('skipPrefilledSteps opens on the first incomplete step and starts the form', async () => {
  const { d, form, ev } = await setup(`<a id="cta" href="#f" data-entry="picker" data-prefill-type="residential">Book</a>` + FORM);
  form.initMultiStepForm($(d, 'form'), { ...LIVE, skipPrefilledSteps: true, names: { entry: 'entry_point', id: 'submission_id' } });
  click($(d, '#cta'));
  assert.deepEqual(visible(d), [false, true, false]);
  assert.equal(ev('form_step').length, 0, 'skipping is not a user advance');
  assert.equal(ev('form_start')[0].entry_point, 'picker');
  assert.equal(ev('form_start')[0].prefilled, true);
  assert.ok(ev('form_start')[0].submission_id);
});

test('Enter (submit event) on a non-final step acts as Next', async () => {
  const { d, form } = await setup(FORM);
  form.initMultiStepForm($(d, 'form'), LIVE);
  const r = $(d, '[value=residential]'); pick(r);
  submit(d);
  assert.deepEqual(visible(d), [false, true, false]);
});

test('demo mode (endpoint empty): success + visible demo notice, form_submit mode demo, no POST', async () => {
  const { d, form, ev, calls } = await setup(FORM);
  form.initMultiStepForm($(d, 'form'), { endpoint: '  ', params: (e) => (e === 'form_submit' ? { scope_count: 1 } : {}) });
  await fillAll(d);
  submit(d); await tick();
  assert.equal(calls.length, 0);
  assert.equal($(d, '[data-success]').hidden, false);
  assert.equal($(d, '[data-demo-notice]').hidden, false);
  assert.equal(d.activeElement, $(d, '[data-success] h2'));
  assert.equal($(d, '[data-fill=name]').textContent, 'Alex Doe');
  assert.equal($(d, '[data-fill=type]').textContent, 'Home');
  assert.ok(steps(d).every((s) => s.hidden), 'form replaced in place');
  const s = ev('form_submit');
  assert.equal(s.length, 1);
  assert.equal(s[0].mode, 'demo');
  assert.equal(s[0].scope_count, 1);
  assert.equal(s[0].lead_id, $(d, '[name=lead_id]').value);
  assert.deepEqual(ev('form_step').map((e) => e.step_name), ['type', 'scope', 'contact'], 'final step counts as an advance');
});

test('a non-https endpoint is treated as demo mode (no PII over cleartext)', async () => {
  const { d, form, calls, ev } = await setup(FORM);
  form.initMultiStepForm($(d, 'form'), { endpoint: 'http://forms.test/x' });
  await fillAll(d); submit(d); await tick();
  assert.equal(calls.length, 0);
  assert.equal(ev('form_submit')[0].mode, 'demo');
});

test('live submit: one POST of FormData with Accept json + access_key, no honeypot, double submit ignored', async () => {
  let release;
  const gate = new Promise((r) => (release = r));
  const { d, form, calls, ev } = await setup(FORM, { fetchImpl: async () => { await gate; return { ok: true, status: 200 }; } });
  form.initMultiStepForm($(d, 'form'), { ...LIVE, accessKey: 'pub-key' });
  await fillAll(d);
  submit(d); submit(d);
  await tick();
  const btn = $(d, '[type=submit]');
  assert.equal(btn.disabled, true);
  assert.equal(btn.textContent, 'Sending…');
  assert.equal($(d, 'form').getAttribute('aria-busy'), 'true');
  release(); await tick(5);
  assert.equal(calls.length, 1);
  const { u, init } = calls[0];
  assert.equal(u, LIVE.endpoint);
  assert.equal(init.method, 'POST');
  assert.equal(init.headers.Accept, 'application/json');
  assert.equal(init.body.get('access_key'), 'pub-key');
  assert.equal(init.body.get('website'), null);
  assert.equal(init.body.get('name'), 'Alex Doe');
  assert.ok(init.body.get('lead_id'));
  assert.equal($(d, '[data-success]').hidden, false);
  assert.equal($(d, '[data-demo-notice]').hidden, true);
  assert.equal($(d, 'form').hasAttribute('aria-busy'), false);
  assert.deepEqual(ev('form_submit').map((e) => e.mode), ['live']);
  submit(d); await tick(5);
  assert.equal(calls.length, 1, 'no resubmit after success');
});

test('honeypot filled: fake success, no POST, no form_submit', async () => {
  const { d, form, calls, ev } = await setup(FORM);
  form.initMultiStepForm($(d, 'form'), LIVE);
  await fillAll(d);
  $(d, '[name=website]').value = 'spam.example';
  submit(d); await tick(5);
  assert.equal(calls.length, 0);
  assert.equal($(d, '[data-success]').hidden, false);
  assert.equal(ev('form_submit').length, 0);
});

test('time trap (minFillMs) behaves like the honeypot', async () => {
  const { d, form, calls, ev } = await setup(FORM);
  form.initMultiStepForm($(d, 'form'), { ...LIVE, minFillMs: 60_000 });
  await fillAll(d); submit(d); await tick(5);
  assert.equal(calls.length, 0);
  assert.equal(ev('form_submit').length, 0);
  assert.equal($(d, '[data-success]').hidden, false);
});

test('HTTP 500: error panel, form_submit_error, answers kept; Try again succeeds', async () => {
  const { d, form, calls, ev } = await setup(FORM, { fetchImpl: async (i) => (i === 1 ? { ok: false, status: 500 } : { ok: true, status: 200 }) });
  form.initMultiStepForm($(d, 'form'), LIVE);
  await fillAll(d); submit(d); await tick(5);
  assert.equal(calls.length, 1, 'no auto-retry on an HTTP response');
  assert.equal($(d, '[data-error-panel]').hidden, false);
  assert.deepEqual(ev('form_submit_error').map((e) => e.error_type), ['http_5xx']);
  assert.equal($(d, '#nm').value, 'Alex Doe');
  assert.equal($(d, '[type=submit]').disabled, false);
  assert.equal($(d, '[type=submit]').textContent, 'Request my consultation');
  click($(d, '[data-retry]')); await tick(5);
  assert.equal(calls.length, 2);
  assert.equal($(d, '[data-error-panel]').hidden, true);
  assert.equal($(d, '[data-success]').hidden, false);
  assert.equal(ev('form_submit').length, 1);
});

test('HTTP 4xx maps to http_4xx and honours names.submitFail', async () => {
  const { d, form, ev } = await setup(FORM, { fetchImpl: async () => ({ ok: false, status: 422 }) });
  form.initMultiStepForm($(d, 'form'), { ...LIVE, names: { submitFail: 'form_submit_fail', field: 'field' } });
  click($(d, '[data-step=type] [data-next]'));
  assert.equal(ev('form_error')[0].field, 'type');
  await fillAll(d); submit(d); await tick(5);
  assert.equal(ev('form_submit_fail')[0].error_type, 'http_4xx');
});

test('network failure retries once automatically, then succeeds', async () => {
  const { d, form, calls, ev } = await setup(FORM, { fetchImpl: async (i) => { if (i === 1) throw new TypeError('Failed to fetch'); return { ok: true, status: 200 }; } });
  form.initMultiStepForm($(d, 'form'), LIVE);
  await fillAll(d); submit(d); await tick(20);
  assert.equal(calls.length, 2);
  assert.equal(ev('form_submit').length, 1);
  assert.equal(ev('form_submit_error').length, 0);
});

test('two network failures end in the error state with error_type network', async () => {
  const { d, form, calls, ev } = await setup(FORM, { fetchImpl: async () => { throw new TypeError('Failed to fetch'); } });
  form.initMultiStepForm($(d, 'form'), LIVE);
  await fillAll(d); submit(d); await tick(20);
  assert.equal(calls.length, 2);
  assert.deepEqual(ev('form_submit_error').map((e) => e.error_type), ['network']);
});

test('timeout aborts, goes to error with error_type timeout, and is not auto-retried', async () => {
  const { d, form, calls, ev } = await setup(FORM, {
    fetchImpl: (_i, init) => new Promise((_r, rej) => init.signal.addEventListener('abort', () => rej(Object.assign(new Error('aborted'), { name: 'AbortError' })))),
  });
  form.initMultiStepForm($(d, 'form'), { ...LIVE, timeoutMs: 20 });
  await fillAll(d); submit(d); await tick(80);
  assert.equal(calls.length, 1);
  assert.deepEqual(ev('form_submit_error').map((e) => e.error_type), ['timeout']);
  assert.equal($(d, '[data-error-panel]').hidden, false);
});

test('submit with an earlier step invalidated jumps back to that step', async () => {
  const { d, form } = await setup(FORM);
  form.initMultiStepForm($(d, 'form'), LIVE);
  await fillAll(d);
  $(d, '[value=audio]').checked = false;
  submit(d); await tick();
  assert.deepEqual(visible(d), [false, true, false]);
});

test('form_view fires once when the form is 50% visible', async () => {
  const { d, form, ev, w } = await setup(FORM);
  let cb;
  globalThis.IntersectionObserver = w.IntersectionObserver = class { constructor(f, o) { cb = f; this.o = o; } observe() {} disconnect() {} };
  form.initMultiStepForm($(d, 'form'), LIVE);
  cb([{ isIntersecting: true }]); cb([{ isIntersecting: true }]);
  assert.equal(ev('form_view').length, 1);
});

test('onState hook receives each state', async () => {
  const { d, form } = await setup(FORM);
  const seen = [];
  form.initMultiStepForm($(d, 'form'), { ...LIVE, onState: (s) => seen.push(s) });
  await fillAll(d); submit(d); await tick(5);
  assert.deepEqual(seen, ['submitting', 'success']);
});
