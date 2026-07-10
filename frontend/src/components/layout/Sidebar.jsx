import { LogOut, X } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { NAV_ITEMS } from '../../config/navigation';
import { useAuth } from '../../hooks/useAuth';
import { useProfile } from '../../hooks/useProfile';
import BrandMark from '../ui/BrandMark';

function getInitials(name, email) {
  const source = (name || '').trim();
  if (source) {
    const parts = source.split(/\s+/);
    return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
  }
  return (email || '?')[0].toUpperCase();
}

export default function Sidebar({ open, onClose }) {
  const { user, signOut } = useAuth();
  const { profile } = useProfile();

  const displayName = profile?.full_name || user?.user_metadata?.full_name || 'Your account';
  const email = user?.email;

  return (
    <aside className={`sidebar${open ? ' sidebar-open' : ''}`} aria-label="Main navigation">
      <div className="sidebar-brand">
        <BrandMark size={22} />
        <span className="sidebar-brand-name">EvoLoop</span>
        <button
          type="button"
          className="icon-button sidebar-close"
          onClick={onClose}
          aria-label="Close navigation"
        >
          <X size={18} />
        </button>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map(({ path, label, icon: Icon, available }) => (
          <NavLink
            key={label}
            id={`nav-${label.toLowerCase()}`}
            to={path ? `/dashboard/${path}` : '/dashboard'}
            end={!path}
            onClick={onClose}
            className={({ isActive }) => `nav-item${isActive ? ' nav-item-active' : ''}`}
          >
            <Icon size={16} strokeWidth={1.8} aria-hidden="true" />
            <span>{label}</span>
            {!available && <span className="nav-badge">Soon</span>}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <span className="avatar" aria-hidden="true">
            {getInitials(profile?.full_name, email)}
          </span>
          <div className="sidebar-user-text">
            <span className="sidebar-user-name">{displayName}</span>
            <span className="sidebar-user-email">{email}</span>
          </div>
        </div>
        <button
          type="button"
          id="sidebar-sign-out"
          className="icon-button"
          onClick={signOut}
          aria-label="Sign out"
          title="Sign out"
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
}
