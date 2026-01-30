'use client';

/**
 * Profile creation/edit form with cuisine preferences
 */

import { useState, useRef } from 'react';
import { Profile, CuisineType, ALL_CUISINES, CUISINE_LABELS } from '@/types';
import { Button, Input, Slider } from '@/components/ui';
import { Avatar } from '@/components/ui';
import { isValidPhone, generateAvatarSvg, fileToBase64, getPreferenceEmoji } from '@/utils/helpers';

interface ProfileFormProps {
  initialProfile?: Profile;
  onSubmit: (data: {
    name: string;
    phone: string;
    age: number;
    avatar?: string;
    cuisinePreferences: Partial<Record<CuisineType, number>>;
  }) => void;
  onCancel: () => void;
}

export function ProfileForm({ initialProfile, onSubmit, onCancel }: ProfileFormProps) {
  const [name, setName] = useState(initialProfile?.name || '');
  const [phone, setPhone] = useState(initialProfile?.phone || '');
  const [age, setAge] = useState(initialProfile?.age?.toString() || '');
  const [avatar, setAvatar] = useState(initialProfile?.avatar || '');
  const [cuisinePrefs, setCuisinePrefs] = useState<Partial<Record<CuisineType, number>>>(
    initialProfile?.cuisinePreferences || {}
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPreferences, setShowPreferences] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate avatar preview
  const avatarPreview = avatar || (name ? generateAvatarSvg(name) : generateAvatarSvg('?'));

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await fileToBase64(file);
        setAvatar(base64);
      } catch (error) {
        console.error('Error uploading avatar:', error);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!isValidPhone(phone)) {
      newErrors.phone = 'Invalid phone number';
    }

    if (!age.trim()) {
      newErrors.age = 'Age is required';
    } else if (isNaN(parseInt(age)) || parseInt(age) < 1 || parseInt(age) > 120) {
      newErrors.age = 'Invalid age';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      name: name.trim(),
      phone: phone.trim(),
      age: parseInt(age),
      avatar: avatar || undefined,
      cuisinePreferences: cuisinePrefs,
    });
  };

  const setCuisinePreference = (cuisine: CuisineType, value: number) => {
    setCuisinePrefs((prev) => ({ ...prev, [cuisine]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Avatar */}
      <div className="flex flex-col items-center">
        <div className="relative">
          <Avatar src={avatarPreview} alt={name || 'Avatar'} size="xl" />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-1 -right-1 w-8 h-8 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-rose-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleAvatarUpload}
          className="hidden"
        />
        <p className="text-xs text-gray-500 mt-2">Tap to change photo</p>
      </div>

      {/* Basic info */}
      <Input
        label="Name"
        placeholder="Enter your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={errors.name}
      />

      <Input
        label="Phone Number"
        placeholder="(555) 123-4567"
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        error={errors.phone}
      />

      <Input
        label="Age"
        placeholder="Enter your age"
        type="number"
        min="1"
        max="120"
        value={age}
        onChange={(e) => setAge(e.target.value)}
        error={errors.age}
      />

      {/* Cuisine preferences */}
      <div>
        <button
          type="button"
          onClick={() => setShowPreferences(!showPreferences)}
          className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-rose-500 transition-colors"
        >
          <span>Cuisine Preferences</span>
          <svg
            className={`w-4 h-4 transition-transform ${showPreferences ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showPreferences && (
          <div className="mt-4 space-y-4 max-h-[300px] overflow-y-auto pr-2">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Rate your preference for each cuisine type
            </p>
            {ALL_CUISINES.map((cuisine) => {
              const value = cuisinePrefs[cuisine] ?? 0;
              return (
                <div key={cuisine} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {CUISINE_LABELS[cuisine]}
                    </span>
                    <span className="text-xl">{getPreferenceEmoji(value)}</span>
                  </div>
                  <Slider
                    value={value}
                    onChange={(v) => setCuisinePreference(cuisine, v)}
                    min={-2}
                    max={2}
                    step={1}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel} fullWidth>
          Cancel
        </Button>
        <Button type="submit" fullWidth>
          {initialProfile ? 'Save Changes' : 'Create Profile'}
        </Button>
      </div>
    </form>
  );
}
