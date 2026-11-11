---
name: PrimeVault
description: A crypto asset manager set like a Swiss station departure poster: poster-yellow rail, ink on paper, bold figures, footnote marks that say who may edit what.
colors:
  yellow: "#f5d000"
  yellow-hover: "#ffe14d"
  paper: "#fbfaf3"
  paper-sunk: "#f1efe2"
  entry: "#fffef9"
  ink: "#121212"
  ink-secondary: "#3f3e3a"
  ink-muted: "#66645c"
  rule: "#d9d5c0"
  row-hover: "#fff4b0"
  red: "#c4101f"
  red-wash: "#fdeeea"
typography:
  display:
    fontFamily: "Archivo, Arial Narrow, system-ui, sans-serif"
    fontSize: "clamp(2.125rem, 4.2vw, 3rem)"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.01em"
  poster:
    fontFamily: "Archivo, Arial Narrow, system-ui, sans-serif"
    fontSize: "clamp(2.5rem, 5.2vw, 4.5rem)"
    fontWeight: 800
    lineHeight: 0.95
  headline:
    fontFamily: "Archivo, Arial Narrow, system-ui, sans-serif"
    fontSize: "1.375rem"
    fontWeight: 800
    lineHeight: 1.15
  title:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 650
    lineHeight: 1.25
  body:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 700
    lineHeight: 1.5
  figure:
    fontFamily: "Archivo, Arial Narrow, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 800
    lineHeight: 1.25
rounded:
  none: "0px"
spacing:
  rail: "248px"
  page-gutter: "40px"
  row: "56px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.title}"
    rounded: "{rounded.none}"
    padding: "0 20px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.yellow}"
    textColor: "{colors.ink}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "0 20px"
    height: "44px"
  button-danger:
    backgroundColor: "transparent"
    textColor: "{colors.red}"
    rounded: "{rounded.none}"
    padding: "0 20px"
    height: "44px"
  field:
    backgroundColor: "{colors.entry}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "0 12px"
    height: "44px"
  nav-link:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "0 12px"
    height: "44px"
  nav-link-active:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.yellow}"
  notice:
    backgroundColor: "{colors.entry}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "12px 14px"
---

# Design System: PrimeVault

## Overview

**Creative North Star: "The Departure Poster"**

A Swiss station posts its departures on a yellow sheet: black grotesk, strict columns, a bold figure leading every row, and a key of small footnote marks at the foot. PrimeVault sets its asset list the same way. The world was chosen by the project owner from a rolled hand, and it replaces the earlier dark violet glass dashboard completely. It lends type, palette, density and one signature move; the navigation, controls and page structure stay the standard ones a user of any admin tool already knows.

The system is flat and legible. Yellow is held to the side rail and the active tab. Everything you read is ink on paper. Red appears only for refusal and error. Nothing glows, blurs, floats or casts a shadow; structure is a heavy rule under a table head and hairlines between rows. State is a drawn mark plus a word, so the interface survives greyscale.

**Key Characteristics:**
- A poster-yellow rail carries the wordmark, navigation and the signed-in user; the page beside it is paper.
- Archivo throughout; its width axis runs headings and figures condensed, tabular numerals everywhere a number is read.
- The mark column: a solid dot means yours, an outlined diamond means editable as admin, nothing means view only. A legend under the table prints the key, listing only the marks that role can see.
- A single vocabulary of drawn state marks: solid square (active, ready), ring (inactive), dashed ring (waking, checking), struck square (down).
- Every slow or failed request has a stated state: the sleeping demo server is announced with the real wait, and no button is left hanging.
- Square corners, no shadow, no gradient, no blur.

## Colors

A poster yellow, warm paper, near-black ink, and one red.

