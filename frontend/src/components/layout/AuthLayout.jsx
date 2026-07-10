import BrandMark from '../ui/BrandMark';

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-brand">
          <BrandMark size={28} />
          <span className="auth-brand-name">EvoLoop</span>
        </div>

        <div className="auth-card">
          <h1 className="auth-title">{title}</h1>
          {subtitle && <p className="auth-subtitle">{subtitle}</p>}
          {children}
        </div>

        {footer && <p className="auth-footer">{footer}</p>}
      </div>
    </div>
  );
}
