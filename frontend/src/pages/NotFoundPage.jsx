import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="center-page">
      <div className="center-card">
        <p className="eyebrow">404</p>
        <h1 className="auth-title">Page not found</h1>
        <p className="auth-subtitle">The page you are looking for doesn&apos;t exist.</p>
        <Link to="/dashboard" className="btn btn-primary">
          Go to dashboard
        </Link>
      </div>
    </div>
  );
}
