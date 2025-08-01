import { ARCHETYPES, OPTION_AFFINITY } from '@/constants';
import type { Archetype } from '@/types';

interface CrossArchetypeContent {
  id: string;
  title: string;
  type: 'music' | 'recipe' | 'film' | 'book' | 'activity';
  archetype: string;
  description: string;
  culturalContext?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

interface FusionPoll {
  id: string;
  theme: string;
  archetype1: string;
  archetype2: string;
  options: string[];
  votes: number[];
}

// Simulated cross-archetype content database
const CROSS_ARCHETYPE_CONTENT: CrossArchetypeContent[] = [
  // Morning Music
  { id: '1', title: 'Mongolian Throat Singing', type: 'music', archetype: 'Cultural Historian', description: 'Ancient vocal technique from Central Asia', culturalContext: 'Traditional nomadic culture' },
  { id: '2', title: 'Lo-fi Hip Hop Beats', type: 'music', archetype: 'Digital Dreamer', description: 'Chill electronic music for focus', culturalContext: 'Internet culture phenomenon' },
  { id: '3', title: 'Vintage Jazz Records', type: 'music', archetype: 'Retro Nostalgic', description: '1940s swing and bebop classics', culturalContext: 'Golden age of American jazz' },
  
  // Afternoon Recipes
  { id: '4', title: 'Ethiopian Injera Bread', type: 'recipe', archetype: 'Global Gourmet', description: 'Fermented flatbread with unique texture', culturalContext: 'Ethiopian communal dining tradition', difficulty: 'medium' },
  { id: '5', title: 'Matcha Tea Ceremony', type: 'recipe', archetype: 'Enlightened Seeker', description: 'Mindful preparation of green tea', culturalContext: 'Japanese zen philosophy', difficulty: 'easy' },
  { id: '6', title: 'Molecular Gastronomy', type: 'recipe', archetype: 'Digital Dreamer', description: 'Science meets culinary art', culturalContext: 'Modern experimental cuisine', difficulty: 'hard' },
  
  // Evening Films
  { id: '7', title: 'Cyberpunk Anime', type: 'film', archetype: 'Digital Dreamer', description: 'Futuristic dystopian animation', culturalContext: 'Japanese anime subculture' },
  { id: '8', title: 'French New Wave Cinema', type: 'film', archetype: 'Cultural Historian', description: 'Revolutionary filmmaking movement', culturalContext: '1960s artistic rebellion' },
  { id: '9', title: 'Bollywood Musicals', type: 'film', archetype: 'Global Gourmet', description: 'Colorful Indian cinema spectacle', culturalContext: 'Indian entertainment industry' },
];

const FUSION_POLLS: FusionPoll[] = [
  {
    id: '1',
    theme: 'Retro-Futurism',
    archetype1: 'Retro Nostalgic',
    archetype2: 'Digital Dreamer',
    options: ['80s Synthwave Playlists', 'Vintage Sci-Fi Book Club', 'Neon Aesthetic Photography'],
    votes: [45, 32, 23]
  },
  {
    id: '2',
    theme: 'Indie-Pop Culture',
    archetype1: 'Indie Explorer',
    archetype2: 'Pop Culture Buff',
    options: ['Underground Artists Going Mainstream', 'Indie Film Festival Hits', 'Alternative Fashion Trends'],
    votes: [38, 41, 21]
  },
  {
    id: '3',
    theme: 'Digital-Minimalism',
    archetype1: 'Digital Dreamer',
    archetype2: 'Minimalist Curator',
    options: ['Clean UI Design Showcase', 'Minimalist Tech Gadgets', 'Digital Detox Challenges'],
    votes: [29, 35, 36]
  }
];

export class CrossArchetypeService {
  static getJourneyCards(): CrossArchetypeContent[] {
    return [
      CROSS_ARCHETYPE_CONTENT.find(c => c.type === 'music') || CROSS_ARCHETYPE_CONTENT[0],
      CROSS_ARCHETYPE_CONTENT.find(c => c.type === 'recipe') || CROSS_ARCHETYPE_CONTENT[1],
      CROSS_ARCHETYPE_CONTENT.find(c => c.type === 'film') || CROSS_ARCHETYPE_CONTENT[2],
    ];
  }

  static getReverseMatchContent(userArchetype: string): CrossArchetypeContent {
    // Find content from a different archetype
    const otherArchetypeContent = CROSS_ARCHETYPE_CONTENT.filter(
      c => c.archetype !== userArchetype
    );
    return otherArchetypeContent[Math.floor(Math.random() * otherArchetypeContent.length)];
  }

  static getFusionPolls(): FusionPoll[] {
    return FUSION_POLLS;
  }

  static getSwipeCards(userArchetype: string): CrossArchetypeContent[] {
    // Return content from different archetypes for exploration
    return CROSS_ARCHETYPE_CONTENT.filter(c => c.archetype !== userArchetype).slice(0, 5);
  }

  static getSimilarityRecommendations(userArchetype: string): { from: string; to: string; reason: string }[] {
    const recommendations = [
      {
        from: 'Classical Music',
        to: 'Ambient Electronic',
        reason: 'Both focus on atmospheric soundscapes and emotional depth'
      },
      {
        from: 'Indie Films',
        to: 'Foreign Language Cinema',
        reason: 'Shared emphasis on storytelling and artistic expression'
      },
      {
        from: 'Poetry Collections',
        to: 'Song Lyrics Analysis',
        reason: 'Similar appreciation for wordplay and emotional resonance'
      }
    ];
    
    return recommendations.slice(0, 3);
  }

  static calculateArchetypeResonance(userPreferences: any, targetArchetype: string): number {
    if (!userPreferences || !OPTION_AFFINITY) return 0;
    
    let totalScore = 0;
    let totalOptions = 0;
    
    Object.values(userPreferences).flat().forEach((option: any) => {
      if (OPTION_AFFINITY[option] && OPTION_AFFINITY[option][targetArchetype]) {
        totalScore += OPTION_AFFINITY[option][targetArchetype];
        totalOptions++;
      }
    });
    
    return totalOptions > 0 ? Math.round((totalScore / (totalOptions * 3)) * 100) : 0;
  }

  static getFriendSuggestions(userArchetype: string): { name: string; archetype: string; mutualLikes: string[] }[] {
    const suggestions = [
      {
        name: 'Alex Chen',
        archetype: 'Digital Dreamer',
        mutualLikes: ['Sci-Fi Podcasts', 'Electronic Music', 'Tech Documentaries']
      },
      {
        name: 'Maya Patel',
        archetype: 'Global Gourmet',
        mutualLikes: ['World Cinema', 'Travel Photography', 'Cultural Events']
      },
      {
        name: 'Jordan Kim',
        archetype: 'Indie Explorer',
        mutualLikes: ['Underground Music', 'Art House Films', 'Poetry Readings']
      }
    ];
    
    return suggestions.filter(s => s.archetype !== userArchetype).slice(0, 2);
  }
}