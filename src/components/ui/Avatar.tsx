'use client';

/**
 * Avatar component with status indicator
 */

import Image from 'next/image';
import { VoteStatus } from '@/types';

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  src: string;
  alt: string;
  size?: AvatarSize;
  status?: VoteStatus;
  showStatus?: boolean;
  className?: string;
}

const sizeStyles: Record<AvatarSize, { container: string; status: string }> = {
  sm: { container: 'w-8 h-8', status: 'w-3 h-3 -right-0.5 -bottom-0.5' },
  md: { container: 'w-10 h-10', status: 'w-3.5 h-3.5 -right-0.5 -bottom-0.5' },
  lg: { container: 'w-14 h-14', status: 'w-4 h-4 right-0 bottom-0' },
  xl: { container: 'w-20 h-20', status: 'w-5 h-5 right-0.5 bottom-0.5' },
};

const statusColors: Record<VoteStatus, string> = {
  unknown: 'bg-gray-400',
  no: 'bg-red-500',
  maybe: 'bg-green-500',
};

export function Avatar({
  src,
  alt,
  size = 'md',
  status,
  showStatus = false,
  className = '',
}: AvatarProps) {
  return (
    <div className={`relative inline-block ${className}`}>
      <div
        className={`
          relative rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700
          ${sizeStyles[size].container}
        `}
      >
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          unoptimized // For base64 images
        />
      </div>

      {showStatus && status && (
        <span
          className={`
            absolute rounded-full border-2 border-white dark:border-gray-900
            ${sizeStyles[size].status}
            ${statusColors[status]}
          `}
        />
      )}
    </div>
  );
}
