import { useState, useEffect } from "react";
import { PageHeader } from "../components/layout/PageHeader";
import { Card, CardTitle, CardDescription, CardSection } from "../components/ui/Card";
import {
  calendarOAuthStart,
  calendarEventsUpcoming,
} from "../api/calendar";
import { CalendarRange, RefreshCw } from "lucide-react";

function CalendarTab() {
  const [authenticated, setAuthenticated] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [oauthConfig, setOauthConfig] = useState({
    client_id: "",
    client_secret: "",
    redirect_url: "http://localhost:1420/callback",
  });

  useEffect(() => {
    if (authenticated) {
      loadEvents();
    }
  }, [authenticated]);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const eventList = await calendarEventsUpcoming(10);
      setEvents(eventList);
      setMessage(null);
    } catch (error: any) {
      setMessage(typeof error === "string" ? error : "Failed to load events");
      setAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!oauthConfig.client_id.trim()) {
      alert("Please enter your Google OAuth Client ID");
      return;
    }

    try {
      const response = await calendarOAuthStart({
        client_id: oauthConfig.client_id.trim(),
        client_secret: oauthConfig.client_secret.trim() || undefined,
        redirect_url: oauthConfig.redirect_url.trim(),
      });

      window.open(response.auth_url, "_blank");
      localStorage.setItem("oauth_code_verifier", response.code_verifier);
      localStorage.setItem("oauth_client_id", oauthConfig.client_id);
      localStorage.setItem("oauth_client_secret", oauthConfig.client_secret);
      localStorage.setItem("oauth_redirect_url", oauthConfig.redirect_url);

      setMessage(
        "OAuth flow opened in your browser. Complete the Google sign-in to continue. (Note: backend completion is still pending.)"
      );
    } catch (error: any) {
      const err = typeof error === "string" ? error : "Failed to start OAuth flow";
      setMessage(err);
      alert(err);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Calendar"
        action={authenticated ? {
          label: loading ? "Loading..." : "Refresh",
          onClick: loadEvents,
          icon: <RefreshCw className="h-4 w-4" />,
        } : undefined}
      />

      {!authenticated && (
        <Card className="space-y-4">
          <div className="flex items-start gap-3">
            <CalendarRange className="mt-1 h-5 w-5 text-primary" />
            <div>
              <CardTitle>Connect Google Calendar</CardTitle>
              <CardDescription>
                Use Google OAuth to fetch upcoming events. Backend support is still in progress, so the full sync flow is currently a stub.
              </CardDescription>
            </div>
          </div>

          <CardSection>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">OAuth Client ID *</label>
              <input
                value={oauthConfig.client_id}
                onChange={(e) => setOauthConfig({ ...oauthConfig, client_id: e.target.value })}
                placeholder="Your Google OAuth Client ID"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">OAuth Client Secret (Optional)</label>
              <input
                type="password"
                value={oauthConfig.client_secret}
                onChange={(e) => setOauthConfig({ ...oauthConfig, client_secret: e.target.value })}
                placeholder="Your Google OAuth Client Secret"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Redirect URL</label>
              <input
                value={oauthConfig.redirect_url}
                onChange={(e) => setOauthConfig({ ...oauthConfig, redirect_url: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </CardSection>

          <button
            onClick={handleConnect}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-white/90"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-4 w-4">
              <path fill="#EA4335" d="M24 9.5c3.54 0 5.97 1.54 7.35 2.83l5.4-5.26C33.46 3.5 29.28 1.5 24 1.5 14.73 1.5 6.9 7.86 4.07 16.26l6.88 5.34C12.4 14.3 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.5 24.5c0-1.59-.14-3.14-.41-4.64H24v9.27h12.7c-.55 2.96-2.22 5.47-4.73 7.17l7.35 5.69C43.8 38.45 46.5 31.95 46.5 24.5z"/>
              <path fill="#FBBC05" d="M10.95 28.38a11.96 11.96 0 0 1-.63-3.88c0-1.35.23-2.65.63-3.88l-6.88-5.34A22.39 22.39 0 0 0 1.5 24.5c0 3.58.86 6.96 2.37 9.97l7.08-5.67z"/>
              <path fill="#34A853" d="M24 46.5c6.48 0 11.93-2.14 15.9-5.83l-7.35-5.69c-2.05 1.38-4.68 2.25-8.55 2.25-6.26 0-11.57-4.17-13.5-9.92l-7.08 5.67C6.9 40.14 14.73 46.5 24 46.5z"/>
              <path fill="none" d="M1.5 1.5h45v45h-45z"/>
            </svg>
            Sign in with Google
          </button>

          <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-400">
            Heads-up: OAuth flows are still stubbed in the backend. The UI is ready, but token exchange hasn\'t been implemented yet.
          </div>
        </Card>
      )}

      {message && (
        <Card className="border-amber-500/30 bg-amber-500/10 text-sm text-amber-200">
          {message}
        </Card>
      )}

      {authenticated && (
        <Card className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Upcoming Events</CardTitle>
              <CardDescription>{events.length} events from Google Calendar</CardDescription>
            </div>
            <button
              onClick={loadEvents}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-white/10"
            >
              Refresh
            </button>
          </div>

          {events.length > 0 ? (
            <div className="space-y-3">
              {events.map((event, idx) => (
                <div key={idx} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-sm font-medium text-slate-100">{event.summary || "No Title"}</p>
                  {event.start && (
                    <p className="text-xs text-slate-400">
                      {event.start.dateTime
                        ? new Date(event.start.dateTime).toLocaleString()
                        : event.start.date}
                    </p>
                  )}
                  {event.description && (
                    <p className="mt-2 text-sm text-slate-200">{event.description}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <CardDescription>No upcoming events.</CardDescription>
          )}
        </Card>
      )}
    </div>
  );
}

export default CalendarTab;
