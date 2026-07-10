const MESSAGES = [
  [/invalid login credentials/i, 'Incorrect email or password.'],
  [/email not confirmed/i, 'Please confirm your email address before signing in. Check your inbox for the confirmation link.'],
  [/user already registered|already been registered/i, 'An account with this email already exists. Try signing in instead.'],
  [/password should be at least/i, 'Password is too short.'],
  [/unable to validate email|invalid email/i, 'Please enter a valid email address.'],
  [/rate limit|too many requests|security purposes/i, 'Too many attempts. Please wait a moment and try again.'],
  [/failed to fetch|network/i, 'Could not reach the authentication server. Check your connection.'],
];

/** Convert a Supabase Auth error into a message suitable for the UI. */
export function getAuthErrorMessage(error) {
  const raw = error?.message || '';
  const match = MESSAGES.find(([pattern]) => pattern.test(raw));
  if (match) return match[1];
  return raw || 'Something went wrong. Please try again.';
}
