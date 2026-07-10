import { apiRequest } from '../lib/apiClient';

export function fetchMyProfile() {
  return apiRequest('/api/profile/me');
}

export function updateMyProfile(changes) {
  return apiRequest('/api/profile/me', { method: 'PATCH', body: changes });
}
