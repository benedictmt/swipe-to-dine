'use client';

/**
 * Modal for creating and sharing invite links
 */

import { useState } from 'react';
import { Button, Input } from '@/components/ui';
import { generateInviteLink, copyToClipboard } from '@/utils/helpers';

interface InviteModalProps {
  inviteId: string;
  dateTime: string | null;
  onDateTimeChange: (value: string | null) => void;
  onClose: () => void;
}

export function InviteModal({
  inviteId,
  dateTime,
  onDateTimeChange,
  onClose,
}: InviteModalProps) {
  const [copied, setCopied] = useState(false);
  const inviteLink = generateInviteLink(inviteId);

  const handleCopy = async () => {
    const success = await copyToClipboard(inviteLink);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join our Swipe to Dine session!',
          text: 'Help us decide where to eat!',
          url: inviteLink,
        });
      } catch {
        // User cancelled or share failed
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="space-y-6">
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
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
            />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Invite Friends
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Share this link with friends to let them join your dining session
        </p>
      </div>

      {/* Date/Time picker */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Dining Date & Time (optional)
        </label>
        <input
          type="datetime-local"
          value={dateTime || ''}
          onChange={(e) => onDateTimeChange(e.target.value || null)}
          className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent text-gray-900 dark:text-white focus:outline-none focus:border-rose-500 focus:bg-white dark:focus:bg-gray-900 transition-all"
        />
      </div>

      {/* Invite link */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Invite Link
        </label>
        <div className="flex gap-2">
          <div className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm text-gray-600 dark:text-gray-400 truncate">
            {inviteLink}
          </div>
          <Button
            variant="secondary"
            size="md"
            onClick={handleCopy}
            className="shrink-0"
          >
            {copied ? (
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                />
              </svg>
            )}
          </Button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="secondary" onClick={onClose} fullWidth>
          Close
        </Button>
        <Button onClick={handleShare} fullWidth>
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
            />
          </svg>
          Share
        </Button>
      </div>
    </div>
  );
}
