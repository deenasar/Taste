
import React, { useContext, useState, useEffect, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TextInput, TouchableOpacity, ActivityIndicator, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppContext } from '../App';
import MirrorOfYou from '../components/MirrorOfYou';
import DailyTeaserCard from '../components/DailyTeaserCard';
import TinderSwipeDeck from '../components/TinderSwipeDeck';
import { FireIcon } from 'react-native-heroicons/solid';
import LinearGradient from 'react-native-linear-gradient';
import BadgeDashboard from './BadgeDashboard';
import BadgeService from '../services/badgeService';

// Import logo images
const logoLight = require('../assets/logo-lightmode.jpg');
const logoDark = require('../assets/logo-darkmode.jpg');

const ArchetypeCard: React.FC = () => {
    const context = useContext(AppContext);
    if (!context || !context.result) return null;

    const { archetype, summary } = context.result;
    const Icon = archetype.icon;
    const { darkMode } = context;
    const styles = createStyles(darkMode);

    return (
        <LinearGradient
            colors={archetype.gradientColors}
            style={styles.archetypeCardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
        >
            <View style={styles.archetypeCardInner}>
                <View style={styles.archetypeHeader}>
                    <View style={[styles.iconContainer, { backgroundColor: archetype.gradientColors[1] }]}>
                        <Icon size={32} color="white"/>
                    </View>
                    <View>
                        <Text style={styles.archetypeName}>{archetype.name}</Text>
                        <Text style={styles.archetypeSubtitle}>Your Taste Archetype</Text>
                    </View>
                </View>
                <Text style={styles.archetypeSummary}>
                    "{summary}"
                </Text>
            </View>
        </LinearGradient>
    );
};

const RecommendationCard: React.FC<{title: string, category: string, image: string}> = ({ title, category, image }) => {
    const { darkMode } = useContext(AppContext)!;
    const styles = createStyles(darkMode);
    return (
        <View style={styles.recCard}>
            <View>
                <Image source={{ uri: image }} style={styles.recImage}/>
                <View style={styles.recHeartContainer}>
                    <HeartIcon size={20} color="white" style={{ opacity: 0.8 }} />
                </View>
            </View>
            <View style={styles.recTextContainer}>
                <Text style={styles.recCategory}>{category}</Text>
                <Text style={styles.recTitle}>{title}</Text>
            </View>
        </View>
    );
};

const MOOD_OPTIONS = [
    { emoji: '😊', label: 'Happy' },
    { emoji: '😢', label: 'Sad' },
    { emoji: '😡', label: 'Frustrated' },
    { emoji: '😌', label: 'Relaxed' },
    { emoji: '🤔', label: 'Confused' },
    { emoji: '🤩', label: 'Excited' },
    { emoji: '⚡', label: 'Energetic' },
    { emoji: '🎯', label: 'Focused' },
    { emoji: '😰', label: 'Anxious' },
    { emoji: '🥰', label: 'Loved' },
    { emoji: '😴', label: 'Sleepy' },
    { emoji: '🤗', label: 'Grateful' },
    { emoji: '😎', label: 'Cool' },
    { emoji: '🥳', label: 'Celebratory' },
    { emoji: '😭', label: 'Overwhelmed' }
];

const Dashboard: React.FC = () => {
    const { darkMode, preferences, result } = useContext(AppContext)!;
    const styles = createStyles(darkMode);
    const scrollViewRef = useRef<ScrollView>(null);
    const [recommendationsY, setRecommendationsY] = useState(0);
    
    const [selectedMood, setSelectedMood] = useState<string>('');
    const [customMood, setCustomMood] = useState<string>('');
    const [showDropdown, setShowDropdown] = useState<boolean>(false);
    const [moodRecommendations, setMoodRecommendations] = useState<Record<string, any[]>>({});
    const [loading, setLoading] = useState<boolean>(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [itemDetails, setItemDetails] = useState<any>(null);
    const [detailsLoading, setDetailsLoading] = useState<boolean>(false);
    const [showBadgeUnlock, setShowBadgeUnlock] = useState<boolean>(false);
    const [unlockedBadge, setUnlockedBadge] = useState<any>(null);
    const [isLiked, setIsLiked] = useState<boolean>(false);
    const [showLikeAnimation, setShowLikeAnimation] = useState<boolean>(false);

    // Utility function to shuffle an array (Fisher-Yates algorithm)
    const shuffleArray = (array: any[]) => {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    };

    const fetchMoodRecommendations = async (mood: string) => {
        if (!mood) return;
        
        try {
            const today = new Date().toDateString();
            const cacheKey = `recommendations_${today}_${mood}`;
            const cachedData = await AsyncStorage.getItem(cacheKey);

            if (cachedData) {
                setMoodRecommendations(JSON.parse(cachedData));
                console.log('Using cached recommendations for', mood);
                return;
            }

            setLoading(true);
            const response = await fetch('https://taste-backend-fxwh.onrender.com/daily-recommendations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    mood,
                    preferences: preferences || {}
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch mood recommendations');
            }

            const data = await response.json();
            console.log('Mood recommendations:', data);
            
            if (data.status === 'success' && data.recommendations) {
                // Process recommendations to shuffle each individual list
                const processedRecommendations: Record<string, any[]> = {};
                
                Object.entries(data.recommendations).forEach(([category, lists]) => {
                    if (Array.isArray(lists)) {
                        // For each list in the category, shuffle it individually
                        processedRecommendations[category] = (lists as any[]).map(list => {
                            return Array.isArray(list) ? shuffleArray(list) : list;
                        });
                    } else {
                        processedRecommendations[category] = lists;
                    }
                });
                
                setMoodRecommendations(processedRecommendations);
                
                // Track category views for badge system
                Object.keys(processedRecommendations).forEach(category => {
                    BadgeService.trackCategoryView(category);
                });
                
                // Cache with date + mood key
                const today = new Date().toDateString();
                const cacheKey = `recommendations_${today}_${mood}`;
                await AsyncStorage.setItem(cacheKey, JSON.stringify(processedRecommendations));
                
                console.log('Processed and cached recommendations:', JSON.stringify(processedRecommendations));
            }
        } catch (error) {
            console.error('Error fetching mood recommendations:', error);
        } finally {
            setLoading(false);
        }
    };
    
    // Check for cached daily recommendations on mount
    useEffect(() => {
        checkDailyRecommendations();
        initializeBadges();
    }, []);

    const initializeBadges = async () => {
        await BadgeService.initializeBadgeProgress();
        await BadgeService.trackDailyLogin();
    };

    const checkDailyRecommendations = async () => {
        try {
            const today = new Date().toDateString();
            const cachedDate = await AsyncStorage.getItem('dailyRecommendationsDate');
            const cachedRecommendations = await AsyncStorage.getItem('dailyRecommendations');
            const cachedMood = await AsyncStorage.getItem('dailyMood');

            if (cachedDate === today && cachedRecommendations && cachedMood) {
                // Same day - use cached data
                setSelectedMood(cachedMood);
                setMoodRecommendations(JSON.parse(cachedRecommendations));
            } else {
                // New day or no cache - clear mood selection
                setSelectedMood('');
                setMoodRecommendations({});
            }
        } catch (error) {
            console.error('Error checking daily recommendations:', error);
            setSelectedMood('');
            setMoodRecommendations({});
        }
    };

    const handleMoodSelection = async (mood: string) => {
        setSelectedMood(mood);
        setCustomMood('');
        setShowDropdown(false);
        fetchMoodRecommendations(mood);
        await BadgeService.trackMoodVote();
    };

    const handleCustomMoodSubmit = async () => {
        if (customMood.trim()) {
            setSelectedMood(customMood.trim());
            setShowDropdown(false);
            fetchMoodRecommendations(customMood.trim());
            await BadgeService.trackMoodVote();
        }
    };
    
    const fetchItemDetails = async (name: string, category: string) => {
        try {
            setDetailsLoading(true);
            console.log(`Fetching details for ${name} in category ${category}`);
            
            const requestBody = { name, category };
            console.log('Request body:', requestBody);
            
            const response = await fetch('https://taste-backend-fxwh.onrender.com/get-item-details', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            console.log('Response status:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Error:', errorText);
                throw new Error(`Failed to fetch item details: ${response.status}`);
            }

            const data = await response.json();
            console.log('Full API response:', JSON.stringify(data, null, 2));
            
            if (data.status === 'success' && data.details) {
                console.log('Setting item details:', data.details);
                // Fix the typo in genre field if it exists
                const processedDetails = { ...data.details };
                if (processedDetails.genrre && !processedDetails.genre) {
                    processedDetails.genre = processedDetails.genrre;
                    delete processedDetails.genrre;
                }
                setItemDetails(processedDetails);
            } else {
                console.log('No details found in response');
                setItemDetails({ error: 'No details available for this item' });
            }
        } catch (error) {
            console.error('Error fetching item details:', error);
            setItemDetails({ error: 'Failed to load item details' });
        } finally {
            setDetailsLoading(false);
        }
    };

    // Render the details modal
    const renderDetailsModal = () => {
        if (!selectedItem) return null;
        
        return (
            <Modal
                visible={!!selectedItem}
                animationType="slide"
                transparent={true}
                onRequestClose={() => {
                    setSelectedItem(null);
                    setItemDetails(null);
                    setIsLiked(false);
                    setShowLikeAnimation(false);
                }}
            >
                <View style={styles.modalContainer}>
                    <View style={[styles.modalContent, darkMode ? styles.modalContentDark : styles.modalContentLight]}>
                        <TouchableOpacity 
                            style={styles.closeButton}
                            onPress={() => {
                                setSelectedItem(null);
                                setItemDetails(null);
                                setIsLiked(false);
                                setShowLikeAnimation(false);
                            }}
                        >
                            <Text style={styles.closeButtonText}>✕</Text>
                        </TouchableOpacity>
                        
                        {selectedItem.image && (
                            <Image 
                                source={{ uri: selectedItem.image }} 
                                style={styles.detailsImage}
                                resizeMode="cover"
                            />
                        )}
                        
                        <View style={styles.detailsImageOverlay}>
                            <Text style={styles.detailsTitle}>{selectedItem.name}</Text>
                        </View>
                        
                        <View style={styles.detailsContent}>
                            {showLikeAnimation && (
                                <View style={styles.likeAnimationOverlay}>
                                    <Text style={styles.likeAnimationText}>💖 You loved this! 💖</Text>
                                    <Text style={styles.likeAnimationSubtext}>Added to your favorites ✨</Text>
                                </View>
                            )}
                            {!itemDetails || Object.keys(itemDetails).length === 0 ? (
                                <View style={styles.loadingContainer}>
                                    <ActivityIndicator size="large" color={darkMode ? '#38bdf8' : '#3b82f6'} />
                                    <Text style={styles.loadingText}>Loading details...</Text>
                                </View>
                            ) : (
                                <>
                                    <ScrollView style={styles.detailsScrollView}>
                                        <View style={styles.detailsInfo}>
                                            {Object.entries(itemDetails).map(([key, value]) => {
                                                if (key === 'name') return null;
                                                if (key === 'error') {
                                                    return (
                                                        <Text key={key} style={styles.errorText}>{value as string}</Text>
                                                    );
                                                }
                                                
                                                if (key === 'platforms_available' && Array.isArray(value)) {
                                                    return (
                                                        <View key={key} style={styles.detailsRow}>
                                                            <Text style={styles.detailsLabel}>Available On:</Text>
                                                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.platformsScrollContainer}>
                                                                {value.map((platform: any, index: number) => (
                                                                    <View key={index} style={styles.platformDetailItem}>
                                                                        <Text style={styles.platformDetailName}>
                                                                            {typeof platform === 'object' ? platform.name || 'Unknown' : platform}
                                                                        </Text>
                                                                    </View>
                                                                ))}
                                                            </ScrollView>
                                                        </View>
                                                    );
                                                }
                                                
                                                return (
                                                    <View key={key} style={styles.detailsRow}>
                                                        <Text style={styles.detailsLabel}>
                                                            {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}:
                                                        </Text>
                                                        {Array.isArray(value) ? (
                                                            <Text style={styles.detailsValue}>{(value as string[]).join(', ')}</Text>
                                                        ) : (
                                                            <Text style={styles.detailsValue}>{value as string}</Text>
                                                        )}
                                                    </View>
                                                );
                                            })}
                                        </View>
                                    </ScrollView>
                                </>
                            )}
                        </View>
                    </View>
                </View>
            </Modal>
        );
    };

    // Use memoization to shuffle recommendations only when they change
    const shuffledRecommendations = useMemo(() => {
        const result: Record<string, any[]> = {};
        
        Object.entries(moodRecommendations).forEach(([category, lists]) => {
            if (Array.isArray(lists)) {
                // For each list in the category, shuffle it individually
                result[category] = (lists as any[]).map(list => {
                    return Array.isArray(list) ? shuffleArray(list) : list;
                });
            } else {
                result[category] = lists;
            }
        });
        
        return result;
    }, [moodRecommendations]);

    return (
        <ScrollView ref={scrollViewRef} style={styles.container}>
            {renderDetailsModal()}
            <View style={styles.content}>
                <ArchetypeCard />
                
                {/* Daily Teaser Card */}
                <DailyTeaserCard 
                    themeColors={result?.archetype?.gradientColors || ['#A864F1', '#8B5CF6']}
                    onPress={() => {
                        scrollViewRef.current?.scrollTo({ y: recommendationsY - 20, animated: true });
                    }}
                    darkMode={darkMode}
                />
                
                <MirrorOfYou />
                <BadgeDashboard onBadgeUnlocked={(badge) => console.log('Badge unlocked:', badge)} />
                
                <View onLayout={(event) => {
                    const { y } = event.nativeEvent.layout;
                    setRecommendationsY(y);
                }}>
                    
                    {/* Mood Selector */}
                    <View style={styles.moodSelectorContainer}>
                        <Text style={styles.moodLabel}>How are you feeling today?</Text>
                        
                        <TouchableOpacity 
                            style={styles.moodSelector} 
                            onPress={() => {
                                setShowDropdown(!showDropdown);
                                if (!showDropdown) {
                                    setTimeout(() => {
                                        scrollViewRef.current?.scrollTo({ y: recommendationsY + 100, animated: true });
                                    }, 100);
                                }
                            }}
                        >
                            <LinearGradient
                                colors={result?.archetype?.gradientColors || ['#A864F1', '#8B5CF6']}
                                style={styles.moodSelectorGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <Text style={styles.moodSelectorText}>
                                    {selectedMood ? `${MOOD_OPTIONS.find(m => m.label === selectedMood)?.emoji || '🎭'} ${selectedMood}` : '🎭 How are you feeling right now?'}
                                </Text>
                                <FireIcon size={20} color="white" />
                            </LinearGradient>
                        </TouchableOpacity>
                        
                        {showDropdown && (
                            <View style={styles.horizontalMoodContainer}>
                                <ScrollView 
                                    horizontal 
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={styles.horizontalMoodScroll}
                                >
                                    {MOOD_OPTIONS.map((mood, index) => (
                                        <TouchableOpacity 
                                            key={index} 
                                            style={[styles.moodCard, selectedMood === mood.label && styles.selectedMoodCard]}
                                            onPress={() => handleMoodSelection(mood.label)}
                                        >
                                            <Text style={styles.moodCardEmoji}>{mood.emoji}</Text>
                                            <Text style={[styles.moodCardText, selectedMood === mood.label && styles.selectedMoodCardText]}>
                                                {mood.label}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                                
                                <View style={styles.customMoodContainer}>
                                    <TextInput
                                        style={styles.customMoodInput}
                                        placeholder="Describe your mood..."
                                        value={customMood}
                                        onChangeText={setCustomMood}
                                        placeholderTextColor={darkMode ? '#9ca3af' : '#6b7280'}
                                    />
                                    <TouchableOpacity 
                                        style={[styles.customMoodButton, { backgroundColor: result?.archetype?.gradientColors?.[0] || '#A864F1' }]}
                                        onPress={handleCustomMoodSubmit}
                                    >
                                        <Text style={styles.customMoodButtonText}>Go</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                    </View>
                    
                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={darkMode ? '#38bdf8' : '#3b82f6'} />
                            <Text style={styles.loadingText}>Finding recommendations for your mood...</Text>
                        </View>
                    ) : Object.keys(shuffledRecommendations).length > 0 ? (
                        <TinderSwipeDeck
                            recommendations={shuffledRecommendations}
                            darkMode={darkMode}
                            onItemPress={(item, category) => {
                                const itemName = item.name || 'Unknown Item';
                                setSelectedItem({
                                    ...item,
                                    name: itemName,
                                    category: category
                                });
                                setItemDetails(null);
                                fetchItemDetails(itemName, category);
                            }}
                        />
                    ) : (
                        <View style={styles.emptyRecommendations}>
                            <Text style={styles.emptyText}>🎭</Text>
                            <Text style={styles.emptyMainText}>Select a mood to get recommendations</Text>
                            <Text style={styles.emptySubText}>Choose how you're feeling to discover personalized content</Text>
                        </View>
                    )}
                </View>
            </View>
        </ScrollView>
    );
};

const createStyles = (darkMode: boolean) => StyleSheet.create({
    // Modal styles
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        width: '90%',
        maxHeight: '95%',
        borderRadius: 16,
        overflow: 'hidden',
    },
    modalContentLight: {
        backgroundColor: '#ffffff',
    },
    modalContentDark: {
        backgroundColor: '#1f2937',
    },
    closeButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 10,
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    detailsImage: {
        width: '100%',
        height: 200,
    },
    detailsImageOverlay: {
        backgroundColor: 'rgba(0,0,0,0.6)',
        padding: 16,
    },
    detailsTitle: {
        color: '#ffffff',
        fontSize: 24,
        fontWeight: 'bold',
        fontFamily: 'Rubik',
    },
    detailsContent: {
        padding: 16,
        maxHeight: 540,
        position: 'relative',
    },
    detailsScrollView: {
        maxHeight: 400,
    },
    likeAnimationOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(239, 68, 68, 0.95)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        borderRadius: 12,
    },
    likeAnimationText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#ffffff',
        fontFamily: 'Rubik',
        textAlign: 'center',
        marginBottom: 8,
    },
    likeAnimationSubtext: {
        fontSize: 16,
        color: '#ffffff',
        fontFamily: 'Lato',
        textAlign: 'center',
        opacity: 0.9,
    },
    detailsInfo: {
        gap: 12,
    },
    detailsRow: {
        marginBottom: 8,
    },
    detailsLabel: {
        fontFamily: 'Rubik',
        fontWeight: 'bold',
        fontSize: 16,
        color: darkMode ? '#f3f4f6' : '#111827',
        marginBottom: 4,
    },
    detailsValue: {
        fontFamily: 'Lato',
        fontSize: 14,
        color: darkMode ? '#d1d5db' : '#374151',
        lineHeight: 20,
    },
    errorText: {
        color: '#ef4444',
        fontFamily: 'Lato',
        fontSize: 14,
        textAlign: 'center',
        padding: 20,
    },
    noDetailsText: {
        color: darkMode ? '#d1d5db' : '#374151',
        fontFamily: 'Lato',
        fontSize: 14,
        textAlign: 'center',
        padding: 20,
    },
    // Mood Selector Styles
    moodSelectorContainer: {
        marginBottom: 8,
        position: 'relative',
    },
    moodLabel: {
        fontFamily: 'Rubik',
        fontSize: 18,
        fontWeight: 'bold',
        color: darkMode ? '#f3f4f6' : '#111827',
        marginBottom: 12,
    },
    moodSelector: {
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 10,
    },
    moodSelectorGradient: {
        padding: 16,
        borderRadius: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    moodSelectorText: {
        fontFamily: 'Rubik',
        fontSize: 16,
        fontWeight: 'bold',
        color: darkMode ? '#ffffff' : '#000000',
        textShadowColor: darkMode ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.8)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    horizontalMoodContainer: {
        marginTop: 16,
        backgroundColor: darkMode ? '#1f2937' : '#ffffff',
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 15,
        padding: 16,
        marginBottom: 12,
    },
    horizontalMoodScroll: {
        paddingHorizontal: 4,
        gap: 12,
    },
    moodCard: {
        alignItems: 'center',
        padding: 16,
        backgroundColor: darkMode ? '#374151' : '#f8fafc',
        borderRadius: 12,
        borderWidth: 2,
        borderColor: 'transparent',
        minWidth: 90,
        height: 80,
    },
    selectedMoodCard: {
        borderColor: darkMode ? '#60a5fa' : '#3b82f6',
        backgroundColor: darkMode ? '#1e40af' : '#dbeafe',
    },
    moodCardEmoji: {
        fontSize: 24,
        marginBottom: 4,
    },
    moodCardText: {
        fontFamily: 'Rubik',
        fontSize: 12,
        color: darkMode ? '#f3f4f6' : '#111827',
        textAlign: 'center',
    },
    selectedMoodCardText: {
        fontWeight: 'bold',
        color: darkMode ? '#ffffff' : '#1e40af',
    },
    customMoodContainer: {
        flexDirection: 'row',
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: darkMode ? 'rgba(55, 65, 81, 0.3)' : 'rgba(229, 231, 235, 0.5)',
        marginTop: 16,
    },
    customMoodInput: {
        flex: 1,
        fontFamily: 'Lato',
        fontSize: 16,
        color: darkMode ? '#f3f4f6' : '#111827',
        padding: 12,
        backgroundColor: darkMode ? 'rgba(31, 41, 55, 0.5)' : 'rgba(255, 255, 255, 0.8)',
        borderRadius: 12,
        marginRight: 12,
        borderWidth: 1,
        borderColor: darkMode ? 'rgba(75, 85, 99, 0.5)' : 'rgba(229, 231, 235, 0.5)',
    },
    customMoodButton: {
        borderRadius: 12,
        paddingHorizontal: 20,
        paddingVertical: 12,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    customMoodButtonText: {
        color: '#ffffff',
        fontFamily: 'Rubik',
        fontWeight: 'bold',
        fontSize: 14,
    },
    loadingContainer: {
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        marginTop: 10,
        color: darkMode ? '#d1d5db' : '#374151',
        fontFamily: 'Lato',
        fontSize: 16,
    },
    container: {
        flex: 1,
    },
    content: {
        padding: 16,
        gap: 24,
    },


    // Archetype Card
    archetypeCardGradient: {
        borderRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 10,
    },
    archetypeCardInner: {
        backgroundColor: 'transparent',
        padding: 24,
    },
    archetypeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    archetypeName: {
        fontFamily: 'Rubik',
        fontWeight: 'bold',
        fontSize: 28,
        color: darkMode ? '#FFF' : '#000000',
        textShadowColor: darkMode ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.8)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    archetypeSubtitle: {
        fontFamily: 'Lato',
        fontSize: 14,
        color: darkMode ? '#FFF' : '#000000',
        opacity: darkMode ? 0.8 : 0.9,
        textShadowColor: darkMode ? 'transparent' : 'rgba(255,255,255,0.8)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 1,
    },
    archetypeSummary: {
        marginTop: 16,
        lineHeight: 24,
        fontFamily: 'Rubik',
        fontStyle: 'italic',
        fontSize: 16,
        color: darkMode ? '#FFF' : '#000000',
        opacity: darkMode ? 0.9 : 0.95,
        textShadowColor: darkMode ? 'transparent' : 'rgba(255,255,255,0.8)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 1,
    },
    // Empty state
    emptyRecommendations: {
        padding: 60,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 200,
    },
    emptyText: {
        fontSize: 48,
        marginBottom: 16,
    },
    emptyMainText: {
        color: darkMode ? '#f3f4f6' : '#1f2937',
        fontFamily: 'Rubik',
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 8,
    },
    emptySubText: {
        color: darkMode ? '#9ca3af' : '#374151',
        fontFamily: 'Lato',
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
    },

    recGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        justifyContent: 'center',
    },
    recCard: {
        backgroundColor: darkMode ? '#1f2937' : '#FFF',
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: darkMode ? 0.2 : 0.05,
        shadowRadius: 6,
        elevation: 4,
        overflow: 'hidden',
        width: '46%', // Two columns with gap
    },
    recImage: {
        width: '100%',
        height: 120,
    },
    recHeartContainer: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(0,0,0,0.3)',
        padding: 6,
        borderRadius: 15,
    },
    recTextContainer: {
        padding: 12,
    },
    recCategory: {
        fontSize: 12,
        fontWeight: '600',
        color: '#3b82f6',
        fontFamily: 'Lato',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    recTitle: {
        fontFamily: 'Rubik',
        fontWeight: 'bold',
        fontSize: 16,
        color: darkMode ? '#FFF' : '#111827',
    },
    platformsScrollContainer: {
        marginTop: 8,
    },
    platformDetailItem: {
        marginRight: 12,
    },
    platformDetailName: {
        color: darkMode ? '#f3f4f6' : '#111827',
        fontSize: 12,
        fontFamily: 'Lato',
        backgroundColor: darkMode ? '#374151' : '#f3f4f6',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: darkMode ? '#374151' : '#e5e7eb',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 16,
        gap: 4,
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
        fontFamily: 'Rubik',
    },
});

export default Dashboard;
