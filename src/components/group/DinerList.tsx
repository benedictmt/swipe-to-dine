'use client';

/**
 * List of profiles with selection and attendance mode controls
 */

import { Profile, AttendanceMode } from '@/types';
import { Avatar, SegmentedControl } from '@/components/ui';
import { motion, AnimatePresence } from 'framer-motion';

interface DinerListProps {
  profiles: Profile[];
  selectedIds: string[];
  modesById: Record<string, AttendanceMode>;
  onToggleSelect: (profileId: string) => void;
  onModeChange: (profileId: string, mode: AttendanceMode) => void;
  onEdit: (profile: Profile) => void;
}

const modeOptions = [
  { value: 'remote', label: 'Remote' },
  { value: 'onDeck', label: 'On-Deck' },
];

export function DinerList({
  profiles,
  selectedIds,
  modesById,
  onToggleSelect,
  onModeChange,
  onEdit,
}: DinerListProps) {
  const hasOnDeckDiner = selectedIds.some((id) => modesById[id] === 'onDeck');

  return (
    <div className="space-y-3">
      {profiles.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>No profiles yet.</p>
          <p className="text-sm">Create one to get started!</p>
        </div>
      ) : (
        <AnimatePresence>
          {profiles.map((profile) => {
            const isSelected = selectedIds.includes(profile.id);
            const mode = modesById[profile.id] || 'remote';

            return (
              <motion.div
                key={profile.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`
                  p-4 rounded-xl border-2 transition-all
                  ${
                    isSelected
                      ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/30'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                  }
                `}
              >
                <div className="flex items-start gap-4">
                  {/* Checkbox + Avatar */}
                  <button
                    onClick={() => onToggleSelect(profile.id)}
                    className="flex items-center gap-3"
                  >
                    <div
                      className={`
                        w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all
                        ${
                          isSelected
                            ? 'border-rose-500 bg-rose-500'
                            : 'border-gray-300 dark:border-gray-600'
                        }
                      `}
                    >
                      {isSelected && (
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
                      )}
                    </div>
                    <Avatar src={profile.avatar} alt={profile.name} size="md" />
                  </button>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                        {profile.name}
                      </h4>
                      <button
                        onClick={() => onEdit(profile)}
                        className="text-gray-400 hover:text-rose-500 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                          />
                        </svg>
                      </button>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {profile.phone}
                    </p>

                    {/* Mode selector (only when selected) */}
                    {isSelected && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3"
                      >
                        <SegmentedControl
                          options={modeOptions}
                          value={mode}
                          onChange={(v) => onModeChange(profile.id, v as AttendanceMode)}
                          size="sm"
                        />
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          {mode === 'remote'
                            ? "They'll swipe from their phone"
                            : "They'll take turns swiping on this phone"}
                        </p>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      )}

      {/* On-Deck info note */}
      <AnimatePresence>
        {hasOnDeckDiner && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl"
          >
            <svg
              className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm text-amber-800 dark:text-amber-200">
              <strong>On-Deck mode:</strong> Selected diners will swipe sequentially
              on this device during the round. Pass the phone when prompted!
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
