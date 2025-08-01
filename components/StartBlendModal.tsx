import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  Alert,
  Animated,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { XMarkIcon, ChevronRightIcon, ChevronLeftIcon, CheckIcon, MagnifyingGlassIcon } from 'react-native-heroicons/outline';

interface Friend {
  id: string;
  name: string;
  relationshipType: string;
  interests: string[];
  userId: string;
}

interface StartBlendModalProps {
  visible: boolean;
  onClose: () => void;
  friends: Friend[];
  onStartBlend: (selectedFriends: string[], selectedActivities: string[]) => void;
  darkMode: boolean;
}

const ACTIVITY_TYPES = [
  { id: 'music', name: 'Music', icon: '🎵', color: '#8b5cf6' },
  { id: 'movies', name: 'Movies', icon: '🎬', color: '#ef4444' },
  { id: 'books', name: 'Books', icon: '📚', color: '#f59e0b' },
  { id: 'podcast', name: 'Podcast', icon: '🎙️', color: '#10b981' },
  { id: 'games', name: 'Video Games', icon: '🎮', color: '#3b82f6' },
  { id: 'tv', name: 'TV Shows', icon: '📺', color: '#f43f5e' },
  { id: 'travel', name: 'Travel', icon: '✈️', color: '#06b6d4' },
];

