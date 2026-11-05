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
  "When to Seek Immediate Eye Care" panel is the page's one plum band.
- Entropion vs. ectropion is now the `#compare` table.
- FAQ uses `<details name="faq">` and is mirrored in FAQPage JSON-LD.
- FAQ moved before the closing call (the closing band ends the page).
- Base64 images extracted to `images/`.
- No gradients, no inline CSS.

## Running inside Drupal

The live page sits in a field of the silkvision.net theme, not on its own.
These rules keep it measuring the same in both places:

- `1rem = 10px`. The theme sets `html { font-size: 62.5% }`, and `base.css`
  sets the same value, so staging matches. Media queries stay on the
  browser's 16px, so `48rem` in a query still means 768px.
- The page wrapper is `#sv-main`. Never use `id="main"` or the class
  `section`: the theme caps both at 1000px.
- `#sv-main` clears floats. The theme's main menu hangs 4px below the header
  and would otherwise narrow the hero.
- Anything the page adds to the field needs the `html-wrapper` class, or the
  theme recolours its links. `main` and `.sticky-cta` both carry it.
- Element-level rules are scoped with `:where(.field-html-code)`, so they
  don't reach the site's header and footer. `index.html` has the same
  wrapper. Keep it inside `:where()` so no `!important` is needed.
- No inline width patches in the field. If one seems needed, the fix belongs
  in these files.

Before handing off a page, test it inside a copy of the live page, at
390, 768, 1440, 1920 and 2560 wide. Staging alone won't show these conflicts.

## Pending from the practice

- [ ] URL of the ectropion page (link in the comparison note is `#`).
- [ ] Upload the four section photos to Cloudinary (`dsjbq35es`) and swap the
      local `images/*.webp` paths, including `og:image`. The hero already
      comes from Cloudinary (the eye close-up shared with the Ziplyft page).
- [ ] Remove `<meta name="robots" content="noindex, nofollow">` at go-live.
