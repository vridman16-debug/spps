import { Role } from './types';

export const LOCAL_STORAGE_KEYS = {
  // These keys are now used internally by apiService for its mock DB
  // or for user-specific preferences not managed by the API (like signatures).
  SIGNATURE_NAMES: 'spps_signature_names',
  CURRENT_USER_TOKEN: 'spps_current_user_token', // Stores the ID of the logged-in user
};

export const ROLES = {
  ADMIN: Role.ADMIN,
  GURU_PIKET: Role.GURU_PIKET,
};

export const INITIAL_VIOLATION_TYPES = [
  { id: 'v1', name: 'Tidak memakai topi' },
  { id: 'v2', name: 'Kaos kaki tidak sesuai' },
  { id: 'v3', name: 'Rambut tidak rapi' },
  { id: 'v4', name: 'Seragam tidak lengkap' },
  { id: 'v5', name: 'Terlambat masuk sekolah' },
  { id: 'v6', name: 'Membuang sampah sembarangan' },
];