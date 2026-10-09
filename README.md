# Silk Vision — Entropion page (staging)

Redesign of the entropion treatment page on the Silk Vision design system
(`imageworksc/silkvision-guide-md`, Ziplyft reference). The copy is the
original page's, word for word; only structure and styling changed.

Staging URL: https://imageworksc.github.io/silkvision-entropion/

## Structure

```
index.html
css/   fonts → tokens → base → components → sections → type → motion
js/main.js
fonts/  images/  favicons  .nojekyll
```

Page-specific components live at the end of `css/components.css`
("The entropion set"). No inline styles or scripts in the HTML (the only
`<script>` blocks are the JSON-LD data and the deferred `js/main.js`).
`js/main.js` is ES2015+ (`const`/`let`, arrow functions) and carries only
what this page uses: menu, scroll state, reveals, sticky call bar, FAQ.
Starter patterns this page does not use (before/after carousel, videos,
step tabs, cost, yes/no, fork, stages) were removed from CSS and JS.

## What changed from the draft

- Shared shell added: topbar, sticky header, footer, phone sticky call bar.
- Sections mapped to the system's patterns, alternating grounds; the
  "Seek prompt eye care" panel is the page's one plum band.
- Entropion vs. ectropion is now the `#compare` table.
- FAQ uses `<details name="faq">` and is mirrored in FAQPage JSON-LD.
- FAQ moved before the closing call (the closing band ends the page).
- Base64 images extracted to `images/`.
- No gradients, no inline CSS.

## Pending from the practice

- [ ] URL of the ectropion page (link in the comparison note is `#`).
- [ ] Upload the four section photos to Cloudinary (`dsjbq35es`) and swap the
      local `images/*.webp` paths, including `og:image`. The hero already
      comes from Cloudinary (the eye close-up shared with the Ziplyft page).
- [ ] Remove `<meta name="robots" content="noindex, nofollow">` at go-live.
