/**
 * Profile Store
 *
 * Manages user profiles persisted in LocalStorage.
 * Profiles include personal info and cuisine preferences.
 *
 * TODO: Replace LocalStorage with backend API
 * - Create user accounts with authentication
 * - Store profiles in database (e.g., PostgreSQL, MongoDB)
 * - Sync preferences across devices
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Profile, CuisineType, CuisinePreferences } from '@/types';
import { generateId, generateAvatarSvg } from '@/utils/helpers';

interface ProfileState {
  profiles: Profile[];
  currentProfileId: string | null;

  // Actions
  createProfile: (data: {
    name: string;
    phone: string;
    age: number;
    avatar?: string;
    cuisinePreferences?: CuisinePreferences;
  }) => Profile;
  updateProfile: (id: string, data: Partial<Omit<Profile, 'id' | 'createdAt'>>) => void;
  deleteProfile: (id: string) => void;
  setCurrentProfile: (id: string | null) => void;
  getProfile: (id: string) => Profile | undefined;
  getProfileByPhone: (phone: string) => Profile | undefined;
  setCuisinePreference: (profileId: string, cuisine: CuisineType, value: number) => void;
  setAvatar: (profileId: string, avatar: string, type: 'generated' | 'uploaded') => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      profiles: [],
      currentProfileId: null,

      createProfile: (data) => {
        const id = generateId();
        const now = Date.now();
        const avatar = data.avatar || generateAvatarSvg(data.name);

        const newProfile: Profile = {
          id,
          name: data.name,
          phone: data.phone,
          age: data.age,
          avatar,
          avatarType: data.avatar ? 'uploaded' : 'generated',
          cuisinePreferences: data.cuisinePreferences || {},
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          profiles: [...state.profiles, newProfile],
        }));

        return newProfile;
      },

      updateProfile: (id, data) =>
        set((state) => ({
          profiles: state.profiles.map((profile) =>
            profile.id === id
              ? { ...profile, ...data, updatedAt: Date.now() }
              : profile
          ),
        })),

      deleteProfile: (id) =>
        set((state) => ({
          profiles: state.profiles.filter((profile) => profile.id !== id),
          currentProfileId:
            state.currentProfileId === id ? null : state.currentProfileId,
        })),

      setCurrentProfile: (id) =>
        set({
          currentProfileId: id,
        }),

      getProfile: (id) => {
        return get().profiles.find((profile) => profile.id === id);
      },

      getProfileByPhone: (phone) => {
        const normalizedPhone = phone.replace(/\D/g, '');
        return get().profiles.find(
          (profile) => profile.phone.replace(/\D/g, '') === normalizedPhone
        );
      },

      setCuisinePreference: (profileId, cuisine, value) =>
        set((state) => ({
          profiles: state.profiles.map((profile) =>
            profile.id === profileId
              ? {
                  ...profile,
                  cuisinePreferences: {
                    ...profile.cuisinePreferences,
                    [cuisine]: value,
                  },
                  updatedAt: Date.now(),
                }
              : profile
          ),
        })),

      setAvatar: (profileId, avatar, type) =>
        set((state) => ({
          profiles: state.profiles.map((profile) =>
            profile.id === profileId
              ? {
                  ...profile,
                  avatar,
                  avatarType: type,
                  updatedAt: Date.now(),
                }
              : profile
          ),
        })),
    }),
    {
      name: 'swipe-to-dine-profiles',
    }
  )
);
