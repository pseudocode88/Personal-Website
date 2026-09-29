# Repository Guidelines

## Overview

This is the static source for `jaison.info`. Pages are plain HTML, styling is
plain CSS, and browser behavior lives in vanilla JavaScript. There is no
framework, bundler, or automated test suite.

## Project layout

- Root `*.html`: primary site pages.
- `styles/`: shared and page-specific CSS. Prefer extending the most relevant
  existing stylesheet rather than adding inline styles.
- `scripts/`: browser scripts and playlist generation tooling.
- `scripts/playlists/`: YAML playlist source files.
- `images/`, `media/`, and `favicon/`: site assets.
- `docs/`: static portfolio and supporting documents.

## Working conventions

- Keep edits small and preserve the existing vanilla HTML/CSS/JS approach.
- Match the surrounding formatting and naming conventions; do not introduce a
  framework or build step for isolated changes.
- Use root-relative asset paths when linking assets from root-level pages, and
  verify paths from nested pages such as those in `docs/`.
- Avoid modifying generated or minified files unless the corresponding source
  change requires regeneration.
- Preserve user-authored changes already present in the working tree unless the
  task explicitly concerns them.

## Playlist changes

1. Add or update the YAML source under `scripts/playlists/`.
2. Register a new playlist in the `playlists` array in
   `scripts/build_playlist.js`.
3. From `scripts/`, run `node build_playlist.js` to regenerate
   `scripts/playlist.js`.
4. Review the generated output and the playlist page in a browser.

## Verification

- For HTML or CSS changes, open the affected page locally and check desktop and
  narrow/mobile layouts.
- For JavaScript changes, exercise the changed interaction in a browser and
  check the developer console for errors.
- If dependencies are needed for playlist generation, install them with
  `npm install` from the repository root before running the script.

## Commits

- Commit only the changes relevant to the task; do not include unrelated
  working-tree changes.
- Write a concise, imperative commit subject that identifies the change (for
  example, `Add Universe page navigation`).
- Include a commit description when making a commit. Summarize what changed,
  why it changed when that is not self-evident, and the verification performed.
