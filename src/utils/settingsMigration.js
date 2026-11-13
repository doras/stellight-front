import {
  CURRENT_SETTINGS_VERSION,
  LS_KEY_SETTINGS_VERSION,
  LS_KEY_CALENDAR_VIEW_MODE,
  LS_KEY_DEFAULT_VIEW_NOTICE,
  LS_SCHEDULE_PREFIX,
  VIEW_MODE_DEFAULT,
} from './consts';

function hasAnyScheduleSetting() {
  for (let i = 0; i < localStorage.length; i++) {
    if (localStorage.key(i)?.startsWith(LS_SCHEDULE_PREFIX)) return true;
  }
  return false;
}

/**
 * Migrates the settings stored in localStorage to the current schema version.
 * Must run once at app start, before any component reads the settings.
 *
 * - Steps run in order, so users who skipped several releases go through every step.
 * - The current version is written on every load (also for new users), so later steps can rely on it.
 * - A stored version higher than the current one (e.g. after a rollback) is left untouched.
 * - If localStorage is not available, it does nothing (the app behaves as for a new user).
 */
export function runSettingsMigrations() {
  try {
    const storedVersion = localStorage.getItem(LS_KEY_SETTINGS_VERSION);
    const parsedVersion = parseInt(storedVersion, 10);
    // No version: a user from before the versioning, or a new user
    const version = isNaN(parsedVersion) ? 0 : parsedVersion;
    if (version > CURRENT_SETTINGS_VERSION) return;

    if (version < 1) {
      // Step 1: introduce the default view.
      // Existing users (any saved setting) are switched to it once and told where weekly/monthly went.
      // Existing users who never saved anything cannot be told apart from new users.
      if (hasAnyScheduleSetting()) {
        localStorage.setItem(LS_KEY_CALENDAR_VIEW_MODE, VIEW_MODE_DEFAULT);
        localStorage.setItem(LS_KEY_DEFAULT_VIEW_NOTICE, "1");
      }
    }

    localStorage.setItem(LS_KEY_SETTINGS_VERSION, String(CURRENT_SETTINGS_VERSION));
  }
  catch (e) {
    console.error("Failed to migrate settings in localStorage:", e);
  }
}
