
import React from 'react';
import Svg, { Path } from 'react-native-svg';
import type { Archetype, QuizQuestion } from './types';
import { HomeIcon, MagnifyingGlassIcon, UserGroupIcon, UserCircleIcon } from 'react-native-heroicons/outline';


interface IconProps {
  size?: number;
  color?: string;
}

const MusicNoteIcon = ({ size = 24, color = "currentColor" }: IconProps) => (
  <Svg width={size} height={size} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={color}><Path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" /></Svg>
);
const GlobeIcon = ({ size = 24, color = "currentColor" }: IconProps) => (
  <Svg width={size} height={size} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={color}><Path strokeLinecap="round" strokeLinejoin="round" d="M12.75 3.03v.568c0 .324.263.588.588.588h.568a.588.588 0 01.588.588v.568a.588.588 0 01-.588.588h-.568a.588.588 0 01-.588-.588v-.568a.588.588 0 00-.588-.588h-.568a.588.588 0 00-.588.588v.568c0 .324.263.588.588.588h.568a.588.588 0 01.588.588v.568a.588.588 0 01-.588.588h-.568a.588.588 0 01-.588-.588v-.568" /><Path strokeLinecap="round" strokeLinejoin="round" d="M4.97 4.97a.75.75 0 011.06 0l1.22 1.22a.75.75 0 010 1.06l-1.22 1.22a.75.75 0 01-1.06 0zM16.73 16.73a.75.75 0 011.06 0l1.22 1.22a.75.75 0 010 1.06l-1.22 1.22a.75.75 0 01-1.06-1.06l1.22-1.22a.75.75 0 010-1.06l-1.22-1.22a.75.75 0 010-1.06z" /><Path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" /></Svg>
);
const SparklesIcon = ({ size = 24, color = "currentColor" }: IconProps) => (
  <Svg width={size} height={size} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={color}><Path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.624L16.5 21.75l-.398-1.126a3.375 3.375 0 00-2.456-2.456L12.525 18l1.126-.398a3.375 3.375 0 002.456-2.456L16.5 14.25l.398 1.126a3.375 3.375 0 002.456 2.456l1.126.398-1.126.398a3.375 3.375 0 00-2.456 2.456z" /></Svg>
);
const LibraryIcon = ({ size = 24, color = "currentColor" }: IconProps) => (
  <Svg width={size} height={size} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={color}><Path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></Svg>
);
const FilmIcon = ({ size = 24, color = "currentColor" }: IconProps) => (
  <Svg width={size} height={size} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={color}><Path strokeLinecap="round" strokeLinejoin="round" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" /></Svg>
);
const BookOpenIcon = ({ size = 24, color = "currentColor" }: IconProps) => (
  <Svg width={size} height={size} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={color}><Path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></Svg>
);
export const CompassIcon = ({ size = 24, color = "currentColor" }: IconProps) => (
  <Svg width={size} height={size} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={color}><Path strokeLinecap="round" strokeLinejoin="round" d="M12 21s-8-4.5-8-11.5a8 8 0 1116 0c0 7-8 11.5-8 11.5z" /><Path strokeLinecap="round" strokeLinejoin="round" d="M12 11a2 2 0 100-4 2 2 0 000 4z" /></Svg>
);
const CassetteIcon = ({ size = 24, color = "currentColor" }: IconProps) => (
  <Svg width={size} height={size} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke={color}><Path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.5 4.5 0 00-4.21-3.584l-.328-.017a4.5 4.5 0 00-4.21 3.584L10.5 8.338c-.091 1.21-.138 2.43-.138 3.662m9.138 0c0 1.232-.046 2.453-.138 3.662a4.5 4.5 0 01-4.21 3.584l-.328.017a4.5 4.5 0 01-4.21-3.584l-.173-.993" /><Path strokeLinecap="round" strokeLinejoin="round" d="M12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5z" /><Path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" /><Path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5z" /></Svg>
);
const LotusIcon = ({ size = 24, color = "currentColor" }: IconProps) => (
  <Svg width={size} height={size} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke={color}><Path strokeLinecap="round" strokeLinejoin="round" d="M12 21.352l-9-10.43V8.38a9 9 0 1118 0v2.542l-9 10.43zM4.5 8.38a7.5 7.5 0 0015 0" /><Path strokeLinecap="round" strokeLinejoin="round" d="M12 12.352a2 2 0 100-4 2 2 0 000 4z" /></Svg>
);
const SquareIcon = ({ size = 24, color = "currentColor" }: IconProps) => (
  <Svg width={size} height={size} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke={color}><Path strokeLinecap="round" strokeLinejoin="round" d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25-2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z" /></Svg>
);
const CoffeeIcon = ({ size = 24, color = "currentColor" }: IconProps) => (
  <Svg width={size} height={size} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke={color}><Path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5h3m-6.75 0h10.5c.621 0 1.125-.504 1.125-1.125v-6.75c0-.621-.504-1.125-1.125-1.125H6.375c-.621 0-1.125.504-1.125 1.125v6.75c0 .621.504 1.125 1.125 1.125z" /><Path strokeLinecap="round" strokeLinejoin="round" d="M15.75 16.5v-3.75a3.375 3.375 0 00-3.375-3.375h-1.521a3.375 3.375 0 00-3.375 3.375v3.75" /></Svg>
);

