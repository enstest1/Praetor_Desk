use log::info;
use tauri::State;
use sqlx::SqlitePool;
use chrono::Utc;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

// OAuth imports commented out - stubbed for now
// use crate::oauth::{create_google_oauth_client, generate_pkce, encrypt_token, decrypt_token};
// use crate::models::OAuthToken;
// use oauth2::{AuthorizationCode, PkceCodeVerifier, Scope};

#[derive(Debug, Serialize)]
pub struct OAuthStartResponse {
    pub auth_url: String,
    pub code_verifier: String,
}

#[tauri::command]
pub async fn calendar_oauth_start(
    _state: State<'_, crate::AppState>,
    _client_id: String,
    _client_secret: Option<String>,
    _redirect_url: String,
) -> Result<OAuthStartResponse, String> {
    info!("phase=calendar_oauth_start");
    
    // TODO: OAuth2 5.0 API migration needed - stubbed for now
    Err("Google Calendar OAuth not yet implemented. OAuth2 5.0 API migration required.".to_string())
    
    // Original implementation (commented out - needs OAuth2 5.0 API):
    // let client = create_google_oauth_client(client_id, client_secret, redirect_url.clone());
    // let (pkce_verifier, pkce_challenge) = generate_pkce();
    // let verifier_str = pkce_verifier.secret().clone();
    // let (auth_url, _csrf_token) = client
    //     .authorize_url(oauth2::CsrfToken::new_random)
    //     .add_scope(Scope::new("https://www.googleapis.com/auth/calendar.readonly".to_string()))
    //     .add_scope(Scope::new("https://www.googleapis.com/auth/calendar.events".to_string()))
    //     .set_pkce_challenge(pkce_challenge)
    //     .url();
    // Ok(OAuthStartResponse {
    //     auth_url: auth_url.to_string(),
    //     code_verifier: verifier_str,
    // })
}

#[derive(Debug, Deserialize)]
pub struct OAuthCallbackRequest {
    pub code: String,
    pub code_verifier: String,
    pub client_id: String,
    pub client_secret: Option<String>,
    pub redirect_url: String,
}

#[tauri::command]
pub async fn calendar_oauth_callback(
    _state: State<'_, crate::AppState>,
    _req: OAuthCallbackRequest,
) -> Result<(), String> {
    // TODO: OAuth2 5.0 API migration needed - stubbed for now
    Err("Google Calendar OAuth callback not yet implemented.".to_string())
}

#[tauri::command]
pub async fn calendar_events_upcoming(
    _state: State<'_, crate::AppState>,
    _max_results: Option<u32>,
) -> Result<Vec<serde_json::Value>, String> {
    // TODO: OAuth2 5.0 API migration needed - stubbed for now
    Err("Google Calendar OAuth not yet implemented. Please authenticate first.".to_string())
}

