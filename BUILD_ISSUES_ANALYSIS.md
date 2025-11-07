# Build Issues Analysis & MVP Prompt Improvements

## Summary of Issues Encountered

We encountered **10 major issues** that prevented a one-shot build. Here's what went wrong and how to prevent it:

---

## Issue 1: Tauri 2 Configuration Format
**Problem:** Used Tauri v1 config format in `tauri.conf.json`
- ❌ Used `devPath` and `distDir` in `build` section
- ❌ Missing `url` in window config
- ✅ **Fixed:** Changed to Tauri 2 format with `frontendDist` and `url` in window config

**Root Cause:** Prompt didn't specify Tauri 2 exact config format

---

## Issue 2: SQLite RETURNING Syntax Compatibility
**Problem:** Used `RETURNING id` which isn't supported in all SQLite versions
- ❌ `INSERT ... RETURNING id` (PostgreSQL-style)
- ✅ **Fixed:** Use `last_insert_rowid()` after separate INSERT

**Root Cause:** Prompt assumed PostgreSQL-style syntax would work

---

## Issue 3: TypeScript Strict Mode Errors
**Problem:** Unused imports failed TypeScript compilation
- ❌ `updateIdea`, `updateProject`, `handleCallback` imported but never used
- ✅ **Fixed:** Removed unused imports

**Root Cause:** Prompt didn't specify to avoid unused code or configure TypeScript to allow it

---

## Issue 4: Cargo Version Format Requirements
**Problem:** Incomplete version numbers in `Cargo.toml`
- ❌ `version = "2.1"` (missing patch)
- ❌ `version = "2.0"` (missing patch)
- ✅ **Fixed:** `version = "2.1.0"`, `version = "2.0.0"`

**Root Cause:** Prompt didn't specify exact version format requirements

---

## Issue 5: OAuth2 Crate Version
**Problem:** Used non-existent version
- ❌ `oauth2 = "4.5"` (doesn't exist)
- ✅ **Fixed:** `oauth2 = "5.0"`

**Root Cause:** Prompt assumed version existed without verification

---

## Issue 6: Rust Edition 2024 Incompatibility (MAJOR)
**Problem:** Dependencies required Rust edition 2024, but user had Rust 1.84.0
- ❌ `base64ct 1.8.0` required edition 2024
- ❌ `home 0.5.12` required edition 2024
- ✅ **Fixed:** 
  1. Updated Rust to 1.91.0 (supports newer features)
  2. Pinned problematic dependencies: `base64 = "0.21"`, `home = "0.5.5"`

**Root Cause:** 
- Prompt didn't specify minimum Rust version (should be 1.85+)
- Prompt didn't pin transitive dependencies
- Prompt assumed latest dependency versions would work

---

## Issue 7: Missing Icon Files
**Problem:** `tauri.conf.json` referenced icons that didn't exist
- ❌ `"icon": ["icons/32x32.png", ...]`
- ✅ **Fixed:** Disabled bundle icons for dev (`"active": false`)

**Root Cause:** Prompt didn't mention creating placeholder icons or disabling bundle

---

## Issue 8: Browser vs Tauri Context Confusion
**Problem:** User tried to use app in browser where Tauri APIs don't exist
- ❌ App loaded in browser at `localhost:1420` but commands failed
- ✅ **Fixed:** Added Tauri availability check and warning banner

**Root Cause:** Prompt didn't clarify that:
- Browser view is dev preview only
- Desktop app must be run separately
- Tauri commands only work in desktop window

---

## Issue 9: Tauri API Import Handling
**Problem:** Dynamic imports caused build warnings
- ⚠️ Mixed static/dynamic imports of `@tauri-apps/api/core`
- ✅ **Fixed:** Simplified check to avoid dynamic import in build

**Root Cause:** Prompt didn't specify how to handle Tauri API availability checks

---

## Issue 10: Package Version Mismatches
**Problem:** Tauri CLI vs API version mismatches
- ⚠️ `@tauri-apps/cli 2.9.2` but config referenced 2.1.0
- ✅ **Fixed:** Aligned versions

**Root Cause:** Prompt didn't specify version alignment between CLI and dependencies

---

## Recommended MVP Prompt Updates

### Add These Requirements:

1. **Rust Version Requirement:**
   ```
   - Rust ≥ 1.85.0 (or specify latest stable)
   - Run `rustup update stable` before building
   ```

2. **Tauri 2 Specific Config:**
   ```
   - Use Tauri 2 config format (NOT v1)
   - Window config must include `url` field
   - Use `frontendDist` not `distDir`
   ```

3. **Dependency Version Pinning:**
   ```
   - Pin all versions to exact semver (2.1.0 not 2.1)
   - Pin transitive dependencies if needed:
     * base64 = "0.21" (not 0.22)
     * home = "0.5.5" (not 0.5.12)
   ```

4. **SQLite Compatibility:**
   ```
   - Use `last_insert_rowid()` not `RETURNING id`
   - SQLite doesn't support RETURNING clause
   ```

5. **TypeScript Configuration:**
   ```
   - Either: Remove unused code
   - Or: Configure tsconfig.json to allow unused locals
   ```

6. **Icon Files:**
   ```
   - Either: Create placeholder icons
   - Or: Disable bundle icons for dev builds
   ```

7. **Browser vs Desktop Clarification:**
   ```
   - Browser at localhost:1420 is DEV PREVIEW ONLY
   - Desktop app runs in separate window via `pnpm tauri dev`
   - Production build creates standalone .exe
   ```

8. **Version Verification:**
   ```
   - Verify crate versions exist before using
   - Check oauth2 crate: use version 5.0 (not 4.5)
   ```

### Updated MVP Prompt Structure:

```
## Technical Requirements

### Rust Environment
- Rust ≥ 1.85.0 (latest stable recommended)
- Cargo ≥ 1.85.0
- Run `rustup update stable` before building

### Tauri 2 Configuration
- Use Tauri 2 config format (NOT v1)
- Window config must include `url: "http://localhost:1420"` for dev
- Use `frontendDist: "../dist"` in build config
- Disable bundle icons for initial build: `"bundle": { "active": false }`

### Dependency Versions (Exact)
- All versions must be full semver: "2.1.0" not "2.1"
- Pin these specific versions to avoid edition 2024 issues:
  * base64 = "0.21"
  * home = "0.5.5"
- OAuth2: Use version "5.0" (not 4.5)

### SQLite Compatibility
- Use `last_insert_rowid()` after INSERT (not RETURNING id)
- SQLite doesn't support RETURNING clause

### TypeScript
- Remove unused imports/code
- Or configure tsconfig.json: `"noUnusedLocals": false`

### Development vs Production
- Dev: `pnpm tauri dev` opens desktop window automatically
- Browser preview (localhost:1420) is for UI preview ONLY
- Production: `pnpm tauri build` creates standalone .exe
- Desktop app runs separately from browser
```

---

## Lessons Learned

1. **Always specify exact Rust version requirements**
2. **Pin problematic transitive dependencies**
3. **Test with actual dependency versions, don't assume**
4. **Clarify browser preview vs desktop app**
5. **Use SQLite-compatible syntax**
6. **Specify Tauri 2 (not v1) config format**
7. **Handle unused code gracefully**
8. **Verify crate versions exist**

---

## Success Criteria for One-Shot Build

✅ All these must be specified upfront:
1. Rust version requirement
2. Exact dependency versions (including pinned transitive deps)
3. Tauri 2 config format
4. SQLite syntax (no RETURNING)
5. TypeScript strict mode handling
6. Browser vs desktop clarification
7. Icon handling strategy


