import { invoke } from "@tauri-apps/api/core";

export interface OAuthStartResponse {
  auth_url: string;
  code_verifier: string;
}

export async function calendarOAuthStart(data: {
  client_id: string;
  client_secret?: string;
  redirect_url: string;
}): Promise<OAuthStartResponse> {
  return invoke("calendar_oauth_start", data);
}

export async function calendarOAuthCallback(data: {
  code: string;
  code_verifier: string;
  client_id: string;
  client_secret?: string;
  redirect_url: string;
}): Promise<void> {
  return invoke("calendar_oauth_callback", { req: data });
}

export async function calendarEventsUpcoming(maxResults?: number): Promise<any[]> {
  return invoke("calendar_events_upcoming", { max_results: maxResults });
}


