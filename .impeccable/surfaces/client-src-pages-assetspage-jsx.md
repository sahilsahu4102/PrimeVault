---
version: 1
slug: "client-src-pages-assetspage-jsx"
primary_target: "client/src/pages/AssetsPage.jsx"
related_targets: ["client/src/pages/LoginPage.jsx","client/src/pages/RegisterPage.jsx","client/src/pages/DashboardPage.jsx","client/src/pages/UsersPage.jsx","client/src/components/Layout/Layout.jsx"]
---

# PrimeVault: sign-in, dashboard, assets, users

Mode: Operate. Visitor: a recruiter or engineer who opens the live demo from a CV or the repo and decides in ten seconds whether the work is real; behind them, a signed-in user keeping a list of crypto-asset records and an admin managing users. Task: try it without registering (guest), sign in, scan and search the asset list, add, edit and delete records the visitor owns, and (admin) change roles. Constraints: the API host sleeps and the first request can take about a minute, so waiting is a stated state; every number is a real total from a response; no role choice on register; no admin login mentioned anywhere; the page says it is an assignment project; `price` is the asset field name; owner-or-admin permissions, dual-token auth and silent refresh are unchanged.

## Direction contract

THESIS: The asset list is set like a Swiss station departure poster, not a glass dashboard: a bold figure leads each row, columns keep a strict rhythm, and small footnote marks say who may edit what. It refuses the dark violet glass cards, gradient logo tile, hero-number tiles and emoji empty states.

OWN-WORLD: Poster yellow (#F5D000) held to the side rail and the active mark, paper ground (#FBFAF3), ink (#121212), one cancelled-train red (#D40F23) for destructive actions and errors, hairline column rules (#DDD9C6), a heavy ink rule under each table head. Archivo throughout: a width axis lets headings and figures run condensed, tabular numerals in every figure column. Square corners, no shadow, blur or gradient. State is a drawn mark plus a word: Active is a solid square, Inactive a hollow one; ownership is a solid dot (yours) or an outlined diamond (editable as admin); server state is Ready, Waking or Down, each with its own mark.

STORY: A reviewer clicks Continue as guest, lands on a populated, readable table in seconds, sees from the marks and the one-line permission notice what their role may do, and finds the API docs link. They trust it because every number is a real total, waiting is explained, and the page says plainly that it is an assignment project.

FIRST VIEWPORT: Sign-in: a yellow poster panel on the left with the wordmark and four plain facts about how the API works; on the right Continue as guest as the primary action with its terms (a temporary account, deleted after 24 hours), then the email form, the create-account link, and a service line saying whether the demo server is ready or waking. App: a yellow rail (wordmark, Dashboard, Assets, Users for admins, API docs, the signed-in name and role, Sign out), and beside it the Assets page: title, a permission sentence, a toolbar (search, category, sort, Add asset), the table with a mark column, name, category, bold right-aligned price, quantity, status, owner and actions, then the mark legend and the pager.

FORM: Station Departure Poster (assigned, index 4 of the grounded list), seed key 8705f1d3.

SIGNATURE: The mark column and its legend under the table, exactly as a timetable prints its symbol key; the legend lists only the marks that role can see. Nothing animates on entry; reduced motion is respected everywhere.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
