
import type { ReactNode } from 'react';

export interface Archetype {
  name: string;
  icon: (props: { size?: number; color?: string }) => ReactNode;
  description: string;
  gradientColors: [string, string];
  color: string;
}

export interface QuizQuestion {
  id: 'music' | 'movies' | 'books' | 'podcast' | 'videogame' | 'tv_show' | 'travel' | 'artist' | 'mirror';
  question: string;
  options: string[];
}

export type UserPreferences = {
  [key in QuizQuestion['id']]?: string[];
};

export interface ArchetypeResult {
  archetype: Archetype;
  summary: string;
}
