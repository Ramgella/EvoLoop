import ProfileForm from '../../components/profile/ProfileForm';
import LoadingScreen from '../../components/ui/LoadingScreen';
import PageHeader from '../../components/ui/PageHeader';
import { useAuth } from '../../hooks/useAuth';
import { useProfile } from '../../hooks/useProfile';

function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const { profile, status, saveProfile } = useProfile();

  return (
    <>
      <PageHeader title="Settings" subtitle="Manage your profile and account." />

      <section className="panel settings-section" aria-labelledby="profile-section-title">
        <div className="settings-section-intro">
          <h2 id="profile-section-title" className="panel-title">
            Profile
          </h2>
          <p className="panel-subtitle">How you present yourself professionally.</p>
        </div>
        <div className="settings-section-body">
          {status === 'loading' ? (
            <LoadingScreen label="Loading profile…" />
          ) : (
            <ProfileForm profile={profile} onSave={saveProfile} disabled={status !== 'ready'} />
          )}
        </div>
      </section>

      <section className="panel settings-section" aria-labelledby="account-section-title">
        <div className="settings-section-intro">
          <h2 id="account-section-title" className="panel-title">
            Account
          </h2>
          <p className="panel-subtitle">Sign-in details for this workspace.</p>
        </div>
        <div className="settings-section-body">
          <dl className="detail-list">
            <div>
              <dt>Sign-in email</dt>
              <dd>{user?.email}</dd>
            </div>
            <div>
              <dt>Member since</dt>
              <dd>{formatDate(profile?.created_at || user?.created_at)}</dd>
            </div>
            <div>
              <dt>Profile last updated</dt>
              <dd>{formatDate(profile?.updated_at)}</dd>
            </div>
          </dl>
          <div className="form-actions form-actions-start">
            <button type="button" id="settings-sign-out" className="btn btn-secondary" onClick={signOut}>
              Sign out
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
