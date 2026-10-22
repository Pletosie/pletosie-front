export function shouldShowPushPrompt(state: {
  authReady: boolean;
  checked: boolean;
  permission: NotificationPermission;
  supported: boolean;
  loggedIn: boolean;
  configured: boolean;
  enabled: boolean;
  dismissed: boolean;
}) {
  return (
    state.authReady &&
    state.checked &&
    state.permission === "default" &&
    state.supported &&
    (!state.loggedIn || state.configured) &&
    !state.enabled &&
    !state.dismissed
  );
}
