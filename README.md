<p align="center">
  <img src="docs/assets/praetor-desk-banner.png" alt="Praetor Desk" width="720" />
</p>

<h1 align="center">���️ Praetor Desk: Local-First Command Center for Neurospicy Operators</h1>
<p align="center"><em>Plan airdrops, manage projects, capture ideas, run research, and keep home life on track — all from a single desktop workspace.</em></p>

---

## �� Table of Contents
- [Overview](#-overview)
- [Feature Highlights](#-feature-highlights)
- [Modules](#-modules)
- [Tech Stack](#-tech-stack)
- [Setup](#-setup)
- [Daily Workflow](#-daily-workflow)
- [Architecture](#-architecture)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

---

## ��� Overview
In ancient Rome, a *Praetor* orchestrated civic order. **Praetor Desk** channels that spirit: a local-first desktop application where solopreneurs, founders, and ADHD superhumans can coordinate crypto airdrops, projects, ideas, research, and household duties without browser chaos or cloud lock-in.

Everything runs on your machine using **Tauri 2**, **React 18**, and **SQLite**. Data stays local, performance stays snappy, and each tab is purpose-built yet visually cohesive.

---

## ⚔️ Feature Highlights
- **Unified Workspace** – Six polished tabs with consistent UI patterns for quick context switching.
- **Airdrop Intelligence** – Track quests, wallet states, and task progress for every campaign.
- **Project Momentum** – Manage deliverables with inline task adds, status pills, and delightful glassmorphism.
- **Idea Vault** – Capture sparks with notes, timestamps, and low-friction entry.
- **Brainstorm Superpowers** – Run Context7 → Exa research to gather up-to-date references in a single click.
- **Household HQ** – Keep chores and reminders actionable, not floating in your head.
- **Google OAuth UI** – Ready for plug-and-play calendar sync once backend OAuth2 5.x flow is finalised.
- **Local-First SQLite** – Everything stored in `praetor_desk.db` under your OS app data directory.

---

## ��� Modules
| Tab | What it Delivers |
| --- | --- |
| **Airdrops** | Campaign cards with wallet chips, chain badges, progress bars, daily quest toggles, and upcoming task counts. |
| **Projects** | Project cards with status pills, inline task input, completion toggles, and glassmorphism UI. |
| **Ideas** | Idea grid with quick capture, optional notes, creation timestamps, and gentle deletion confirmations. |
| **Brainstorm** | Research surface with call-to-action header, textarea prompts, and rich card outputs for Context7 + Exa MCP servers. |
| **House** | Habit tracker for chores and tools — styled checkboxes, card actions, and note snippets. |
| **Calendar** | Google OAuth “Sign in with Google” experience with stubbed backend (UI is production-ready, token exchange coming soon). |

---

## ��� Tech Stack
- **Frontend:** React 18, TypeScript, Vite
- **Desktop Shell:** Tauri 2 (Rust), custom window controls
- **Styling:** Tailwind-inspired design tokens, bespoke card components, `lucide-react` icons
- **State & API:** Local React state + Tauri command invocations
- **Persistence:** SQLite via SQLx migrations (`src-tauri/src/database.rs`)
- **Research Integrations:** Context7 MCP + Exa MCP (optional)

---

## ⚙️ Setup
```bash
git clone https://github.com/enstest1/Praetor_Desk.git
cd Praetor_Desk
pnpm install              # or npm install
docs/assets/praetor-desk-banner.png  # ensure banner image is present
pnpm tauri dev            # run the app in development
```

### Database
SQLite is auto-created at app start: `AppData/Local/praetor_desk/praetor_desk.db` (platform-specific). All migrations live in `src-tauri/src/database.rs`.

### Optional MCP Servers (Brainstorm Tab)
```bash
# in separate shells
context7-mcp --port 7080
exa-mcp --port 7081
```
Then configure within the Brainstorm tab or your Cursor MCP settings.

---

## ��� Daily Workflow
1. **Airdrops Tab** – Review campaign cards, connect wallets, tick off quests.
2. **Projects Tab** – Add quick tasks, change statuses, focus on the day’s deliverables.
3. **Ideas Tab** – Capture sparks and link to later actions.
4. **Brainstorm Tab** – Run Context7 → Exa research to gather citations for content or outreach.
5. **House Tab** – Keep personal life on track with checklists.
6. **Calendar Tab** – Use Google OAuth UI (backend finishing soon) to pull upcoming events.

---

## ��� Architecture
```
praetor-desk/
├── src/                        # React UI
│   ├── components/             # Shared UI atoms & molecules
│   ├── tabs/                   # Screen modules for each workspace area
│   └── api/                    # Type-safe invoke wrappers
├── src-tauri/                  # Rust backend
│   ├── src/commands/           # Tauri command handlers (CRUD, research, OAuth stubs)
│   ├── src/models/             # SQLx structs
│   ├── src/database.rs         # Migration/runtime schema
│   └── tauri.conf.json         # Window + bundler config
└── docs/assets/                # README visuals (banner, future screenshots)
```

---

## ��� Roadmap
- [ ] Complete Google OAuth2 5.x migration + token storage.
- [ ] Persist Brainstorm queries/citations with filterable history.
- [ ] Add Kanban board + OmniSearch command palette (spec already drafted).
- [ ] Ship Windows/macOS installers with auto-update pipeline.
- [ ] Accessibility audit & keyboard shortcut palette.

---

## ��� Contributing
Pull requests welcome! Please:
1. Fork the repository.
2. Create a feature branch `git checkout -b feature/awesome`.
3. `pnpm tauri dev` and verify UI/DB changes.
4. Commit with clear messages and attach screenshots for UI tweaks.
5. Open a PR.

---

## ��� License
MIT © Praetor Desk Team

> “Order your work like a Praetor — calm, decisive, and always one step ahead.”
