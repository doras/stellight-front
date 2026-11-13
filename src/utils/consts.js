export const 
    STELLIVE_COLOR_DARK = "#867DDA",
    STELLARS_API_URL = "/stellars",
    SCHEDULES_API_URL = "/schedules",
    ME_API_URL = "/users/me",
    LOGIN_INFO_KEY = "loginInfo";

export const LS_SCHEDULE_PREFIX = "schedule_";
export const LS_KEY_SCHEDULE_FILTER_STELLAR_IDS = `${LS_SCHEDULE_PREFIX}filter_stellar_ids`;
export const LS_KEY_SCHEDULE_FILTER_LAST_ADDED_STELLAR_ID = `${LS_SCHEDULE_PREFIX}filter_last_added_stellar_id`;
export const LS_KEY_CALENDAR_VIEW_MODE = `${LS_SCHEDULE_PREFIX}calendar_view_mode`;
// Schema version of the settings stored in localStorage (not the app version).
// Bump it only when a migration step is added in src/utils/settingsMigration.js.
export const LS_KEY_SETTINGS_VERSION = `${LS_SCHEDULE_PREFIX}settings_version`;
export const CURRENT_SETTINGS_VERSION = 1;
// Set by the settings migration; the schedules view shows a one-time notice while it exists.
export const LS_KEY_DEFAULT_VIEW_NOTICE = `${LS_SCHEDULE_PREFIX}default_view_notice`;

export const VIEW_MODE_DEFAULT = "default";
export const VIEW_MODE_WEEKLY = "weekly";
export const VIEW_MODE_MONTHLY = "monthly";
