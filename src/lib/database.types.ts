/**
 * Supabase Database Types
 *
 * This file defines TypeScript types for the Supabase database schema.
 * These types are used by the Supabase client for type-safe database operations.
 *
 * In production, you would generate these types using:
 * npx supabase gen types typescript --project-id ntpwptybbmvrdvbdjemp > src/lib/database.types.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          phone: string;
          avatar: string;
          avatar_type: 'generated' | 'uploaded';
          cuisine_preferences: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          phone: string;
          avatar: string;
          avatar_type?: 'generated' | 'uploaded';
          cuisine_preferences?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          phone?: string;
          avatar?: string;
          avatar_type?: 'generated' | 'uploaded';
          cuisine_preferences?: Json;
          updated_at?: string;
        };
      };
      parties: {
        Row: {
          id: string;
          invite_id: string;
          host_profile_id: string | null;
          date_time: string | null;
          filters: Json;
          matched_restaurant_id: string | null;
          matched_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          invite_id: string;
          host_profile_id?: string | null;
          date_time?: string | null;
          filters: Json;
          matched_restaurant_id?: string | null;
          matched_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          invite_id?: string;
          host_profile_id?: string | null;
          date_time?: string | null;
          filters?: Json;
          matched_restaurant_id?: string | null;
          matched_at?: string | null;
          updated_at?: string;
        };
      };
      party_diners: {
        Row: {
          id: string;
          party_id: string;
          profile_id: string;
          mode: 'remote' | 'onDeck';
          joined_at: string;
        };
        Insert: {
          id?: string;
          party_id: string;
          profile_id: string;
          mode?: 'remote' | 'onDeck';
          joined_at?: string;
        };
        Update: {
          mode?: 'remote' | 'onDeck';
        };
      };
      party_votes: {
        Row: {
          id: string;
          party_id: string;
          profile_id: string;
          restaurant_id: string;
          vote: 'no' | 'maybe';
          voted_at: string;
        };
        Insert: {
          id?: string;
          party_id: string;
          profile_id: string;
          restaurant_id: string;
          vote: 'no' | 'maybe';
          voted_at?: string;
        };
        Update: {
          vote?: 'no' | 'maybe';
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {
      attendance_mode: 'remote' | 'inPerson';
      vote_status: 'no' | 'maybe';
      avatar_type: 'generated' | 'uploaded';
    };
  };
}
