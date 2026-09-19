'use client';

import React, { useEffect, useState } from 'react';
import { useCustomer } from '../../lib/storeContext';
import { User, X } from '../ui/Icons';

/* Multi-colour Google "G" mark — inlined so the button has no external asset. */
function GoogleGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.02-3.7H.96v2.34A9 9 0 0 0 9 18z"/>
      <path fill="#FBBC05" d="M3.98 10.72a5.4 5.4 0 0 1 0-3.44V4.94H.96a9 9 0 0 0 0 8.12l3.02-2.34z"/>
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.46 3.44 1.35l2.58-2.58C13.47.9 11.43 0 9 0A9 9 0 0 0 .96 4.94l3.02 2.34C4.68 5.16 6.66 3.58 9 3.58z"/>
    </svg>
  );
}

const ERROR_MESSAGES = {
  bad_state:        'Your sign-in session expired. Please try again.',
  missing_code:     'Sign-in did not complete. Please try again.',
  token_exchange:   'Google sign-in failed. Please try again.',
  bad_token:        'We could not verify your Google sign-in. Please try again.',
  email_unverified: 'Your Google email address is not verified.',
  account_conflict: 'This email is already linked to another account.',
  account_exists:   'An account already exists for this email. Please contact support to enable Google sign-in.',
  not_configured:   'Google sign-in is not available right now.',
  provider_error:   'Google sign-in failed. Please try again.',
  access_denied:    'Sign-in was cancelled.',
  db_error:         'Something went wrong. Please try again in a moment.',
  session_error:    'Something went wrong. Please try again in a moment.',
};

export function AuthModal() {
  const { authOpen, closeAuth } = useCustomer();
  const [error, setError] = useState('');

  /* Surface an OAuth error passed back via ?auth_error= on the account page. */
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const code = new URLSearchParams(window.location.search).get('auth_error');
    if (code) {
      setError(ERROR_MESSAGES[code] || 'Sign-in failed. Please try again.');
      const u = new URL(window.location.href);
      u.searchParams.delete('auth_error');
      window.history.replaceState({}, '', u.pathname + u.search + u.hash);
    }
  }, []);

  function signInWithGoogle() {
    // Return the user to the page they started from (e.g. /checkout, /cart).
    // Only the path+query is sent; the server re-validates it as same-origin.
    const returnTo = window.location.pathname + window.location.search;
    // Full-page navigation is required for the OAuth redirect handshake.
    window.location.href = `/api/auth/google?returnTo=${encodeURIComponent(returnTo)}`;
  }

  if (!authOpen) return null;

  return (
    <div className="auth-modal">
      <div onClick={closeAuth} className="auth-modal__backdrop" />
      <div className="auth-modal__content">

        {/* Header gradient */}
        <div className="auth-modal__header">
          <button onClick={closeAuth} className="auth-modal__close">
            <X size={18} />
          </button>
          <div className="auth-modal__brand">
            <span className="icon-wrap"><User size={16} /></span>
            <span className="name">Amahle Blue</span>
          </div>
          <h2 className="auth-modal__title">Sign in</h2>
          <p className="auth-modal__sub">
            Continue with your Google account — no password needed.
          </p>
        </div>

        {/* Body */}
        <div className="auth-modal__body">
          <div className="auth-form">
            {error && <p className="auth-form__error">{error}</p>}
            <button type="button" onClick={signInWithGoogle} className="auth-form__btn auth-form__btn--google">
              <GoogleGlyph /> Continue with Google
            </button>
            <p className="auth-form__footer-text">
              New here? An account is created automatically on first sign-in.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthModal;
