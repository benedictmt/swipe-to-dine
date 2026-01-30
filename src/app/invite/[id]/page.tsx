'use client';

/**
 * Invite Acceptance Page
 *
 * Route: /invite/[id]
 * Purpose: Allow users to accept an invite and join a party.
 */

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Logo } from '@/components/common/Logo';
import { Button, Modal } from '@/components/ui';
import { Avatar } from '@/components/ui';
import { ProfileForm } from '@/components/group/ProfileForm';
import { usePartyStore, useProfileStore } from '@/stores';
import { Profile, CuisineType } from '@/types';
import { formatDateTime } from '@/utils/helpers';

export default function InvitePage() {
  const router = useRouter();
  const params = useParams();
  const inviteId = params.id as string;

  const { loadParty, party, addDiner } = usePartyStore();
  const { profiles, createProfile, getProfile } = useProfileStore();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);

  // Load party on mount
  useEffect(() => {
    if (inviteId) {
      const loadedParty = loadParty(inviteId);
      if (!loadedParty) {
        setError('Invite not found or has expired');
      }
      setIsLoading(false);
    }
  }, [inviteId, loadParty]);

  // Get host profile
  const hostProfile = party?.hostProfileId
    ? getProfile(party.hostProfileId)
    : null;

  const handleSelectExistingProfile = (profileId: string) => {
    setSelectedProfileId(profileId);
  };

  const handleCreateProfile = () => {
    setShowProfileModal(true);
  };

  const handleProfileSubmit = (data: {
    name: string;
    phone: string;
    age: number;
    avatar?: string;
    cuisinePreferences: Partial<Record<CuisineType, number>>;
  }) => {
    const newProfile = createProfile(data);
    setSelectedProfileId(newProfile.id);
    setShowProfileModal(false);
  };

  const handleJoinParty = () => {
    if (!selectedProfileId) {
      alert('Please select or create a profile');
      return;
    }

    // Add this profile to the party as a remote diner
    addDiner(selectedProfileId, 'remote');

    // Navigate to the swipe page
    router.push('/instructions');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 dark:from-gray-950 dark:to-gray-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !party) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 dark:from-gray-950 dark:to-gray-900 flex flex-col items-center justify-center px-8">
        <Logo size="md" className="mb-8" />
        <div className="text-center">
          <div className="w-16 h-16 mx-auto bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Invite Not Found
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {error || 'This invite link may have expired or been deleted.'}
          </p>
          <Button onClick={() => router.push('/')}>
            Start Your Own Session
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 dark:from-gray-950 dark:to-gray-900">
      {/* Header */}
      <header className="p-4 flex items-center justify-center">
        <Logo size="md" animate />
      </header>

      {/* Content */}
      <div className="max-w-md mx-auto px-4 py-6 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Invite details */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg mb-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-rose-100 dark:bg-rose-900 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-rose-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
              </div>

              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                You're Invited!
              </h1>
              <p className="text-gray-500 dark:text-gray-400">
                Join the dining decision
              </p>
            </div>

            {/* Host info */}
            {hostProfile && (
              <div className="flex items-center gap-3 mt-6 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <Avatar
                  src={hostProfile.avatar}
                  alt={hostProfile.name}
                  size="md"
                />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Hosted by
                  </p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {hostProfile.name}
                  </p>
                </div>
              </div>
            )}

            {/* Date/time if set */}
            {party.dateTime && (
              <div className="flex items-center gap-3 mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div className="w-10 h-10 bg-rose-100 dark:bg-rose-900 rounded-full flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-rose-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Planned for
                  </p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {formatDateTime(party.dateTime)}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Select profile */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Select Your Profile
            </h2>

            {profiles.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  No profiles found. Create one to join!
                </p>
                <Button onClick={handleCreateProfile}>
                  Create Profile
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {profiles.map((profile) => (
                  <button
                    key={profile.id}
                    onClick={() => handleSelectExistingProfile(profile.id)}
                    className={`
                      w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left
                      ${
                        selectedProfileId === profile.id
                          ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/30'
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                      }
                    `}
                  >
                    <Avatar src={profile.avatar} alt={profile.name} size="md" />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {profile.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {profile.phone}
                      </p>
                    </div>
                    {selectedProfileId === profile.id && (
                      <div className="w-6 h-6 bg-rose-500 rounded-full flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}

                <button
                  onClick={handleCreateProfile}
                  className="w-full flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-rose-500 hover:text-rose-500 transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Create New Profile
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Fixed CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-t border-gray-100 dark:border-gray-800 safe-bottom">
        <div className="max-w-md mx-auto px-4 py-4">
          <Button
            onClick={handleJoinParty}
            fullWidth
            size="lg"
            disabled={!selectedProfileId}
          >
            Join & Start Swiping
          </Button>
        </div>
      </div>

      {/* Profile Modal */}
      <Modal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        title="Create Profile"
      >
        <ProfileForm
          onSubmit={handleProfileSubmit}
          onCancel={() => setShowProfileModal(false)}
        />
      </Modal>
    </div>
  );
}
