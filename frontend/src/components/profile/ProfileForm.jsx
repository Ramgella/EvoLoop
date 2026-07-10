import { useEffect, useMemo, useState } from 'react';
import Alert from '../ui/Alert';
import FormField from '../ui/FormField';

const FIELDS = ['full_name', 'email', 'headline', 'bio'];
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function toFormValues(profile) {
  return Object.fromEntries(FIELDS.map((key) => [key, profile?.[key] ?? '']));
}

function validate(values) {
  const errors = {};
  if (!values.full_name.trim()) errors.full_name = 'Full name is required.';
  if (values.email.trim() && !EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = 'Enter a valid email address.';
  }
  return errors;
}

export default function ProfileForm({ profile, onSave, disabled = false }) {
  const initial = useMemo(() => toFormValues(profile), [profile]);
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null); // { type: 'success' | 'error', message }

  // Reset the form whenever a fresh profile arrives from the server.
  useEffect(() => setValues(initial), [initial]);

  const changes = useMemo(() => {
    const diff = {};
    for (const key of FIELDS) {
      if (values[key].trim() !== initial[key].trim()) diff[key] = values[key].trim();
    }
    return diff;
  }, [values, initial]);
  const isDirty = Object.keys(changes).length > 0;

  const update = (key) => (event) => {
    setValues((prev) => ({ ...prev, [key]: event.target.value }));
    setResult(null);
  };

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || !isDirty) return;

    setSaving(true);
    setResult(null);
    try {
      await onSave(changes);
      setResult({ type: 'success', message: 'Profile saved.' });
    } catch (err) {
      setResult({ type: 'error', message: err.message || 'Could not save your profile.' });
    } finally {
      setSaving(false);
    }
  }

  function handleReset() {
    setValues(initial);
    setErrors({});
    setResult(null);
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      <div className="form-grid">
        <FormField
          id="profile-full-name"
          label="Full name"
          value={values.full_name}
          onChange={update('full_name')}
          error={errors.full_name}
          maxLength={120}
          autoComplete="name"
          disabled={disabled}
        />
        <FormField
          id="profile-email"
          label="Email"
          type="email"
          value={values.email}
          onChange={update('email')}
          error={errors.email}
          hint="Contact email shown on your profile."
          autoComplete="email"
          disabled={disabled}
        />
      </div>

      <FormField
        id="profile-headline"
        label="Headline"
        value={values.headline}
        onChange={update('headline')}
        maxLength={160}
        placeholder="e.g. Backend Engineer focused on distributed systems"
        hint="One line that describes what you do."
        disabled={disabled}
      />

      <FormField
        id="profile-bio"
        label="Bio"
        multiline
        rows={5}
        value={values.bio}
        onChange={update('bio')}
        maxLength={2000}
        placeholder="A short summary of your background, interests and the work you want to be known for."
        disabled={disabled}
      />

      {result && <Alert variant={result.type}>{result.message}</Alert>}

      <div className="form-actions">
        <button
          type="button"
          id="profile-reset"
          className="btn btn-secondary"
          onClick={handleReset}
          disabled={!isDirty || saving || disabled}
        >
          Discard changes
        </button>
        <button
          type="submit"
          id="profile-save"
          className="btn btn-primary"
          disabled={!isDirty || saving || disabled}
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </form>
  );
}
