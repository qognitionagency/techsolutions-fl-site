/**
 * COPY NEEDED (Theo): interim UI-chrome labels content.ts does not carry.
 * WCAG 2.2.2 needs a pause control on the looping hero video; two <nav> landmarks
 * need distinct names; the neighborhood list is sample content and must say so.
 * Move these into content.ts and delete this file.
 */
export const uiLabels = {
  pauseVideo: 'Pause background video', // COPY NEEDED
  playVideo: 'Play background video', // COPY NEEDED
  mainNav: 'Main', // COPY NEEDED
  footerNav: 'Footer', // COPY NEEDED
  sample: 'Sample', // COPY NEEDED: label for the sample neighborhood list (serviceArea.sample)
} as const;
