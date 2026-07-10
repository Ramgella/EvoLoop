import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/layout/AuthLayout';
import Alert from '../../components/ui/Alert';
import FormField from '../../components/ui/FormField';
import { useAuth } from '../../hooks/useAuth';
import { getAuthErrorMessage } from '../../lib/authErrors';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

function validate({ fullName, email, password }) {
  const errors = {};
  if (!fullName.trim()) errors.fullName = 'Enter your full name.';
  if (!EMAIL_PATTERN.test(email.trim())) errors.email = 'Enter a valid email address.';
  if (password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  return errors;
}

export default function SignupPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [values, setValues] = useState({ fullName: '', email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmationSentTo, setConfirmationSentTo] = useState('');

  const update = (key) => (event) => setValues((prev) => ({ ...prev, [key]: event.target.value }));

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    const errors = validate(values);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    try {
      const email = values.email.trim();
      const { needsConfirmation } = await signUp({
        fullName: values.fullName.trim(),
        email,
        password: values.password,
      });
      if (needsConfirmation) {
        setConfirmationSentTo(email);
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (confirmationSentTo) {
    return (
      <AuthLayout
        title="Confirm your email"
        footer={
          <>
            Already confirmed? <Link to="/login">Sign in</Link>
          </>
        }
      >
        <Alert variant="success">
          We sent a confirmation link to <strong>{confirmationSentTo}</strong>. Open it to activate
          your account, then sign in.
        </Alert>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start building a clear record of your professional growth."
      footer={
        <>
          Already have an account? <Link to="/login">Sign in</Link>
        </>
      }
    >
      <form className="form" onSubmit={handleSubmit} noValidate>
        {error && <Alert variant="error">{error}</Alert>}

        <FormField
          id="signup-full-name"
          label="Full name"
          autoComplete="name"
          value={values.fullName}
          onChange={update('fullName')}
          error={fieldErrors.fullName}
          maxLength={120}
          autoFocus
        />
        <FormField
          id="signup-email"
          label="Email"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={update('email')}
          error={fieldErrors.email}
        />
        <FormField
          id="signup-password"
          label="Password"
          type="password"
          autoComplete="new-password"
          value={values.password}
          onChange={update('password')}
          error={fieldErrors.password}
          hint={`At least ${MIN_PASSWORD_LENGTH} characters.`}
        />

        <button
          type="submit"
          id="signup-submit"
          className="btn btn-primary btn-block"
          disabled={submitting}
        >
          {submitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>
    </AuthLayout>
  );
}
