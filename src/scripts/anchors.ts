/**
 * In-page anchor focus (replaces the focus half of the v2 motion.ts anchor handler; scrolling is
 * native, smooth via CSS unless reduced motion). After a same-page link navigates:
 * - if a click handler already put focus inside the target (form.ts focuses the booking step
 *   legend), that focus is restored: the native fragment navigation can blur it;
 * - otherwise, if focus is still on the link or nowhere, it moves to the target, so keyboard and
 *   screen-reader users land where they went.
 */
window.addEventListener(
  'click',
  (e) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = (e.target as Element | null)?.closest?.<HTMLAnchorElement>('a[href^="#"]');
    if (!a || a.hash.length < 2) return;
    let placed: Element | null = null;
    // Registered now, during capture, so it runs after every other document click listener.
    document.addEventListener('click', () => (placed = document.activeElement), { once: true });
    window.setTimeout(() => {
      if (e.defaultPrevented) return;
      const target = document.getElementById(decodeURIComponent(a.hash.slice(1)));
      if (!target) return;
      const now = document.activeElement;
      if (now && now !== document.body && now !== a) return;
      const keep = placed && placed !== a && placed !== document.body && target.contains(placed) ? (placed as HTMLElement) : null;
      if (keep) return keep.focus({ preventScroll: true });
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    }, 0);
  },
  true,
);

