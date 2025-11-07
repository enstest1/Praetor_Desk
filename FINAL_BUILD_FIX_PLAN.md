# Final Build Fix Plan - All Remaining Issues

## 🔴 Current Build Status

**Build is FAILING** due to OAuth2 5.0 API incompatibility. The crate API changed completely.

## ❌ Remaining Issues

### Issue 1: OAuth2 5.0 API Complete Break
**Problem:** OAuth2 5.0 has completely different API than 4.x
- `BasicClient::new()` signature completely changed
- `authorize_url()` method doesn't exist on client
- `exchange_code()` method doesn't exist on client
- `async_http_client` doesn't exist in `oauth2::reqwest`

**Current Errors:**
```
error[E0061]: this function takes 1 argument but 4 arguments were supplied
error[E0599]: no method named `authorize_url` found
error[E0599]: no method named `exchange_code` found  
error[E0425]: cannot find value `async_http_client` in crate `oauth2::reqwest`
```

### Issue 2: Other Minor Issues
- `ProjectStatus: FromStr` trait not implemented
- `borrow of moved value: today` in logging

---

## ✅ Solution Options

### Option A: Stub Out OAuth (RECOMMENDED for MVP)
**Quick Fix:** Comment out/disable OAuth functionality temporarily
- Remove OAuth commands from `invoke_handler`
- Return stubbed responses
- Build succeeds, app works except Calendar OAuth
- **Pros:** Build works immediately
- **Cons:** Calendar OAuth doesn't work

### Option B: Downgrade to OAuth2 4.x
**Change:** Use `oauth2 = "4.5"` (if it exists and works with Rust 1.91.0)
- **Pros:** API matches our code
- **Cons:** May have compatibility issues, crate version might not exist

### Option C: Rewrite OAuth for 5.0 API
**Change:** Completely rewrite OAuth code using OAuth2 5.0 API
- **Pros:** Uses latest version
- **Cons:** Requires learning new API, more time

---

## 🎯 Recommended Action Plan

### Step 1: Stub OAuth (Get Build Working)
1. Comment out OAuth commands in `lib.rs` invoke_handler
2. Stub the calendar functions to return errors/messages
3. Build succeeds ✅
4. App works for Airdrops, Projects, Ideas, House, Brainstorm ✅
5. Calendar tab shows "OAuth not yet implemented" message

### Step 2: Fix Other Issues
1. Fix `ProjectStatus::FromStr` implementation
2. Fix logging borrow issue

### Step 3: Re-implement OAuth Later (Optional)
- Research OAuth2 5.0 API properly
- Or use alternative OAuth library
- Or implement manual OAuth flow

---

## 📋 Implementation Checklist

**Phase 1: Get Build Working**
- [ ] Stub `calendar_oauth_start` to return error
- [ ] Stub `calendar_oauth_callback` to return error  
- [ ] Stub `calendar_events_upcoming` to return error
- [ ] Remove OAuth commands from invoke_handler (or keep stubbed)
- [ ] Fix `ProjectStatus::FromStr` 
- [ ] Fix logging borrow issue
- [ ] Test build

**Phase 2: Verify App Works**
- [ ] Build succeeds
- [ ] Executable created
- [ ] App runs
- [ ] All tabs work (except Calendar OAuth)

---

## 🚀 Quick Fix Code Changes

### Change 1: Stub OAuth Commands
```rust
// In commands/calendar.rs - replace functions with stubs
#[tauri::command]
pub async fn calendar_oauth_start(...) -> Result<OAuthStartResponse, String> {
    Err("OAuth not yet implemented. Will be added in future update.".to_string())
}
```

### Change 2: Fix ProjectStatus
```rust
// In models/project.rs
impl FromStr for ProjectStatus {
    type Err = String;
    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s.to_lowercase().as_str() {
            "active" => Ok(ProjectStatus::Active),
            "paused" => Ok(ProjectStatus::Paused),
            "completed" => Ok(ProjectStatus::Completed),
            "archived" => Ok(ProjectStatus::Archived),
            _ => Err(format!("Invalid project status: {}", s)),
        }
    }
}
```

### Change 3: Fix Logging
```rust
// In commands/airdrops.rs - fix the borrow issue
let today_str = Utc::now().format("%Y-%m-%d").to_string();
info!("phase=airdrop_task_done airdrop_id={} task_id={} date={}", airdrop_id, task_id, today_str);
```

---

## 🎯 Expected Outcome After Fixes

✅ Build compiles successfully
✅ Executable created in `src-tauri/target/release/`
✅ App runs with all tabs working
⚠️ Calendar OAuth shows "not implemented" message (can be fixed later)