const MoonIcon = ({ size = 24, color = "currentColor" }: IconProps) => (
  <Svg width={size} height={size} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke={color}><Path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" /></Svg>
);

const SunIcon = ({ size = 24, color = "currentColor" }: IconProps) => (
  <Svg width={size} height={size} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke={color}><Path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></Svg>
);

const MicrophoneIcon = ({ size = 24, color = "currentColor" }: IconProps) => (
  <Svg width={size} height={size} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke={color}><Path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" /></Svg>
);

const GamepadIcon = ({ size = 24, color = "currentColor" }: IconProps) => (
  <Svg width={size} height={size} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke={color}>
    <Path strokeLinecap="round" strokeLinejoin="round" d="M6 12h.01M8 12h.01M10 12h.01M12 12h.01M14 12h.01M16 12h.01M18 12h.01M7 16a4 4 0 01-4-4V8a4 4 0 014-4h10a4 4 0 014 4v4a4 4 0 01-4 4H7z" />
  </Svg>
);

const TvIcon = ({ size = 24, color = "currentColor" }: IconProps) => (
  <Svg width={size} height={size} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke={color}><Path strokeLinecap="round" strokeLinejoin="round" d="M6 20.25h12m-7.5-3v3m3-3v3m-10.125-3h17.25c.621 0 1.125-.504 1.125-1.125V4.875c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125z" /></Svg>
);

const UserIcon = ({ size = 24, color = "currentColor" }: IconProps) => (
  <Svg width={size} height={size} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke={color}><Path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></Svg>
);

const DiscoverIcon = ({ size = 24, color = "currentColor" }: IconProps) => (
  <Svg width={size} height={size} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke={color}><Path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><Path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></Svg>
);


