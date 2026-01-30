'use client';

/**
 * Group / Profiles Page
 *
 * Route: /group
 * Purpose: Select who is dining, create/edit profiles, and set attendance modes.
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from '@/components/common/Logo';
import { Button, Modal, Input } from '@/components/ui';
import { ProfileForm } from '@/components/group/ProfileForm';
import { DinerList } from '@/components/group/DinerList';
import { InviteModal } from '@/components/group/InviteModal';
import { useProfileStore, usePartyStore } from '@/stores';
import { Profile, AttendanceMode, CuisineType } from '@/types';
import { isValidPhone } from '@/utils/helpers';

export default function GroupPage() {
  const router = useRouter();
  const { profiles, createProfile, updateProfile, getProfileByPhone } = useProfileStore();
  const {
    party,
    addDiner,
    removeDiner,
    setDinerMode,
    isDinerSelected,
    setDateTime,
  } = usePartyStore();

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const [friendPhone, setFriendPhone] = useState('');
  const [friendPhoneError, setFriendPhoneError] = useState('');

  // Get selected diner IDs and modes
  const selectedIds = party?.selectedDiners.map((d) => d.profileId) || [];
  const modesById: Record<string, AttendanceMode> = {};
  party?.selectedDiners.forEach((d) => {
    modesById[d.profileId] = d.mode;
  });

  // Redirect if no party exists
  useEffect(() => {
    if (!party) {
      router.push('/');
    }
  }, [party, router]);

  const handleToggleSelect = (profileId: string) => {
    if (isDinerSelected(profileId)) {
      removeDiner(profileId);
    } else {
      addDiner(profileId);
    }
  };

  const handleModeChange = (profileId: string, mode: AttendanceMode) => {
    setDinerMode(profileId, mode);
  };

  const handleEditProfile = (profile: Profile) => {
    setEditingProfile(profile);
    setShowProfileModal(true);
  };

  const handleCreateProfile = () => {
    setEditingProfile(null);
    setShowProfileModal(true);
  };

  const handleProfileSubmit = (data: {
    name: string;
    phone: string;
    age: number;
    avatar?: string;
    cuisinePreferences: Partial<Record<CuisineType, number>>;
  }) => {
    if (editingProfile) {
      updateProfile(editingProfile.id, data);
    } else {
      const newProfile = createProfile(data);
      // Auto-select newly created profile
      addDiner(newProfile.id);
    }
    setShowProfileModal(false);
    setEditingProfile(null);
  };

  const handleAddFriend = () => {
    setFriendPhoneError('');

    if (!friendPhone.trim()) {
      setFriendPhoneError('Phone number is required');
      return;
    }

    if (!isValidPhone(friendPhone)) {
      setFriendPhoneError('Invalid phone number');
      return;
    }

    // Check if profile with this phone exists
    const existingProfile = getProfileByPhone(friendPhone);
    if (existingProfile) {
      // Just select them
      addDiner(existingProfile.id);
      setShowAddFriendModal(false);
      setFriendPhone('');
      return;
    }

    // Create a placeholder profile for this friend
    const newProfile = createProfile({
      name: `Friend (${friendPhone.slice(-4)})`,
      phone: friendPhone,
      age: 0,
    });
    addDiner(newProfile.id);
    setShowAddFriendModal(false);
    setFriendPhone('');
  };

  const handleNext = () => {
    if (selectedIds.length === 0) {
      alert('Please select at least one diner');
      return;
    }
    router.push('/instructions');
  };

  const handleBrowseOnly = () => {
    // Check if a "Browser" profile exists, otherwise create one
    const browserProfile = profiles.find((p) => p.name === 'Just Browsing');
    let profileId: string;

    if (browserProfile) {
      profileId = browserProfile.id;
    } else {
      const newProfile = createProfile({
        name: 'Just Browsing',
        phone: '',
        age: 0,
      });
      profileId = newProfile.id;
    }

    // Clear existing selections and add only the browser profile
    party?.selectedDiners.forEach((d) => removeDiner(d.profileId));
    addDiner(profileId);

    // Go directly to swipe
    router.push('/instructions');
  };

  if (!party) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 dark:from-gray-950 dark:to-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <svg
              className="w-5 h-5 text-gray-600 dark:text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <Logo variant="icon" size="sm" />
          <button
            onClick={() => setShowInviteModal(true)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <svg
              className="w-5 h-5 text-gray-600 dark:text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
              />
            </svg>
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 py-6 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Who's Dining Today?
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Select diners and set how they'll participate
          </p>

          {/* Diner list */}
          <DinerList
            profiles={profiles}
            selectedIds={selectedIds}
            modesById={modesById}
            onToggleSelect={handleToggleSelect}
            onModeChange={handleModeChange}
            onEdit={handleEditProfile}
          />

          {/* Add buttons */}
          <div className="mt-6 flex gap-3">
            <Button
              variant="secondary"
              onClick={handleCreateProfile}
              fullWidth
            >
              <svg
                className="w-5 h-5 mr-2"
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
              New Profile
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowAddFriendModal(true)}
              fullWidth
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
              Add by Phone
            </Button>
          </div>

          {/* Selection count */}
          {selectedIds.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 text-center"
            >
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {selectedIds.length} {selectedIds.length === 1 ? 'diner' : 'diners'} selected
              </span>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Fixed CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-t border-gray-100 dark:border-gray-800 safe-bottom">
        <div className="max-w-lg mx-auto px-4 py-4 space-y-3">
          <Button
            onClick={handleNext}
            fullWidth
            size="lg"
            disabled={selectedIds.length === 0}
          >
            Swipe to Dine
          </Button>
          <button
            onClick={handleBrowseOnly}
            className="w-full py-2 text-center text-sm text-gray-500 dark:text-gray-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
          >
            Just browsing? Build a list to review later
          </button>
        </div>
      </div>

      {/* Profile Modal */}
      <Modal
        isOpen={showProfileModal}
        onClose={() => {
          setShowProfileModal(false);
          setEditingProfile(null);
        }}
        title={editingProfile ? 'Edit Profile' : 'Create Profile'}
      >
        <ProfileForm
          initialProfile={editingProfile || undefined}
          onSubmit={handleProfileSubmit}
          onCancel={() => {
            setShowProfileModal(false);
            setEditingProfile(null);
          }}
        />
      </Modal>

      {/* Invite Modal */}
      <Modal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        title="Invite Friends"
      >
        <InviteModal
          inviteId={party.inviteId}
          dateTime={party.dateTime}
          onDateTimeChange={setDateTime}
          onClose={() => setShowInviteModal(false)}
        />
      </Modal>

      {/* Add Friend Modal */}
      <Modal
        isOpen={showAddFriendModal}
        onClose={() => {
          setShowAddFriendModal(false);
          setFriendPhone('');
          setFriendPhoneError('');
        }}
        title="Add Friend by Phone"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Enter your friend's phone number to add them to this session.
          </p>
          <Input
            label="Phone Number"
            placeholder="(555) 123-4567"
            type="tel"
            value={friendPhone}
            onChange={(e) => setFriendPhone(e.target.value)}
            error={friendPhoneError}
          />
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                setShowAddFriendModal(false);
                setFriendPhone('');
                setFriendPhoneError('');
              }}
              fullWidth
            >
              Cancel
            </Button>
            <Button onClick={handleAddFriend} fullWidth>
              Add Friend
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
