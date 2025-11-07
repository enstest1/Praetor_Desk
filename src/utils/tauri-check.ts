let tauriAvailable: boolean | null = null;

export async function isTauriAvailable(): Promise<boolean> {
  if (tauriAvailable !== null) {
    return tauriAvailable;
  }

  // Check if we're in Tauri context by looking for Tauri internals
  if (typeof window !== "undefined") {
    // Tauri 2 uses __TAURI_INTERNALS__ or __TAURI_METADATA__
    const hasTauriInternals = !!(window as any).__TAURI_INTERNALS__ || !!(window as any).__TAURI_METADATA__;
    // Also check if the invoke function exists and is properly bound
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      // Check if invoke is actually callable (not just a stub)
      if (typeof invoke === "function" && hasTauriInternals) {
        tauriAvailable = true;
        return true;
      }
    } catch (error) {
      // Import failed, not in Tauri
    }
  }

  tauriAvailable = false;
  return false;
}

