import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { fetchMyProfile, updateMyProfile } from '../services/profileService';
import { ProfileContext } from './contexts';

export function ProfileProvider({ children }) {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setStatus('loading');
    setError(null);
    try {
      setProfile(await fetchMyProfile());
      setStatus('ready');
    } catch (err) {
      if (err.status === 401) {
        await signOut();
        return;
      }
      setError(err.message);
      setStatus('error');
    }
  }, [signOut]);

  useEffect(() => {
    if (user?.id) load();
  }, [user?.id, load]);

  const saveProfile = useCallback(async (changes) => {
    const updated = await updateMyProfile(changes);
    setProfile(updated);
    return updated;
  }, []);

  const value = useMemo(
    () => ({ profile, status, error, reload: load, saveProfile }),
    [profile, status, error, load, saveProfile],
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}