### Primary
- **Poster Yellow** (#f5d000): the side rail, the poster panel on the sign-in page, the focus fill of a hovered primary button, and the active mark in the pager. All text on it is ink (12.4:1).

### Secondary
- **Refusal Red** (#c4101f): destructive actions, validation errors, an unreachable server. 5.8:1 on paper. Red text sits on paper or red-wash only.

### Neutral
- **Paper** (#fbfaf3): the page ground.
- **Paper Sunk** (#f1efe2): the waking notice, disabled controls, loading bars.
- **Entry** (#fffef9): typing fields and notices, a touch lighter than the paper.
- **Ink** (#121212): text, rules, the primary button, the active tab.
- **Ink Secondary** (#3f3e3a): supporting text and labels (10.2:1 on paper).
- **Ink Muted** (#66645c): hints, descriptions and placeholders (5.7:1 on paper).
- **Rule** (#d9d5c0): hairlines between rows, never an outer edge.
- **Row Hover** (#fff4b0): the hovered table row, a pale echo of the poster.
- **Yellow Hover** (#ffe14d): a hovered rail link.
- **Red Wash** (#fdeeea): the inline delete confirmation row.

### Named Rules
**The Yellow-Stays-on-the-Rail Rule.** Yellow is a shell colour, not an accent to scatter. It never fills a card or a table, and text on it is always ink.

**The Rationed Red Rule.** Red marks refusal and error only. A destructive button is red; a neutral one never is.

## Typography

**Display, heading and body font:** Archivo (variable: weight 100–900, width 62–125), with Arial Narrow and the system sans as fallbacks.

**Character:** a plain grotesk that can be run narrow, the way a timetable's headings are. Width does the work that a second typeface would otherwise do.

### Hierarchy
- **Poster** (800, width 68%, clamp(2.5rem, 5.2vw, 4.5rem), 0.95): the sign-in headline.
- **Display** (800, width 78%, clamp(2.125rem, 4.2vw, 3rem), 1): page titles.
- **Headline** (800, width 85%, 1.375rem): section titles and the guest door.
- **Title** (650, 1rem): asset names, buttons, nav links.
- **Body** (400, 0.9375rem, 1.5): everything read.
- **Label** (700, width 92%, 0.875rem, sentence case, untracked): field labels, table heads, the divider word.
- **Figure** (800, width 88%, 1.0625rem, tabular): prices, always right-aligned and always bold; totals are larger.

### Named Rules
**The Tabular Rule.** Every column of numbers uses tabular figures and is right-aligned, so digits line up by place.

**The Measure Rule.** Prose never runs wider than about 68 characters.

## Layout

A 248px rail on the left and a page of up to 1180px with 40px gutters (16px on a phone). Under 860px the rail becomes a top bar: wordmark and Sign out on the first row, the navigation on the second, scrolling sideways inside itself if it must. Tables are fixed-layout columns on a desktop and, under 760px, each row becomes a small grid block (name and price, then category, quantity and status, then owner and actions) while keeping its table roles for assistive technology. The sign-in page is two halves on a desktop (the yellow poster, then the guest door and form); on a phone the order is wordmark, headline, the guest door and form, then the plain facts.

## Elevation & Depth

Flat. There are no shadows, blurs or layers. Depth is a rule: a 3px ink rule under a table head, 1px hairlines between rows, a 3px ink rule over the rail's user block.

### Named Rules
**The Ruled-Not-Raised Rule.** Separate with a rule and group with a border; never lift with a shadow.

## Shapes

Square corners (0px) everywhere. Fields and outline buttons carry a 1.5px or 2px ink border. A disabled control swaps its border for a dashed one and its fill for paper-sunk, so disabled never relies on a dimmed colour alone. An invalid field has a dashed 2px red border plus a message.

## Components

### Buttons
- **Shape:** square, 44px high (36px small), a bold 1rem label.
- **Primary:** ink fill, paper text; hover flips to yellow with ink text.
- **Outline:** transparent with a 2px ink border; hover fills ink.
- **Danger:** the outline in red; hover fills red with paper text.
- **Icon:** 36px square, used for edit and delete, always carrying an aria-label naming the row.

### Navigation
A vertical list in the rail: icon, label, 44px high. The current page is an ink block with yellow text. The API docs link opens in a new tab and says so for screen readers.

### Table (the timetable)
A heavy 3px ink rule under the head; 56px rows with a 1px rule; the hovered row turns pale yellow. Columns: mark, name (with a one-line description), category, price, quantity, status, owner, actions. Sortable heads are real buttons with `aria-sort`. Loading, empty and error rows keep the height of real rows.

### Marks
Drawn inline SVG, 14px: solid dot (yours), outlined diamond (editable as admin), solid square (active, ready), ring (inactive), dashed ring (waking or checking), struck square (down). Each one appears next to a word or a legend entry.

### Notices
A bordered entry-coloured box with a mark at its left. A waking notice has a dashed border and paper-sunk fill; an error notice has a 2px red border. Notices are announced with role status or alert.

### Fields
- **Style:** entry fill, 1.5px ink border, ink text, labels above in the label style, hints in muted ink.
- **Focus:** a 3px ink outline offset 2px, the same ring everywhere.
- **Error:** dashed red border and a red message tied to the field with aria-describedby.

### Pager
A bordered square per page with an ellipsis for gaps; the current page is ink with yellow text. It says "Showing 11 to 20 of 65 assets" in words.

## Do's and Don'ts

### Do:
- **Do** keep yellow on the rail, the poster panel and hover fills only, with ink text.
- **Do** carry state as a drawn mark plus a word, and print a legend for any mark.
- **Do** count every figure from a real response, and show n/a when a request failed.
- **Do** give every slow request a visible, honest message and every failure a way to retry.
- **Do** say plainly that it is an assignment project.

### Don't:
- **Don't** add gradients, glass, blur, glow or shadows.
- **Don't** use a modal for a task that needs no interruption: adding and editing an asset are pages; deleting asks inline.
- **Don't** build cards of icon, heading and text, or a row of big-number tiles.
- **Don't** invent users, metrics or accuracy figures, and never mention an admin login.
- **Don't** colour a status by hue alone.
