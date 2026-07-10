export default function ConfigErrorPage() {
  return (
    <div className="center-page">
      <div className="center-card center-card-left">
        <p className="eyebrow">Configuration required</p>
        <h1 className="auth-title">Supabase is not configured</h1>
        <p className="auth-subtitle">
          The frontend could not find its Supabase credentials. Create{' '}
          <code>frontend/.env</code> from <code>frontend/.env.example</code> and set:
        </p>
        <pre className="code-block">
          {`VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon or publishable key>
VITE_API_URL=http://localhost:8000`}
        </pre>
        <p className="auth-subtitle">Then restart the dev server.</p>
      </div>
    </div>
  );
}