const StartBlendModal: React.FC<StartBlendModalProps> = ({
  visible,
  onClose,
  friends,
  onStartBlend,
  darkMode,
}) => {
  const [step, setStep] = useState(1);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [slideAnim] = useState(new Animated.Value(0));
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setStep(1);
    setSelectedFriends([]);
    setSelectedActivities([]);
    setSearchQuery('');
    slideAnim.setValue(0);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (selectedFriends.length === 0) {
        Alert.alert('Error', 'Please select at least one friend');
        return;
      }
      
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setStep(2);
        slideAnim.setValue(100);
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    }
  };

  const handlePrevStep = () => {
    if (step === 2) {
      Animated.timing(slideAnim, {
        toValue: 100,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setStep(1);
        slideAnim.setValue(-100);
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    }
  };

  const toggleFriend = (friendId: string) => {
    if (selectedFriends.includes(friendId)) {
      setSelectedFriends(selectedFriends.filter(id => id !== friendId));
    } else {
      setSelectedFriends([...selectedFriends, friendId]);
    }
  };

  const toggleActivity = (activityId: string) => {
    if (selectedActivities.includes(activityId)) {
      setSelectedActivities([]);
    } else {
      setSelectedActivities([activityId]);
    }
  };

  const handleStartBlend = async () => {
    if (selectedActivities.length === 0) {
      Alert.alert('Error', 'Please select at least one activity');
      return;
    }

    setLoading(true);
    try {
      await onStartBlend(selectedFriends, selectedActivities);
      resetForm();
    } catch (error) {
      console.error('Error starting blend:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      '#ef4444', '#f97316', '#f59e0b', '#eab308',
      '#84cc16', '#22c55e', '#10b981', '#14b8a6',
      '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
      '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
    ];
    const index = name.length % colors.length;
    return colors[index];
  };

  const filteredActivities = ACTIVITY_TYPES.filter(activity =>
    activity.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={[styles.container, { backgroundColor: darkMode ? '#0f172a' : '#ffffff' }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: darkMode ? '#374151' : '#e5e7eb' }]}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <XMarkIcon size={24} color={darkMode ? '#ffffff' : '#0f172a'} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: darkMode ? '#ffffff' : '#0f172a' }]}>
            Start Blend
          </Text>
          <View style={styles.placeholder} />
        </View>

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${(step / 2) * 100}%`, backgroundColor: '#10b981' }
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: darkMode ? '#9ca3af' : '#6b7280' }]}>
            Step {step} of 2
          </Text>
        </View>

        <Animated.View style={[styles.content, { transform: [{ translateX: slideAnim }] }]}>
          {step === 1 ? (
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
              <View style={styles.stepContainer}>
                <Text style={[styles.stepTitle, { color: darkMode ? '#ffffff' : '#0f172a' }]}>
                  Select Friends
                </Text>
                <Text style={[styles.stepSubtitle, { color: darkMode ? '#9ca3af' : '#6b7280' }]}>
                  Choose who you want to blend with
                </Text>

                <View style={styles.friendsList}>
                  {friends.map((friend) => {
                    const isSelected = selectedFriends.includes(friend.id);
                    return (
                      <TouchableOpacity
                        key={friend.id}
                        style={[
                          styles.friendChip,
                          {
                            backgroundColor: isSelected 
                              ? '#10b981' 
                              : darkMode ? '#1f2937' : '#f9fafb',
                            borderColor: isSelected 
                              ? '#10b981' 
                              : darkMode ? '#374151' : '#d1d5db',
                          }
                        ]}
                        onPress={() => toggleFriend(friend.id)}
                        activeOpacity={0.8}
                      >
                        <View
                          style={[
                            styles.friendAvatar,
                            { backgroundColor: isSelected ? '#ffffff' : getAvatarColor(friend.name) }
                          ]}
                        >
                          {isSelected ? (
                            <CheckIcon size={16} color="#10b981" />
                          ) : (
                            <Text
                              style={[
                                styles.friendAvatarText,
                                { color: '#ffffff' }
                              ]}
                            >
                              {getInitials(friend.name)}
                            </Text>
                          )}
                        </View>
                        <Text
                          style={[
                            styles.friendName,
                            {
                              color: isSelected ? '#ffffff' : darkMode ? '#ffffff' : '#0f172a',
                            }
                          ]}
                        >
                          {friend.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <TouchableOpacity
                  style={[styles.nextButton, { backgroundColor: '#10b981' }]}
                  onPress={handleNextStep}
                  activeOpacity={0.8}
                >
                  <Text style={styles.nextButtonText}>Next</Text>
                  <ChevronRightIcon size={20} color="#ffffff" />
                </TouchableOpacity>
              </View>
            </ScrollView>
          ) : (
            <View style={styles.stepContainer}>
              <View style={styles.stepHeader}>
                <TouchableOpacity onPress={handlePrevStep} style={styles.backButton}>
                  <ChevronLeftIcon size={24} color={darkMode ? '#ffffff' : '#0f172a'} />
                </TouchableOpacity>
                <View>
                  <Text style={[styles.stepTitle, { color: darkMode ? '#ffffff' : '#0f172a' }]}>
                    Select Activities
                  </Text>
                  <Text style={[styles.stepSubtitle, { color: darkMode ? '#9ca3af' : '#6b7280' }]}>
                    What would you like to do together?
                  </Text>
                </View>
              </View>

              {/* Search */}
              <View style={styles.searchContainer}>
                <View
                  style={[
                    styles.searchInput,
                    {
                      backgroundColor: darkMode ? '#1f2937' : '#f9fafb',
                      borderColor: darkMode ? '#374151' : '#d1d5db',
                    }
                  ]}
                >
                  <MagnifyingGlassIcon size={20} color={darkMode ? '#6b7280' : '#9ca3af'} />
                  <TextInput
                    style={[
                      styles.searchText,
                      { color: darkMode ? '#ffffff' : '#0f172a' }
                    ]}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Search activities..."
                    placeholderTextColor={darkMode ? '#6b7280' : '#9ca3af'}
                  />
                </View>
              </View>

              {/* Activities Grid */}
              <ScrollView style={styles.activitiesScrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.activitiesGrid}>
                  {filteredActivities.map((activity) => {
                    const isSelected = selectedActivities.includes(activity.id);
                    const isDisabled = selectedActivities.length > 0 && !isSelected;
                    return (
                      <TouchableOpacity
                        key={activity.id}
                        style={[
                          styles.activityCard,
                          {
                            backgroundColor: isSelected 
                              ? activity.color 
                              : darkMode ? '#1f2937' : '#ffffff',
                            borderColor: isSelected 
                              ? activity.color 
                              : darkMode ? '#374151' : '#e5e7eb',
                            opacity: isDisabled ? 0.5 : 1,
                          }
                        ]}
                        onPress={() => !isDisabled && toggleActivity(activity.id)}
                        activeOpacity={isDisabled ? 1 : 0.8}
                        disabled={isDisabled}
                      >
                        {isSelected && (
                          <View style={styles.activityCheckIcon}>
                            <CheckIcon size={16} color="#ffffff" />
                          </View>
                        )}
                        <Text style={styles.activityIcon}>{activity.icon}</Text>
                        <Text
                          style={[
                            styles.activityName,
                            {
                              color: isSelected ? '#ffffff' : darkMode ? '#ffffff' : '#0f172a',
                            }
                          ]}
                        >
                          {activity.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>

              <TouchableOpacity
                style={[
                  styles.startButton,
                  {
                    backgroundColor: selectedActivities.length > 0 && !loading ? '#10b981' : darkMode ? '#374151' : '#d1d5db',
                  }
                ]}
                onPress={handleStartBlend}
                disabled={selectedActivities.length === 0 || loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text
                    style={[
                      styles.startButtonText,
                      {
                        color: selectedActivities.length > 0 ? '#ffffff' : darkMode ? '#6b7280' : '#9ca3af',
                      }
                    ]}
                  >
                    {loading ? 'Loading...' : 'Start Blend'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Rubik',
  },
  placeholder: {
    width: 32,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    fontFamily: 'Rubik',
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  stepContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Rubik',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    fontFamily: 'Rubik',
  },
  friendsList: {
    marginTop: 24,
    marginBottom: 32,
  },
  friendChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 12,
  },
  friendAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  friendAvatarText: {
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'Rubik',
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Rubik',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  nextButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Rubik',
    marginRight: 8,
  },
  searchContainer: {
    marginBottom: 24,
  },
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Rubik',
    marginLeft: 12,
  },
  activitiesScrollView: {
    flex: 1,
    marginBottom: 24,
  },
  activitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  activityCard: {
    width: '45%',
    aspectRatio: 1,
    borderRadius: 16,
    borderWidth: 2,
    padding: 16,
    margin: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  activityCheckIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  activityName: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Rubik',
    textAlign: 'center',
  },
  startButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Rubik',
  },
});

export default StartBlendModal;