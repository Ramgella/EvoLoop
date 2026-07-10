import { Menu } from 'lucide-react';
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useProfile } from '../../hooks/useProfile';
import Alert from '../ui/Alert';
import BrandMark from '../ui/BrandMark';
import Sidebar from './Sidebar';

export default function AppLayout() {
  const [navOpen, setNavOpen] = useState(false);
  const { status, error, reload } = useProfile();

  return (
    <div className="app-shell">
      <Sidebar open={navOpen} onClose={() => setNavOpen(false)} />
      {navOpen && <div className="sidebar-scrim" onClick={() => setNavOpen(false)} />}

      <div className="app-main">
        <div className="mobile-topbar">
          <button
            type="button"
            className="icon-button"
            onClick={() => setNavOpen(true)}
            aria-label="Open navigation"
          >
            <Menu size={18} />
          </button>
          <BrandMark size={20} />
          <span className="sidebar-brand-name">EvoLoop</span>
        </div>

        <main className="app-content">
          {status === 'error' && (
            <div className="content-alert">
              <Alert
                variant="error"
                title="Could not load your profile"
                action={
                  <button type="button" className="btn btn-secondary btn-sm" onClick={reload}>
                    Retry
                  </button>
                }
              >
                {error}
              </Alert>
            </div>
          )}
          <Outlet />
        </main>
      </div>
    </div>
  );
}
