/**
 * COPY NEEDED (Theo): interim UI labels that content.ts does not carry yet.
 * They exist because WCAG 2.2.2 requires a pause control on looping video and
 * the page needs a skip link. Move these into content.ts and delete this file.
 */
export const uiLabels = {
  skipToContent: 'Skip to content', // COPY NEEDED
  pauseVideo: 'Pause background video', // COPY NEEDED
  playVideo: 'Play background video', // COPY NEEDED
  sample: 'Sample', // COPY NEEDED: label for the sample neighborhood list (serviceArea.sample)
} as const;
