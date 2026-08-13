# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a static, single-page HTML wireframe (exported from Figma). There is no build system, package manager, dev server, linter, or test suite — `index.html` is self-contained and can be opened directly in a browser.

## Structure

- `index.html` — the entire wireframe: inline `<style>` for layout/positioning and an inline SVG. Elements are absolutely positioned within a fixed-size `.frame` container, matching the original Figma frame dimensions.
- `index.js` — empty placeholder; the wireframe has no runtime logic.
- `assets/` — empty.
