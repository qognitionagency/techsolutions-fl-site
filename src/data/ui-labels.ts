/**
 * COPY NEEDED (Theo): UI-chrome labels content.ts does not carry. UI-only strings: control
 * names and disclosure tags, never marketing copy. Move into content.ts and delete this file.
 *  - pause/play: WCAG 2.2.2 needs a pause control on the auto-cycling hero phone.
 *  - mainNav/footerNav: two <nav> landmarks need distinct names.
 *  - sample: the visible "Sample" label on sample neighborhood lists and prices.
 *  - stockPhoto: the disclosure tag on every stock photo (design-spec-v3 §1.3, §4.4).
 *  - stepper: accessible names for the quote stepper buttons ({field} = the field label).
 */
export const uiLabels = {
  pauseScreens: 'Pause app screens', // COPY NEEDED
  playScreens: 'Play app screens', // COPY NEEDED
  mainNav: 'Main', // COPY NEEDED
  footerNav: 'Footer', // COPY NEEDED
  sample: 'Sample', // COPY NEEDED (content.ts has quoteBuilder.estimate.sampleBadge with the same text)
  stockPhoto: 'Stock photo', // COPY NEEDED: spec §1.3 "STOCK PHOTO" tag
  decrease: 'Fewer: {field}', // COPY NEEDED
  increase: 'More: {field}', // COPY NEEDED
} as const;
