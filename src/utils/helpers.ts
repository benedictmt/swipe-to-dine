/**
 * Utility functions for Swipe to Dine
 */

import { v4 as uuidv4 } from 'uuid';
import { CuisineType, Profile, CuisinePreferences } from '@/types';

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return uuidv4();
}

/**
 * Generate a short invite ID (8 characters)
 */
export function generateInviteId(): string {
  return uuidv4().substring(0, 8);
}

/**
 * Generate avatar SVG based on name (seeded)
 */
export function generateAvatarSvg(name: string): string {
  // Create a simple hash from the name
  const hash = name.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);

  // Generate colors from hash
  const hue = Math.abs(hash % 360);
  const backgroundColor = `hsl(${hue}, 65%, 60%)`;
  const textColor = '#ffffff';

  // Get initials (max 2 characters)
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  // Return SVG as data URL
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <rect width="100" height="100" fill="${backgroundColor}" rx="50"/>
      <text x="50" y="50" text-anchor="middle" dominant-baseline="central"
            fill="${textColor}" font-family="system-ui, sans-serif"
            font-size="36" font-weight="600">${initials}</text>
    </svg>
  `.trim();

  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

/**
 * Convert uploaded file to base64
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Validate phone number (simple format check)
 */
export function isValidPhone(phone: string): boolean {
  // Accept various formats: (123) 456-7890, 123-456-7890, 1234567890, +1234567890
  const cleaned = phone.replace(/[\s\-\(\)\.]/g, '');
  return /^\+?\d{10,15}$/.test(cleaned);
}

/**
 * Format phone number for display
 */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
}

/**
 * Calculate aggregate cuisine preference score for a group
 */
export function calculateGroupPreference(
  profiles: Profile[],
  cuisines: CuisineType[]
): number {
  if (profiles.length === 0 || cuisines.length === 0) return 0;

  let totalScore = 0;
  let count = 0;

  for (const profile of profiles) {
    for (const cuisine of cuisines) {
      const pref = profile.cuisinePreferences[cuisine];
      if (pref !== undefined) {
        totalScore += pref;
        count++;
      }
    }
  }

  return count > 0 ? totalScore / count : 0;
}

/**
 * Generate ICS file content for calendar event
 */
export function generateIcsFile(
  restaurantName: string,
  address: string,
  dateTime: Date,
  description?: string
): string {
  const formatDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const endTime = new Date(dateTime.getTime() + 90 * 60 * 1000); // 1.5 hours later

  const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Swipe to Dine//EN
BEGIN:VEVENT
UID:${generateId()}@swipetodine.com
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(dateTime)}
DTEND:${formatDate(endTime)}
SUMMARY:Dinner at ${restaurantName}
LOCATION:${address}
DESCRIPTION:${description || `Dining reservation at ${restaurantName}`}
END:VEVENT
END:VCALENDAR`;

  return ics;
}

/**
 * Download ICS file
 */
export function downloadIcsFile(
  restaurantName: string,
  address: string,
  dateTime: Date
): void {
  const icsContent = generateIcsFile(restaurantName, address, dateTime);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `dinner-${restaurantName.toLowerCase().replace(/\s+/g, '-')}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Open location in maps
 */
export function openInMaps(
  address: string,
  lat?: number,
  lng?: number
): void {
  let url: string;

  if (lat && lng) {
    // Use coordinates if available
    url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  } else {
    // Fall back to address search
    url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  }

  window.open(url, '_blank');
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return true;
    } catch {
      document.body.removeChild(textarea);
      return false;
    }
  }
}

/**
 * Generate share link for invite
 */
export function generateInviteLink(inviteId: string): string {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/invite/${inviteId}`;
  }
  return `/invite/${inviteId}`;
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Format date for display
 */
export function formatDateTime(isoString: string | null): string {
  if (!isoString) return '';

  const date = new Date(isoString);
  return date.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/**
 * Get preference emoji for a value
 */
export function getPreferenceEmoji(value: number): string {
  if (value <= -2) return '🤮';
  if (value <= -1) return '😕';
  if (value <= 0) return '😐';
  if (value <= 1) return '🙂';
  return '😀';
}

/**
 * LocalStorage helpers with error handling
 */
export const storage = {
  get<T>(key: string, defaultValue: T): T {
    if (typeof window === 'undefined') return defaultValue;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },

  set(key: string, value: unknown): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  },

  remove(key: string): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  },
};
