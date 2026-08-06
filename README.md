# Revenue Sentinel — Control Center (public DEMO)

Static, self-contained snapshot of the Control Center UI for demonstration.

- **Read-only.** No PMS (HotelTime) or channel-manager (SiteMinder) connection.
- **Approvals is a mock** — OK/NO/counter show a sample confirmation and save nothing.
- Numbers are a frozen sandbox snapshot; they do not update.

Built by `cc_demo_build.py` on 2026-08-06 11:23. Entry point: `index.html`.
Regenerate anytime with `python3 cc_demo_build.py` (rewrites this `site/` folder only).

## Publish on GitHub Pages
This bundle lives in `site/` (the repo's `docs/` folder already holds project docs).
Classic branch-based Pages only serves `/` or `/docs`, so use one of:

- **gh-pages branch (simplest):** publish just this folder to a `gh-pages` branch root —
  `git subtree push --prefix site origin gh-pages` — then Settings → Pages → branch `gh-pages` `/root`.
- **GitHub Actions:** add a Pages workflow that uploads `./site` as the artifact.

Preview locally: `cd site && python3 -m http.server 8899` → http://127.0.0.1:8899/