export const ARCHETYPES: Archetype[] = [
  { name: 'Alt Pulse', icon: MusicNoteIcon, description: "Craves indie everything—sounds, vibes, visuals.", gradientColors: ['#FFD9C0', '#FF9A8B'], color: "#FF9A8B" },
  { name: 'Lyrical Romantic', icon: BookOpenIcon, description: "Obsessed with poetry, love ballads, and pastel cafés.", gradientColors: ['#FFB8D1', '#C3B4FF'], color: "#C3B4FF" },
  { name: 'Culture Hacker', icon: SparklesIcon, description: "Remixes trends, blends subcultures, breaks genre walls.", gradientColors: ['#A7FFEB', '#C1C8E4'], color: "#A7FFEB" },
  { name: 'Berry Bloom', icon: UserIcon, description: "Sweet, expressive, and deeply emotional.", gradientColors: ['#FEC8D8', '#FCD5CE'], color: "#FEC8D8" },
  { name: 'Minimal Spirit', icon: SquareIcon, description: "Curates simplicity, clean aesthetics, and calming sounds.", gradientColors: ['#B5EAEA', '#EDF6E5'], color: "#B5EAEA" },
  { name: 'Mystic Pulse', icon: LotusIcon, description: "Believes in energies, chakras, and spiritual playlists.", gradientColors: ['#D5AAFF', '#957DAD'], color: "#D5AAFF" },
  { name: 'Pop Dreamer', icon: FilmIcon, description: "Crushes on bubblegum pop, teen drama, and all things soft & pink.", gradientColors: ['#FFDEE9', '#B5FFFC'], color: "#FFDEE9" },
  { name: 'Zen Zest', icon: CoffeeIcon, description: "Minimal meets fresh—gardens, tea, and chillhop.", gradientColors: ['#D2F6C5', '#99F3BD'], color: "#D2F6C5" },
  { name: 'Hidden Flame', icon: UserIcon, description: "Quiet on the outside, burning ideas inside.", gradientColors: ['#FFB6B9', '#FAE3D9'], color: "#FFB6B9" },
  { name: 'Wander Muse', icon: GlobeIcon, description: "Loves global sounds, eclectic food, and hidden art in every corner.", gradientColors: ['#A0E7E5', '#B4F8C8'], color: "#A0E7E5" },
  { name: 'Sunset Rebel', icon: UserIcon, description: "Lives for golden-hour music, bold statements, and standing out.", gradientColors: ['#FECACA', '#FCD34D'], color: "#FECACA" },
  { name: 'Cottage Noir', icon: MoonIcon, description: "Romanticizes everything—even sadness, even silence.", gradientColors: ['#F9F3DF', '#FFDAC1'], color: "#F9F3DF" },
  { name: 'Neon Thinker', icon: SparklesIcon, description: "Loves futurism, cyber aesthetics, and midnight ideation.", gradientColors: ['#FBC2EB', '#A6C1EE'], color: "#FBC2EB" },
  { name: 'Kaleido Crafter', icon: UserIcon, description: "Makes moodboards, designs zines, explodes in creativity.", gradientColors: ['#C1FBA4', '#F9F871'], color: "#C1FBA4" },
  { name: 'Earth Artisan', icon: UserIcon, description: "Crafts from clay, cooks with soul, lives in green.", gradientColors: ['#B7E4C7', '#95D5B2'], color: "#B7E4C7" },
  { name: 'Retro Soul', icon: CassetteIcon, description: "Finds beauty in nostalgia, old vinyl, and sepia-toned memories.", gradientColors: ['#E5D3B3', '#CDB4DB'], color: "#E5D3B3" },
  { name: 'Cyber Chill', icon: UserIcon, description: "Synthwave nights, glowing neon, coding or meditating.", gradientColors: ['#FFC6FF', '#BDB2FF'], color: "#FFC6FF" },
  { name: 'Tropic Vibist', icon: UserIcon, description: "Thrives on island rhythms, spicy food, and endless color.", gradientColors: ['#D0F4DE', '#A9DEF9'], color: "#D0F4DE" },
  { name: 'Hyper Connector', icon: UserIcon, description: "Shares everything, chats non-stop, lives in memes and reels.", gradientColors: ['#FDFFB6', '#CAFFBF'], color: "#FDFFB6" },
  { name: 'Cine Nomad', icon: FilmIcon, description: "Travels through cinema, from Fellini to Tarantino.", gradientColors: ['#FEC8D8', '#D291BC'], color: "#FEC8D8" },
  { name: 'Cloudwalker', icon: UserIcon, description: "Daydreams, journals, listens to lo-fi in rainy weather.", gradientColors: ['#BEE1E6', '#FAD2E1'], color: "#BEE1E6" },
  { name: 'Vintage Flâneur', icon: LibraryIcon, description: "Wanders through museums and old bookstores for fun.", gradientColors: ['#E2F0CB', '#F6D6AD'], color: "#E2F0CB" },
  { name: 'Joy Alchemist', icon: UserIcon, description: "Believes in joy as an aesthetic—loud colors, loud laugh.", gradientColors: ['#FDCB82', '#F9A1BC'], color: "#FDCB82" },
  { name: 'Sunkissed Soul', icon: SunIcon, description: "Loves beach playlists, sunny breakfasts, and warm energy.", gradientColors: ['#FFD6A5', '#FDFFB6'], color: "#FFD6A5" },
];

