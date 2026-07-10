import { useId } from 'react';

/**
 * Labelled input/textarea with optional hint, error and character counter.
 */
export default function FormField({
  label,
  hint,
  error,
  multiline = false,
  maxLength,
  value = '',
  id: providedId,
  ...inputProps
}) {
  const generatedId = useId();
  const id = providedId || generatedId;
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ');
  const Control = multiline ? 'textarea' : 'input';

  return (
    <div className={`field${error ? ' field-invalid' : ''}`}>
      <div className="field-label-row">
        <label htmlFor={id} className="field-label">
          {label}
        </label>
        {maxLength && multiline && (
          <span className="field-counter">
            {value.length}/{maxLength}
          </span>
        )}
      </div>
      <Control
        id={id}
        className="input"
        value={value}
        maxLength={maxLength}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy || undefined}
        {...inputProps}
      />
      {hint && !error && (
        <p id={`${id}-hint`} className="field-hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="field-error">
          {error}
        </p>
      )}
    </div>
  );
}
