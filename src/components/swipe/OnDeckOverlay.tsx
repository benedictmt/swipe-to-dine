'use client';

/**
 * Overlay shown during On-Deck pass-the-phone flow
 */

import { motion } from 'framer-motion';
import { Profile } from '@/types';
import { Avatar } from '@/components/ui';
import { Button } from '@/components/ui';

interface OnDeckOverlayProps {
  profile: Profile;
  onReady: () => void;
}

export function OnDeckOverlay({ profile, onReady }: OnDeckOverlayProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-20 flex items-center justify-center bg-black/80 backdrop-blur-md rounded-3xl"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: 'spring' }}
        className="text-center p-8"
      >
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ type: 'spring', delay: 0.2 }}
          className="mb-6"
        >
          <Avatar
            src={profile.avatar}
            alt={profile.name}
            size="xl"
            className="mx-auto ring-4 ring-rose-500"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-gray-400 text-sm uppercase tracking-wide mb-2">
            Pass to
          </p>
          <h3 className="text-3xl font-bold text-white mb-6">
            {profile.name}
          </h3>

          <Button
            onClick={onReady}
            size="lg"
            className="min-w-[160px]"
          >
            Ready
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