export const QUIZ_QUESTIONS: QuizQuestion[] = [
    { id: 'music', question: "What kind of music have you been listening to lately?", options: ['Indie Rock', 'Lofi Beats', '80s Synth-pop', 'Classical', 'Hip-Hop', 'Folk', 'Electronic', 'Jazz'] },
    { id: 'movies', question: "What movies have you enjoyed recently?", options: ['Sci-Fi Thrillers', 'Historical Dramas', 'A24 Films', 'Animated Features', 'Blockbuster Action', 'Documentaries', 'Romantic Comedies', 'Foreign Language'] },
    { id: 'books', question: "What's on your reading list?", options: ['Fantasy Epics', 'Poetry Collections', 'Biographies', 'Classic Literature', 'Non-fiction', 'Graphic Novels', 'Mystery & Thriller', 'Contemporary Fiction'] },
    { id: 'podcast', question: "What podcasts do you enjoy listening to?", options: ['True Crime', 'Comedy', 'News & Politics', 'Science & Tech', 'Self-Improvement', 'History', 'Fiction', 'Interview Shows'] },
    { id: 'videogame', question: "What types of video games do you play?", options: ['RPGs', 'FPS Games', 'Strategy', 'Indie Games', 'Simulation', 'Adventure', 'Sports', 'Puzzle Games'] },
    { id: 'tv_show', question: "What TV shows have you been watching?", options: ['Drama Series', 'Sitcoms', 'Reality TV', 'Anime', 'Crime Shows', 'Fantasy/Sci-Fi', 'Documentaries', 'Limited Series'] },
    { id: 'travel', question: "What's your ideal type of travel?", options: ['Backpacking SE Asia', 'Quiet Beach Towns', 'European Capitals', 'National Park Hikes', 'Cultural Immersion', 'Luxury Resorts', 'Road Trips', 'Mountain Retreats'] },
    { id: 'artist', question: "Which visual artists or art styles do you appreciate?", options: ['Contemporary Art', 'Classical Paintings', 'Street Art', 'Photography', 'Digital Art', 'Sculpture', 'Impressionism', 'Minimalism'] },
    { id: 'mirror', question: "What reflects your personality best?", options: ['Eclectic Mix', 'Authentic Self', 'Evolving Identity', 'Unique Perspective', 'Personal Journey', 'Individual Expression', 'True Reflection', 'Own Path'] },
];

const BlendIcon = ({ size = 24, color = "currentColor" }: IconProps) => (
  <Svg width={size} height={size} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke={color}><Path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></Svg>
);

export const CATEGORY_ICONS: { [key: string]: (props: IconProps) => React.ReactNode } = {
    music: MusicNoteIcon,
    movies: FilmIcon,
    books: BookOpenIcon,
    travel: CompassIcon,
    podcast: MicrophoneIcon,
    videogame: GamepadIcon,
    tv_show: TvIcon,
    artist: UserIcon,
    mirror: UserIcon,
    // For Tab Bar
    dashboard: HomeIcon,
    explore: MagnifyingGlassIcon,
    blend: BlendIcon,
    stepoutsidebubble: DiscoverIcon,
    community: UserGroupIcon,

    profile: UserCircleIcon,
};

