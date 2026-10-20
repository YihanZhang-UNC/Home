# Yihan Zhang — personal homepage

Live: https://yihanzhang-unc.github.io/Home/

The homepage presents current health-AI research alongside hardware, design, and art projects. Research status is described explicitly; unpublished manuscript files and restricted research assets are not part of this site.

## Edit and build

- Application source: `profile/app.jsx`
- Research summaries used by the application build: `profile/research.json`
- Page metadata, theme styles, and no-JavaScript fallback: `index.html`
- Public CV: `profile/Yihan_Zhang_CV.pdf`; editable text: `profile/Yihan_Zhang_CV.md`

With Node.js installed, run `npm ci` and `npm run build`. Commit the generated `profile/app.js` and `profile/styles.css` together with the source. GitHub Pages serves the generated files directly; visitors do not compile JSX or Tailwind at runtime.

The CV keeps the user-supplied Word template. Rebuild the editable copy with `python3 tools/build_cv.py /path/to/supplied-template.docx`, then render/export it to `profile/Yihan_Zhang_CV.pdf`. The original template is private and is not distributed here. Preview locally with `npm run preview`.

Existing project paths, including `Pluggy.html`, `CUSP/`, and previously published PDF URLs, are retained. Navigation is hash-addressable (for example `#research`, `#projects`, and `#cv`). The contact action opens the visitor's email client.
