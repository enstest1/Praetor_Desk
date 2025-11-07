<p align="center">
  <img src="docs/assets/praetor-desk-banner.jpg" alt="Praetor Desk" width="720" />
</p>

<h1 align="center">Praetor Desk</h1>
<p align="center"><em>A local-first command center for tracking airdrops, projects, ideas, home tasks, and research.</em></p>

---

## íº€ Overview

Praetor Desk is a Tauri 2 desktop application built with React 18 and SQLite. It is optimised for a local-first workflow so you can plan, research, and track work without cloud dependencies. Each tab is tailored for a specific focus area and shares a consistent, modern UI built on Tailwind design tokens.

### Key Tabs

| Tab | Purpose |
| --- | --- |
| **Airdrops** | Track crypto airdrops, wallets, and daily quests with progress tracking. |
| **Projects** | Organise work into projects with quick-add tasks and status tracking. |
| **Ideas** | Capture and iterate on ideas without leaving the desk. |
| **Brainstorm** | Run Context7 âœ Exa research queries for up-to-date references. |
| **House** | Keep personal chores and home reminders in one place. |
| **Calendar** | Google OAuth calendar integration (UI ready, backend OAuth flow in progress). |

---

## í·© Tech Stack

- **Tauri 2** (Rust backend, WebView front-end shell)
- **React 18 + TypeScript** for UI
- **Tailwind-inspired tokens** for consistent theming
- **SQLite with SQLx** for local storage

---

## í³¦ Prerequisites

- [Node.js](https://nodejs.org/) 20+
- [pnpm](https://pnpm.io/) (or npm/yarn)
- [Rust](https://www.rust-lang.org/) toolchain with Cargo
- Optional: Context7 + Exa MCP servers for Brainstorm tab research

---

## âš™ï¸ Setup

```bash
pnpm install          # install dependencies
pnpm tauri dev        # run the desktop app in development
```

> **Tip:** The database is created automatically at `AppData/praetor_desk.db` (platform dependent).

---

## í´„ Building a Release

```bash
pnpm tauri build
```

The signed executable is emitted to `src-tauri/target/release/`.

---

## í³š Brainstorm (Context7 + Exa)

1. Start your MCP servers locally:
   ```bash
   # in separate terminals
   context7-mcp --port 7080
   exa-mcp --port 7081
   ```
2. Configure them inside Cursorâ€™s MCP settings (if using Cursor Agent) or point the Brainstorm tab to the endpoints directly.
3. Enter a query and click **Fetch Latest Docs** to collect responses.

---

## í³… Calendar Auth (Status)

The Calendar tab already exposes a Google-style â€œSign in with Googleâ€ button and captures OAuth credentials. The backend OAuth2 5.x flow migration is still pending, so the token exchange is currently stubbed. You can safely design and test UI layouts now; backend work will follow.

---

## í·‚ Project Structure

```
praetor-desk/
â”œâ”€â”€ src/                    # React UI
â”‚   â”œâ”€â”€ components/         # shared UI components
â”‚   â”œâ”€â”€ tabs/               # tab screens
â”‚   â”œâ”€â”€ api/                # frontend invoke wrappers
â”‚   â””â”€â”€ App.tsx             # application shell
â”œâ”€â”€ src-tauri/              # Rust backend
â”‚   â”œâ”€â”€ src/
â”‚   â”‚   â”œâ”€â”€ commands/       # Tauri commands (CRUD, OAuth, research)
â”‚   â”‚   â”œâ”€â”€ models/         # SQLx models
â”‚   â”‚   â”œâ”€â”€ database.rs     # migrations + schema
â”‚   â”‚   â””â”€â”€ oauth.rs        # OAuth helpers (stubbed)
â”‚   â””â”€â”€ Cargo.toml          # Rust dependencies
â””â”€â”€ README.md               # you are here
```

---

## í¶¼ Banner Art

The README banner is located at `docs/assets/praetor-desk-banner.jpg`. If you havenâ€™t added it yet, drop the provided artwork into that path to avoid a broken image in GitHub.

---

## í´ Contributing

1. Fork the repository
2. Create a feature branch
3. Run `pnpm tauri dev` and verify your changes
4. Commit with conventional messages
5. Submit a PR with screenshots for UI updates

---

## í³Œ Roadmap Highlights

- [ ] Complete Google OAuth2 5.x migration and token storage
- [ ] Persist Brainstorm queries + citations locally
- [ ] Add Kanban board + Omnisearch (design spec ready)
- [ ] Package icons + auto-updaters

---

## í³„ License

MIT Â© Praetor Desk Team