// Defines how strongly an option resonates with an archetype (1: slight, 2: good, 3: perfect)
export const OPTION_AFFINITY: { [option: string]: { [archetypeName: string]: number } } = {
  // Music
  'Indie Rock': { 'Alt Pulse': 3, 'Culture Hacker': 2, 'Hidden Flame': 1 },
  'Lofi Beats': { 'Cloudwalker': 3, 'Zen Zest': 2, 'Minimal Spirit': 2 },
  '80s Synth-pop': { 'Retro Soul': 3, 'Neon Thinker': 2, 'Cyber Chill': 2 },
  'Classical': { 'Vintage Flâneur': 3, 'Mystic Pulse': 2, 'Cottage Noir': 1 },
  'Hip-Hop': { 'Culture Hacker': 3, 'Hyper Connector': 2, 'Sunset Rebel': 1 },
  'Folk': { 'Earth Artisan': 3, 'Wander Muse': 2, 'Cottage Noir': 2 },
  'Electronic': { 'Neon Thinker': 3, 'Cyber Chill': 3, 'Culture Hacker': 1 },
  'Jazz': { 'Vintage Flâneur': 2, 'Wander Muse': 2, 'Alt Pulse': 1 },
  // Movies
  'Sci-Fi Thrillers': { 'Neon Thinker': 3, 'Cyber Chill': 2, 'Culture Hacker': 1 },
  'Historical Dramas': { 'Vintage Flâneur': 3, 'Cottage Noir': 2, 'Retro Soul': 2 },
  'A24 Films': { 'Alt Pulse': 3, 'Hidden Flame': 2, 'Cine Nomad': 2 },
  'Animated Features': { 'Pop Dreamer': 3, 'Berry Bloom': 2, 'Joy Alchemist': 2 },
  'Blockbuster Action': { 'Hyper Connector': 2, 'Sunset Rebel': 2, 'Pop Dreamer': 1 },
  'Documentaries': { 'Mystic Pulse': 3, 'Vintage Flâneur': 2, 'Wander Muse': 2 },
  'Romantic Comedies': { 'Lyrical Romantic': 3, 'Berry Bloom': 2, 'Pop Dreamer': 2 },
  'Foreign Language': { 'Wander Muse': 3, 'Cine Nomad': 3, 'Culture Hacker': 2 },
  // Books
  'Fantasy Epics': { 'Neon Thinker': 2, 'Cloudwalker': 2, 'Hidden Flame': 1 },
  'Poetry Collections': { 'Lyrical Romantic': 3, 'Cottage Noir': 3, 'Berry Bloom': 2 },
  'Biographies': { 'Vintage Flâneur': 3, 'Mystic Pulse': 2, 'Joy Alchemist': 1 },
  'Classic Literature': { 'Vintage Flâneur': 3, 'Cottage Noir': 2, 'Lyrical Romantic': 2 },
  'Non-fiction': { 'Mystic Pulse': 3, 'Earth Artisan': 2, 'Zen Zest': 2 },
  'Graphic Novels': { 'Culture Hacker': 2, 'Kaleido Crafter': 2, 'Alt Pulse': 2 },
  'Mystery & Thriller': { 'Hidden Flame': 2, 'Cine Nomad': 1, 'Cottage Noir': 1 },
  'Contemporary Fiction': { 'Lyrical Romantic': 2, 'Cloudwalker': 2, 'Berry Bloom': 1 },
  // Travel
  'Backpacking SE Asia': { 'Wander Muse': 3, 'Tropic Vibist': 2, 'Culture Hacker': 2 },
  'Quiet Beach Towns': { 'Zen Zest': 3, 'Sunkissed Soul': 3, 'Minimal Spirit': 2 },
  'European Capitals': { 'Vintage Flâneur': 2, 'Wander Muse': 2, 'Cine Nomad': 2 },
  'National Park Hikes': { 'Earth Artisan': 3, 'Mystic Pulse': 2, 'Zen Zest': 2 },
  'Cultural Immersion': { 'Wander Muse': 3, 'Mystic Pulse': 2, 'Culture Hacker': 2 },
  'Luxury Resorts': { 'Sunkissed Soul': 2, 'Joy Alchemist': 2, 'Pop Dreamer': 1 },
  'Road Trips': { 'Sunset Rebel': 2, 'Retro Soul': 2, 'Wander Muse': 1 },
  'Mountain Retreats': { 'Mystic Pulse': 3, 'Earth Artisan': 2, 'Zen Zest': 3 },
  // Podcasts
  'True Crime': { 'Hidden Flame': 2, 'Cottage Noir': 2, 'Cine Nomad': 1 },
  'Comedy': { 'Joy Alchemist': 3, 'Hyper Connector': 3, 'Pop Dreamer': 2 },
  'News & Politics': { 'Culture Hacker': 2, 'Sunset Rebel': 2, 'Vintage Flâneur': 1 },
  'Science & Tech': { 'Neon Thinker': 3, 'Cyber Chill': 3, 'Culture Hacker': 2 },
  'Self-Improvement': { 'Mystic Pulse': 3, 'Zen Zest': 2, 'Earth Artisan': 2 },
  'History': { 'Vintage Flâneur': 3, 'Cottage Noir': 2, 'Retro Soul': 2 },
  'Fiction': { 'Lyrical Romantic': 3, 'Cloudwalker': 2, 'Berry Bloom': 2 },
  'Interview Shows': { 'Hyper Connector': 2, 'Culture Hacker': 2, 'Joy Alchemist': 1 },
  // Video Games
  'RPGs': { 'Neon Thinker': 2, 'Hidden Flame': 2, 'Cloudwalker': 1 },
  'FPS Games': { 'Cyber Chill': 2, 'Sunset Rebel': 2, 'Hyper Connector': 1 },
  'Strategy': { 'Minimal Spirit': 2, 'Vintage Flâneur': 2, 'Neon Thinker': 1 },
  'Indie Games': { 'Alt Pulse': 3, 'Culture Hacker': 2, 'Kaleido Crafter': 2 },
  'Simulation': { 'Earth Artisan': 2, 'Zen Zest': 2, 'Minimal Spirit': 1 },
  'Adventure': { 'Wander Muse': 2, 'Tropic Vibist': 2, 'Cine Nomad': 1 },
  'Sports': { 'Hyper Connector': 2, 'Sunkissed Soul': 2, 'Joy Alchemist': 1 },
  'Puzzle Games': { 'Minimal Spirit': 3, 'Zen Zest': 2, 'Mystic Pulse': 1 },
  // TV Shows
  'Drama Series': { 'Cottage Noir': 2, 'Berry Bloom': 2, 'Lyrical Romantic': 1 },
  'Sitcoms': { 'Joy Alchemist': 3, 'Pop Dreamer': 2, 'Hyper Connector': 2 },
  'Reality TV': { 'Hyper Connector': 3, 'Pop Dreamer': 2, 'Joy Alchemist': 2 },
  'Anime': { 'Neon Thinker': 3, 'Pop Dreamer': 2, 'Culture Hacker': 2 },
  'Crime Shows': { 'Hidden Flame': 2, 'Cottage Noir': 1, 'Cine Nomad': 1 },
  'Fantasy/Sci-Fi': { 'Neon Thinker': 3, 'Cyber Chill': 2, 'Cloudwalker': 2 },
  'Limited Series': { 'Cine Nomad': 2, 'Alt Pulse': 2, 'Berry Bloom': 1 },
  // Artists
  'Contemporary Art': { 'Kaleido Crafter': 3, 'Culture Hacker': 2, 'Alt Pulse': 2 },
  'Classical Paintings': { 'Vintage Flâneur': 3, 'Cottage Noir': 2, 'Retro Soul': 1 },
  'Street Art': { 'Culture Hacker': 3, 'Sunset Rebel': 2, 'Alt Pulse': 2 },
  'Photography': { 'Minimal Spirit': 2, 'Wander Muse': 2, 'Cloudwalker': 1 },
  'Digital Art': { 'Neon Thinker': 3, 'Kaleido Crafter': 3, 'Cyber Chill': 2 },
  'Sculpture': { 'Earth Artisan': 3, 'Minimal Spirit': 2, 'Vintage Flâneur': 1 },
  'Impressionism': { 'Vintage Flâneur': 3, 'Cottage Noir': 2, 'Retro Soul': 2 },
  'Minimalism': { 'Minimal Spirit': 3, 'Zen Zest': 2, 'Earth Artisan': 1 },
  // Mirror
  'Eclectic Mix': { 'Culture Hacker': 3, 'Kaleido Crafter': 2, 'Wander Muse': 2 },
  'Authentic Self': { 'Earth Artisan': 3, 'Mystic Pulse': 2, 'Hidden Flame': 2 },
  'Evolving Identity': { 'Culture Hacker': 2, 'Neon Thinker': 2, 'Alt Pulse': 1 },
  'Unique Perspective': { 'Alt Pulse': 2, 'Hidden Flame': 2, 'Cottage Noir': 2 },
  'Personal Journey': { 'Mystic Pulse': 3, 'Wander Muse': 2, 'Cloudwalker': 2 },
  'Individual Expression': { 'Kaleido Crafter': 3, 'Sunset Rebel': 2, 'Alt Pulse': 2 },
  'True Reflection': { 'Minimal Spirit': 2, 'Berry Bloom': 2, 'Lyrical Romantic': 2 },
  'Own Path': { 'Wander Muse': 2, 'Earth Artisan': 2, 'Hidden Flame': 2 },
};

