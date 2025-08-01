
import React, { useState, useContext, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ImageBackground, Platform, Modal, ActivityIndicator } from 'react-native';
import { CATEGORY_ICONS } from '@/constants';
import type { QuizQuestion } from '@/types';
import { AppContext } from '@/App';

type Category = QuizQuestion['id'] | 'podcast' | 'videogame' | 'tv_show' | 'artist';
const TABS: Category[] = ['movies', 'music', 'books', 'podcast', 'videogame', 'tv_show', 'travel', 'artist'];

const getDisplayName = (tab: Category): string => {
  switch (tab) {
    case 'tv_show': return 'TV Shows';
    case 'videogame': return 'Video Games';
    default: return tab.charAt(0).toUpperCase() + tab.slice(1);
  }
};

const Explore: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Category>('movies');
  const { darkMode, preferences } = useContext(AppContext)!;
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [itemDetails, setItemDetails] = useState<any>(null);
  const [detailsLoading, setDetailsLoading] = useState<boolean>(false);
  


  const styles = createStyles(darkMode);

  const fetchItemDetails = async (name: string, category: Category) => {
    try {
      setDetailsLoading(true);
      console.log(`Fetching details for ${name} in category ${category}`);
      
      const response = await fetch('https://taste-backend-fxwh.onrender.com/get-item-details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, category }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch item details');
      }

      const data = await response.json();
      console.log('Item details response:', data);
      
      if (data.details) {
        setItemDetails(data.details);
      }
    } catch (error) {
      console.error('Error fetching item details:', error);
      setItemDetails(null);
    } finally {
      setDetailsLoading(false);
    }
  };

  const sendPreferencesToBackend = async (preferences: any, category: Category) => {
    try {
      setLoading(true);
      setRecommendations([]);
      
      console.log('Starting per-preference flow for category:', category);
      const blocks: any[] = [];
      
      // Loop through all preferences and send individual requests
      for (const [exampleCategory, preferenceList] of Object.entries(preferences)) {
        if (Array.isArray(preferenceList)) {
          for (const preference of preferenceList) {
            try {
              const requestBody = {
                activeCategory: category,
                exampleCategory: exampleCategory,
                preference: preference
              };
              
              console.log('Sending request:', requestBody);
              
              const response = await fetch('https://taste-backend-fxwh.onrender.com/save-preferences', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
              });
              
              if (response.ok) {
                const data = await response.json();
                console.log('Received block:', data);
                blocks.push(data);
              } else {
                console.error(`Failed request for ${exampleCategory}:${preference}`);
              }
            } catch (error) {
              console.error(`Error processing ${exampleCategory}:${preference}:`, error);
            }
          }
        }
      }
      
      console.log(`Generated ${blocks.length} recommendation blocks`);
      setRecommendations(blocks);
      setLoading(false);
    } catch (error) {
      console.error('Error in sendPreferencesToBackend:', error);
      setLoading(false);
    }
  };

  // 🔁 Send preferences when Explore screen loads or active tab changes
  useEffect(() => {
    if (preferences && Object.keys(preferences).length > 0) {
      console.log('Preferences available, sending to backend with active category:', activeTab);
      sendPreferencesToBackend(preferences, activeTab);
    } else {
      console.log('No preferences available yet');
      setLoading(false); // Ensure loading is false if no preferences
    }
  }, [preferences, activeTab]);



  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Loading recommendations for {activeTab}...</Text>
        </View>
      );
    }

    if (recommendations.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No recommendations available</Text>
        </View>
      );
    }

    return (
      <View style={styles.recommendationsContainer}>
        {recommendations.map((block: any, blockIndex: number) => {
          if (!block || !block.recommendations || block.recommendations.length === 0) return null;
          
          return (
            <View key={blockIndex} style={styles.groupContainer}>
              <Text style={styles.groupTitle}>{block.title || `Block ${blockIndex + 1}`}</Text>
              <ScrollView 
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalScrollContent}
              >
                {block.recommendations.map((item: any, itemIndex: number) => (
                  <View key={itemIndex} style={styles.cardContainer}>
                    <TouchableOpacity 
                      style={styles.card}
                      onPress={() => {
                        setSelectedItem(item);
                        fetchItemDetails(item.name, activeTab);
                      }}
                    >
                      {item.image ? (
                        <ImageBackground 
                          source={{ uri: item.image }} 
                          style={styles.cardImage}
                          resizeMode="cover"
                          borderRadius={12}
                        >
                          <View style={styles.cardOverlay}>
                            <Text style={styles.cardTitle}>{item.name || `Item ${itemIndex + 1}`}</Text>
                          </View>
                        </ImageBackground>
                      ) : (
                        <View style={styles.cardContent}>
                          <Text style={styles.cardTitle}>{item.name || `Item ${itemIndex + 1}`}</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
              {block.description && (
                <Text style={styles.descriptionText}>{block.description}</Text>
              )}
            </View>
          );
        })}
      </View>
    );
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
        }}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, darkMode ? styles.modalContentDark : styles.modalContentLight]}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => {
                setSelectedItem(null);
                setItemDetails(null);
              }}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
            
            {selectedItem.image && (
              <ImageBackground 
                source={{ uri: selectedItem.image }} 
                style={styles.detailsImage}
                resizeMode="cover"
              >
                <View style={styles.detailsImageOverlay}>
                  <Text style={styles.detailsTitle}>{selectedItem.name}</Text>
                </View>
              </ImageBackground>
            )}
            
            <ScrollView style={styles.detailsContent}>
              {detailsLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={darkMode ? '#38bdf8' : '#3b82f6'} />
                  <Text style={styles.loadingText}>Loading details...</Text>
                </View>
              ) : itemDetails ? (
                <View style={styles.detailsInfo}>
                  {Object.entries(itemDetails).map(([key, value]) => {
                    if (key === 'name') return null; // Skip name as it's already in the title
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
              ) : (
                <Text style={styles.noDetailsText}>No details available</Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <ScrollView style={styles.container}>
      {renderDetailsModal()}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.tabsScrollContainer}
        contentContainerStyle={styles.tabsContentContainer}
      >
        {TABS.map(tab => {
          const Icon = CATEGORY_ICONS[tab] || CATEGORY_ICONS['music']; // Fallback to music icon if not found
          const isActive = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              onPress={() => {
                // Set loading state immediately when tab changes
                setLoading(true);
                setActiveTab(tab);
                // If preferences exist, send them with the new active tab
                if (preferences && Object.keys(preferences).length > 0) {
                  sendPreferencesToBackend(preferences, tab);
                }
              }}
              style={[styles.tab, isActive && styles.activeTab]}
            >
              <Icon size={20} color={isActive ? (darkMode ? '#38bdf8' : '#3b82f6') : (darkMode ? '#9ca3af' : '#6b7280')} />
              <Text style={[styles.tabText, isActive && styles.activeTabText]}>
                {getDisplayName(tab)}
              </Text>
            </TouchableOpacity>
          )
        })}
      </ScrollView>
      {renderContent()}
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
        maxHeight: '80%',
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
        justifyContent: 'flex-end',
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
        maxHeight: 400,
    },
    loadingContainer: {
        padding: 20,
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        color: darkMode ? '#d1d5db' : '#374151',
        fontFamily: 'Lato',
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
    container: {
        flex: 1,
        padding: 16,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        fontFamily: 'Lato',
        fontSize: 16,
        color: darkMode ? '#9ca3af' : '#374151',
    },
    recommendationsContainer: {
        marginTop: 16,
        gap: 24,
    },
    groupContainer: {
        marginBottom: 32,
        padding: 16,
        borderWidth: 1,
        borderColor: darkMode ? '#55516c' : '#d9d9d9',
        borderRadius: 16,
    },
    groupTitle: {
        fontFamily: 'Rubik',
        fontSize: 18,
        fontWeight: 'bold',
        color: darkMode ? '#f3f4f6' : '#111827',
        marginBottom: 12,
        textAlign: 'left',
    },

    titleContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginBottom: 16,
    },
    descriptionTitle: {
        fontFamily: 'Rubik',
        fontSize: 24,
        fontWeight: 'bold',
        color: darkMode ? '#f3f4f6' : '#111827',
        textTransform: 'capitalize',
        paddingHorizontal: 4,
    },
    shuffledText: {
        fontSize: 14,
        fontStyle: 'italic',
        color: darkMode ? '#9ca3af' : '#374151',
        fontFamily: 'Lato',
        marginLeft: 8,
        marginBottom: 4,
    },
    descriptionText: {
        fontFamily: 'Lato',
        fontSize: 14,
        color: darkMode ? '#d1d5db' : '#374151',
        marginTop: 16,
        fontStyle: 'italic',
        lineHeight: 20,
        paddingHorizontal: 4,
    },
    cardContent: {
        padding: 12,
        backgroundColor: darkMode ? '#1f2937' : '#f9fafb',
        borderRadius: 12,
        width: 160,
        height: 220,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tabsScrollContainer: {
        marginBottom: 24,
        borderBottomWidth: 1,
        borderBottomColor: darkMode ? '#374151' : '#e5e7eb',
    },
    tabsContentContainer: {
        paddingHorizontal: 8,
        flexDirection: 'row',
        alignItems: 'center',
    },
    tab: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingBottom: 12,
        paddingHorizontal: 16,
        marginHorizontal: 4,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: darkMode ? '#38bdf8' : '#3b82f6',
    },
    tabText: {
        fontFamily: 'Lato',
        fontWeight: 'bold',
        fontSize: 14,
        color: darkMode ? '#9ca3af' : '#374151',
    },
    activeTabText: {
        color: darkMode ? '#38bdf8' : '#3b82f6',
    },
    horizontalScrollContent: {
        paddingVertical: 12,
        paddingHorizontal: 4,
        paddingBottom: 12,
    },
    cardContainer: {
        width: 160,  // Fixed width for horizontal scrolling
        marginRight: 16,
    },
    card: {
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: darkMode ? 0.3 : 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    cardImage: {
        width: 160,
        height: 220,
        justifyContent: 'flex-end',
        overflow: 'hidden',
    },
    cardOverlay: {
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 12,
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 12,
    },
    cardTitle: {
        color: '#FFF',
        fontWeight: 'bold',
        fontFamily: 'Rubik',
        fontSize: 16,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 4,
        marginTop: 6,
    },
    tag: {
        fontSize: 10,
        backgroundColor: 'rgba(255,255,255,0.2)',
        color: '#FFF',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
        fontFamily: 'Lato',
        overflow: 'hidden' // for rounded corners on iOS
    },
    platformsScrollContainer: {
        marginTop: 8,
    },
    platformDetailItem: {
        marginRight: 12,
    },
    platformDetailName: {
        color: darkMode ? '#f3f4f6' : '#1f2937',
        fontSize: 12,
        fontFamily: 'Lato',
        backgroundColor: darkMode ? '#374151' : '#f3f4f6',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    }
});

export default Explore;


