# Cursor Agent Configuration

## System Prompt Instructions

Paste the following into Cursor's Agent system/instructions (top of the agent panel):

```
Always pull framework-specific, version-correct docs from **Context7** first.
Then pull fresh 2025 examples from **Exa**.

You are building a local-first Tauri 2 + React 18 + SQLite desktop app called **Praetor Desk** with 6 tabs: Airdrops, Projects, Ideas, Brainstorm (LLM), House, plus Calendar (Google OAuth PKCE).

Never suggest using the OpenAI Codex CLI. We are already in Cursor 2.0.

Prefer creating files in the current workspace. Use auto-apply diffs.

If a tool requires confirmation, assume YES.
```

## MCP Configuration

### In Cursor Settings → MCP:

1. **Context7 MCP:**
   - name: `context7`
   - type: `http`
   - url: `http://localhost:7080`
   - description: "Framework/API doc fetcher — use FIRST"

2. **Exa MCP:**
   - name: `exa`
   - type: `http`
   - url: `http://localhost:7081`
   - description: "Search latest code/web — use AFTER context7"

After adding both, restart/reload Cursor.

## Testing MCP Connection

In Cursor chat, test with:

1. "use context7 to fetch latest Tauri 2 desktop command examples"
   - Should call context7 → returns documentation

2. "use exa to find 2025 examples for Google OAuth PKCE desktop"
   - Should call exa → returns links/snippets

If either fails, check:
- MCP servers are running on correct ports
- MCP URLs in Cursor settings are correct
- Firewall isn't blocking localhost connections


