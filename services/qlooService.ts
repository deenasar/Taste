// Qloo API Service for personalized recommendations
// This service integrates with the Qloo API to provide personalized suggestions
// based on user interests and friend preferences

interface QlooSuggestion {
  id: string;
  title: string;
  description: string;
  category: string;
  rating: number;
  price: string;
  location?: string;
  image?: string;
  tags: string[];
}

interface QlooApiResponse {
  suggestions: QlooSuggestion[];
  confidence: number;
  metadata: {
    query_id: string;
    processing_time: number;
  };
}

class QlooService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    // In a real implementation, these would come from environment variables
    this.apiKey = process.env.QLOO_API_KEY || 'your-qloo-api-key';
    this.baseUrl = 'https://api.qloo.com/v1';
  }

  /**
   * Get personalized suggestions based on user interests and activities
   */
  async getSuggestions(
    interests: string[],
    activities: string[],
    location?: string
  ): Promise<QlooSuggestion[]> {
    try {
      // For now, we'll return mock data that simulates Qloo API responses
      // In a real implementation, this would make actual API calls
      return this.getMockSuggestions(interests, activities, location);
      
      // Real implementation would look like:
      /*
      const response = await fetch(`${this.baseUrl}/recommendations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          interests,
          activities,
          location,
          limit: 10,
          include_metadata: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`Qloo API error: ${response.statusText}`);
      }

      const data: QlooApiResponse = await response.json();
      return data.suggestions;
      */
    } catch (error) {
      console.error('Error fetching Qloo suggestions:', error);
      // Fallback to mock data if API fails
      return this.getMockSuggestions(interests, activities, location);
    }
  }

  /**
   * Mock suggestions that simulate Qloo API responses
   * This provides realistic data while the actual API integration is being set up
   */
  private getMockSuggestions(
    interests: string[],
    activities: string[],
    location?: string
  ): QlooSuggestion[] {
    const allSuggestions: QlooSuggestion[] = [
      // Entertainment suggestions
      {
        id: 'ent_001',
        title: 'Indie Film Festival',
        description: 'A curated selection of independent films from emerging directors worldwide',
        category: 'Entertainment',
        rating: 4.5,
        price: '$$',
        location: 'Downtown Arts Center',
        tags: ['indie', 'film', 'art', 'culture'],
      },
      {
        id: 'ent_002',
        title: 'Underground Comedy Show',
        description: 'Raw, unfiltered comedy from up-and-coming comedians',
        category: 'Entertainment',
        rating: 4.2,
        price: '$',
        location: 'The Basement Club',
        tags: ['comedy', 'underground', 'live', 'humor'],
      },
      {
        id: 'ent_003',
        title: 'Interactive Art Installation',
        description: 'Immersive digital art experience that responds to your movements',
        category: 'Entertainment',
        rating: 4.7,
        price: '$$',
        location: 'Modern Art Museum',
        tags: ['digital', 'interactive', 'art', 'technology'],
      },

      // Dining suggestions
      {
        id: 'din_001',
        title: 'Artisan Coffee & Jazz',
        description: 'Specialty coffee paired with live jazz performances in an intimate setting',
        category: 'Dining',
        rating: 4.7,
        price: '$',
        location: 'The Blue Note Cafe',
        tags: ['coffee', 'jazz', 'music', 'cozy'],
      },
      {
        id: 'din_002',
        title: 'Farm-to-Table Tasting Menu',
        description: 'Seasonal ingredients transformed into culinary art',
        category: 'Dining',
        rating: 4.8,
        price: '$$$',
        location: 'Harvest Kitchen',
        tags: ['farm-to-table', 'seasonal', 'fine-dining', 'local'],
      },
      {
        id: 'din_003',
        title: 'Ramen & Vinyl Night',
        description: 'Authentic ramen while listening to rare vinyl records',
        category: 'Dining',
        rating: 4.4,
        price: '$$',
        location: 'Noodle & Needle',
        tags: ['ramen', 'vinyl', 'music', 'authentic'],
      },

      // Cultural suggestions
      {
        id: 'cul_001',
        title: 'Contemporary Art Gallery Walk',
        description: 'Explore the latest contemporary art exhibitions with guided tours',
        category: 'Cultural',
        rating: 4.3,
        price: 'Free',
        location: 'Museum District',
        tags: ['art', 'gallery', 'contemporary', 'culture'],
      },
      {
        id: 'cul_002',
        title: 'Poetry & Wine Evening',
        description: 'Local poets share their work in a candlelit wine bar',
        category: 'Cultural',
        rating: 4.5,
        price: '$$',
        location: 'The Literary Lounge',
        tags: ['poetry', 'wine', 'literature', 'intimate'],
      },
      {
        id: 'cul_003',
        title: 'Street Art Walking Tour',
        description: 'Discover hidden murals and street art with local artists',
        category: 'Cultural',
        rating: 4.6,
        price: '$',
        location: 'Arts District',
        tags: ['street-art', 'walking', 'local', 'urban'],
      },

      // Music suggestions
      {
        id: 'mus_001',
        title: 'Rooftop Vinyl Listening Party',
        description: 'Listen to rare vinyl records under the stars with fellow music lovers',
        category: 'Music',
        rating: 4.6,
        price: '$',
        location: 'Sky Lounge',
        tags: ['vinyl', 'rooftop', 'rare', 'community'],
      },
      {
        id: 'mus_002',
        title: 'Intimate Acoustic Session',
        description: 'Singer-songwriters perform in a cozy, candlelit venue',
        category: 'Music',
        rating: 4.4,
        price: '$',
        location: 'The Songbird Cafe',
        tags: ['acoustic', 'intimate', 'singer-songwriter', 'cozy'],
      },
      {
        id: 'mus_003',
        title: 'Electronic Music Workshop',
        description: 'Learn to create electronic music with professional producers',
        category: 'Music',
        rating: 4.3,
        price: '$$',
        location: 'Sound Lab Studio',
        tags: ['electronic', 'workshop', 'learning', 'production'],
      },

      // Learning suggestions
      {
        id: 'lea_001',
        title: 'Cooking Class: Global Flavors',
        description: 'Learn to cook dishes from around the world with expert chefs',
        category: 'Learning',
        rating: 4.8,
        price: '$$$',
        location: 'Culinary Institute',
        tags: ['cooking', 'global', 'hands-on', 'chef'],
      },
      {
        id: 'lea_002',
        title: 'Photography Workshop',
        description: 'Master street photography techniques with a professional photographer',
        category: 'Learning',
        rating: 4.5,
        price: '$$',
        location: 'Photo Studio Downtown',
        tags: ['photography', 'street', 'workshop', 'professional'],
      },
      {
        id: 'lea_003',
        title: 'Wine Tasting & Education',
        description: 'Learn about wine regions and tasting techniques',
        category: 'Learning',
        rating: 4.6,
        price: '$$',
        location: 'The Wine Cellar',
        tags: ['wine', 'tasting', 'education', 'sommelier'],
      },

      // Outdoor suggestions
      {
        id: 'out_001',
        title: 'Urban Hiking Adventure',
        description: 'Explore hidden trails and viewpoints within the city',
        category: 'Outdoor',
        rating: 4.4,
        price: 'Free',
        location: 'City Parks',
        tags: ['hiking', 'urban', 'nature', 'adventure'],
      },
      {
        id: 'out_002',
        title: 'Sunset Kayaking',
        description: 'Paddle through calm waters as the sun sets over the city',
        category: 'Outdoor',
        rating: 4.7,
        price: '$$',
        location: 'City Lake',
        tags: ['kayaking', 'sunset', 'water', 'peaceful'],
      },

      // Nightlife suggestions
      {
        id: 'nig_001',
        title: 'Speakeasy Cocktail Experience',
        description: 'Hidden bar with craft cocktails and 1920s atmosphere',
        category: 'Nightlife',
        rating: 4.5,
        price: '$$$',
        location: 'Secret Location (text for address)',
        tags: ['speakeasy', 'cocktails', 'hidden', 'vintage'],
      },
      {
        id: 'nig_002',
        title: 'Late Night Food Market',
        description: 'Street food vendors and live music until 2 AM',
        category: 'Nightlife',
        rating: 4.3,
        price: '$',
        location: 'Night Market Square',
        tags: ['food', 'market', 'late-night', 'street-food'],
      },
    ];

    // Filter suggestions based on interests and activities - STRICT FILTERING
    let filteredSuggestions = allSuggestions;

    // Filter by activities if specified
    if (activities.length > 0) {
      filteredSuggestions = filteredSuggestions.filter(suggestion => {
        return activities.some(activity => {
          const activityLower = activity.toLowerCase();
          const categoryLower = suggestion.category.toLowerCase();
          
          // Exact category matches only
          if (activityLower === 'music' && categoryLower === 'music') return true;
          if (activityLower === 'movies' && categoryLower === 'entertainment') return true;
          if (activityLower === 'books' && categoryLower === 'learning') return true;
          if (activityLower === 'podcasts' && categoryLower === 'entertainment') return true;
          if (activityLower === 'games' && categoryLower === 'entertainment') return true;
          if (activityLower === 'tv' && categoryLower === 'entertainment') return true;
          if (activityLower === 'travel' && categoryLower === 'outdoor') return true;
          if (activityLower === 'art' && categoryLower === 'cultural') return true;
          if (activityLower === 'food' && categoryLower === 'dining') return true;
          
          return false;
        });
      });
    }

    // Score suggestions based on interest matching
    const scoredSuggestions = filteredSuggestions.map(suggestion => {
      let score = 0;
      interests.forEach(interest => {
        if (suggestion.tags.some(tag => 
          tag.toLowerCase().includes(interest.toLowerCase()) ||
          interest.toLowerCase().includes(tag.toLowerCase())
        )) {
          score += 1;
        }
        if (suggestion.title.toLowerCase().includes(interest.toLowerCase()) ||
            suggestion.description.toLowerCase().includes(interest.toLowerCase())) {
          score += 0.5;
        }
      });
      return { ...suggestion, score };
    });

    // Sort by score and return top suggestions
    return scoredSuggestions
      .sort((a, b) => (b as any).score - (a as any).score)
      .slice(0, 8)
      .map(({ score, ...suggestion }) => suggestion);
  }

  /**
   * Get suggestions for a specific category
   */
  async getCategorySuggestions(
    category: string,
    interests: string[],
    limit: number = 5
  ): Promise<QlooSuggestion[]> {
    const allSuggestions = await this.getSuggestions(interests, [category]);
    return allSuggestions.slice(0, limit);
  }

  /**
   * Get trending suggestions in a specific location
   */
  async getTrendingSuggestions(
    location: string,
    limit: number = 10
  ): Promise<QlooSuggestion[]> {
    // This would typically call a different Qloo endpoint for trending content
    const suggestions = await this.getSuggestions([], [], location);
    return suggestions
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit);
  }
}

export const qlooService = new QlooService();
export type { QlooSuggestion };