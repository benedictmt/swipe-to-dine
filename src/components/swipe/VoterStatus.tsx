'use client';

/**
 * Shows voting status of all diners for current restaurant
 */

import { Profile, VoteStatus } from '@/types';
import { Avatar } from '@/components/ui';

interface VoterStatusProps {
  profiles: Profile[];
  votes: Record<string, VoteStatus>;
  currentDinerId?: string;
}

export function VoterStatus({ profiles, votes, currentDinerId }: VoterStatusProps) {
  return (
    <div className="flex items-center justify-center gap-2 flex-wrap">
      {profiles.map((profile) => {
        const vote = votes[profile.id] || 'unknown';
        const isCurrent = profile.id === currentDinerId;

        return (
          <div
            key={profile.id}
            className={`
              flex flex-col items-center gap-1 p-2 rounded-lg
              ${isCurrent ? 'bg-rose-50 dark:bg-rose-950 ring-2 ring-rose-500' : ''}
            `}
          >
            <Avatar
              src={profile.avatar}
              alt={profile.name}
              size="sm"
              status={vote}
              showStatus={vote !== 'unknown'}
            />
            <span className="text-xs text-gray-600 dark:text-gray-400 max-w-[60px] truncate">
              {profile.name.split(' ')[0]}
            </span>
          </div>
        );
      })}
    </div>
  );
}