// Teaser lines for daily recommendations
export const DAILY_TEASER_LINES = [
  "Your taste radar is pinging — fresh discoveries await ✨",
  "We've curated some gems that match your vibe perfectly 🎯",
  "Ready for your next cultural obsession? We found it 🔥",
  "Your archetype whispered... and we listened 👂",
  "Plot twist: today's picks might just blow your mind 🤯",
  "Handpicked for someone with your exquisite taste 💎",
  "Your next favorite thing is hiding in today's lineup 🎭",
  "Warning: these recommendations may cause serious FOMO 🚨",
  "Tailored to perfection — just like your coffee order ☕",
  "Your cultural DNA says you'll love what's below 🧬"
];

// Daily taste puzzles - simplified
const DAILY_PUZZLES = [
  {
    puzzle_date: new Date().toISOString().split('T')[0],
    clues: [
      "I dance with echoes of neon dreams,",
      "Vinyl scratches my nightly themes,",
      "I surf through sound, but not in waves,",
      "Who am I among these taste enclaves?"
    ],
    choices: ["Techno Sage", "Cultural Voyager", "Indie Nomad", "Deep Nostalgic"],
    correct_answer: "Techno Sage",
    reaction_text_if_correct: "🎉 Boom! You're thinking like a Techno Sage.",
    reaction_text_if_wrong: "🧐 Close! But this taste belongs to a Techno Sage.",
    share_text: "I cracked today's #TastePuzzle! 🔍🧠 Can you guess the right Archetype?"
  }
];

