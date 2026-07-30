# AXIS Screener — Edit & Build Guide

**Never edit `app.js`.** It is a generated build artifact and will be overwritten.

## To change anything in the screener
1. Edit `src.jsx` (the single source of truth — JSX + all copy strings, EN/ES, owner/CPA modes)
2. Run `./build.sh` (requires Node.js; installs Babel locally on first run)
3. Test locally: open `index.html` in a browser (or `npx serve .`)
4. Commit **both** `src.jsx` and `app.js`, push to `main` (Netlify auto-deploys)
5. Mirror to `09-website/` in the practice repo

## Architecture
- `index.html` — thin shell: loads React 18 + ReactDOM (cdnjs UMD) + `app.js`
- `src.jsx` — application source (audience modes: default = business owner; `?ref=cpa` = CPA/attorney referral voice)
- `app.js` — Babel-compiled output shipped to browsers (no in-browser compilation)
- `build.sh` — the entire build system

## Why
Previously the site shipped babel-standalone (~1.6MB) and compiled JSX in every visitor's browser. Precompiling cut the payload ~85% and made first render near-instant, without giving up editable JSX source.
