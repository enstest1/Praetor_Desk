# Build Fix Plan - OAuth2 5.0 API Migration

## 🔴 Critical Issues Identified

### Issue 1: OAuth2 5.0 API Breaking Changes
**Problem:** OAuth2 crate version 5.0 has completely different API than 4.x

**Errors:**
1. `BasicClient::new()` signature changed - now only takes `ClientId`
2. `PkceCodeVerifier::new_random()` doesn't exist
3. `authorize_url()` method not found
4. `exchange_code()` method not found
5. Builder pattern required instead of direct method calls

### Issue 2: String Reference Issues
- `encrypt_token(&t)` where `t` is `&str` - needs `&String` or `t.as_str()`

---

## ✅ Fix Plan

### Step 1: Update OAuth2 Client Creation (oauth.rs)
**Current (broken):**
```rust
let mut client = BasicClient::new(
    ClientId::new(client_id),
    client_secret.map(ClientSecret::new),
    auth_url,
    Some(token_url),
)
.set_redirect_uri(redirect_url);
```

**Fixed (OAuth2 5.0):**
```rust
let mut client = BasicClient::new(ClientId::new(client_id))
    .set_client_secret(client_secret.map(ClientSecret::new))
    .set_auth_url(auth_url)
    .set_redirect_uri(redirect_url)
    .set_token_url(Some(token_url));
```

### Step 2: Fix PKCE Generation (oauth.rs)
**Current (broken):**
```rust
let verifier = PkceCodeVerifier::new_random();
```

**Fixed (OAuth2 5.0):**
```rust
use oauth2::PkceCodeVerifier;
use rand::Rng;

let verifier = PkceCodeVerifier::new(
    rand::thread_rng()
        .sample_iter(&rand::distributions::Alphanumeric)
        .take(128)
        .map(char::from)
        .collect()
);
```

### Step 3: Fix Calendar OAuth Flow (commands/calendar.rs)
**Current (broken):**
```rust
let (auth_url, _csrf_token) = client
    .authorize_url(oauth2::CsrfToken::new_random)
    .add_scope(...)
    .set_pkce_challenge(pkce_challenge)
    .url();
```

**Fixed (OAuth2 5.0):**
```rust
use oauth2::AuthorizationRequest;

let (auth_url, _csrf_token) = client
    .authorize_url(oauth2::CsrfToken::new_random)
    .add_scope(...)
    .set_pkce_challenge(pkce_challenge)
    .build();
```

### Step 4: Fix Token Exchange (commands/calendar.rs)
**Current (broken):**
```rust
let token_result = client
    .exchange_code(code)
    .set_pkce_verifier(pkce_verifier)
    .request(...);
```

**Fixed (OAuth2 5.0):**
```rust
let token_result = client
    .exchange_code(code)
    .set_pkce_verifier(pkce_verifier)
    .request_async(oauth2::reqwest::async_http_client)
    .await?;
```

### Step 5: Fix String Reference (commands/calendar.rs)
**Current (broken):**
```rust
let encrypted_refresh = refresh_token.map(|t| encrypt_token(&t));
```

**Fixed:**
```rust
let encrypted_refresh = refresh_token.as_ref().map(|t| encrypt_token(t));
```

---

## 📋 Implementation Checklist

- [ ] Update `src-tauri/src/oauth.rs`:
  - [ ] Fix `BasicClient::new()` builder pattern
  - [ ] Fix `PkceCodeVerifier` generation with rand
  - [ ] Update imports

- [ ] Update `src-tauri/src/commands/calendar.rs`:
  - [ ] Fix `authorize_url()` to use builder pattern
  - [ ] Fix `exchange_code()` to use async request
  - [ ] Fix string reference in `encrypt_token` call
  - [ ] Update imports

- [ ] Add `rand` crate dependency if not already present
- [ ] Test build after fixes

---

## 🔄 Alternative: Downgrade OAuth2 (If API too complex)

If OAuth2 5.0 API is too complex, we can:
1. Use OAuth2 4.x (if compatible with Rust 1.91.0)
2. Or use a simpler OAuth library
3. Or stub out OAuth for now and implement later

**Recommendation:** Fix the API calls (OAuth2 5.0 is the current version)

---

## 🎯 Expected Outcome

After fixes:
- ✅ Build compiles successfully
- ✅ OAuth functions work with new API
- ✅ Executable created in `src-tauri/target/release/`