export const getDailyPuzzle = () => DAILY_PUZZLES[0];



// Cryptic archetype riddles
export const CRYPTIC_RIDDLES = [
  {
    clue: "I feast on melodies that echo from forgotten alleyways,\nMy bookshelf holds stories that never made the bestseller lists,\nI collect moments that Instagram forgot to capture.",
    archetype: "The Underground Curator",
    emoji: "🕵️",
    reveal: "You see beauty in the overlooked and magic in the margins!"
  },
  {
    clue: "My playlist spans centuries, my palate crosses continents,\nI read subtitles like poetry and find art in street corners,\nEvery passport stamp is a new chapter in my story.",
    archetype: "The Cultural Nomad",
    emoji: "🌍",
    reveal: "The world is your gallery, and you're the ultimate curator!"
  },
  {
    clue: "I crave soundtracks from cities that never sleep,\nI read authors who write between borders,\nMy passport is more worn than my playlist.",
    archetype: "The Global Voyager",
    emoji: "✈️",
    reveal: "Distance means nothing when culture calls your name!"
  },
  {
    clue: "I find symphonies in coffee shop conversations,\nMy favorite films are the ones that make you think twice,\nI collect vintage souls in modern bodies.",
    archetype: "The Thoughtful Romantic",
    emoji: "💭",
    reveal: "You turn everyday moments into extraordinary memories!"
  },
  {
    clue: "My taste buds speak in algorithms, my ears hear in pixels,\nI binge stories that exist in parallel universes,\nTomorrow's trends are today's obsessions.",
    archetype: "The Digital Prophet",
    emoji: "🔮",
    reveal: "You're living in 3024 while the rest of us catch up!"
  }
];

// Future archetype predictions
export const FUTURE_ARCHETYPES = [
  {
    name: 'The Avant-Garde',
    emoji: '🎭',
    description: "You're evolving into a Cultural Synthesizer — globally curious, with an eye for hidden gems in cinema and cuisine. Your taste is becoming more experimental and boundary-pushing."
  },
  {
    name: 'The Digital Mystic',
    emoji: '🔮',
    description: "Your future self blends ancient wisdom with cutting-edge technology. You'll find meaning in both meditation apps and sci-fi literature, creating a unique spiritual-digital identity."
  },
  {
    name: 'The Neo-Renaissance',
    emoji: '🎨',
    description: "You're developing into a modern polymath — someone who appreciates classical art while embracing contemporary innovation. Your taste spans centuries and mediums."
  },
  {
    name: 'The Conscious Creator',
    emoji: '🌱',
    description: "Your evolving archetype focuses on sustainable, mindful consumption. You'll gravitate toward ethical brands, regenerative art, and content that makes a positive impact."
  },
  {
    name: 'The Hybrid Explorer',
    emoji: '🚀',
    description: "You're becoming someone who seamlessly blends physical and digital experiences. Virtual concerts, AR art galleries, and immersive storytelling will define your cultural journey."
  }
];
