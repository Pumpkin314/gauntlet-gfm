const SESSION_KEY = 'gfm_session_id';

function generateUUID(): string {
  // Use crypto.randomUUID if available, otherwise fall back to manual generation
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback UUID v4 generation
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Returns a stable session ID for the current browser session.
 * Generates a UUID once per session and stores it in sessionStorage.
 * Returns an empty string during SSR.
 */
export function getSessionId(): string {
  if (typeof window === 'undefined') {
    return '';
  }

  try {
    const existing = sessionStorage.getItem(SESSION_KEY);
    if (existing) {
      return existing;
    }

    const id = generateUUID();
    sessionStorage.setItem(SESSION_KEY, id);
    return id;
  } catch {
    // sessionStorage may be unavailable (e.g. private browsing in some browsers)
    return generateUUID();
  }
}
