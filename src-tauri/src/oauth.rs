// OAuth2 module - stubbed for OAuth2 5.0 API migration
// TODO: Re-implement when OAuth2 5.0 API is properly understood

use oauth2::ClientId;
use oauth2::basic::BasicClient;

/// Create Google OAuth client - STUBBED
/// TODO: OAuth2 5.0 API migration needed
pub fn create_google_oauth_client(
    _client_id: String,
    _client_secret: Option<String>,
    _redirect_url: String,
) -> BasicClient {
    // Stubbed - OAuth2 5.0 API migration required
    // This function is not currently used since calendar commands are stubbed
    // Creating a minimal client just to satisfy the type system
    BasicClient::new(ClientId::new("stub".to_string()))
}
