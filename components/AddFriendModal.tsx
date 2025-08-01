import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  Alert,
  Animated,
} from 'react-native';
import { XMarkIcon, ChevronRightIcon, ChevronLeftIcon } from 'react-native-heroicons/outline';
import InterestSelectionQuiz from './InterestSelectionQuiz';
import { AppContext } from '../App';
import { useContext } from 'react';

interface AddFriendModalProps {
  visible: boolean;
  onClose: () => void;
  onAddFriend: (friendData: {
    name: string;
    relationshipType: string;
    interests: string[];
  }) => void;
  darkMode: boolean;
}

const RELATIONSHIP_TYPES = [
  'Best Friend',
  'Close Friend',
  'Family Member',
  'Partner',
  'Colleague',
  'Acquaintance',
  'Roommate',
  'Study Buddy',
  'Neighbor',
  'Classmate',
  'Workout Partner',
  'Travel Buddy',
  'Mentor',
  'Sibling',
  'Cousin',
  'Parent',
];

const AddFriendModal: React.FC<AddFriendModalProps> = ({
  visible,
  onClose,
  onAddFriend,
  darkMode,
}) => {
  const { result } = useContext(AppContext)!;
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [relationshipType, setRelationshipType] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [slideAnim] = useState(new Animated.Value(0));

  const resetForm = () => {
    setStep(1);
    setName('');
    setRelationshipType('');
    setInterests([]);
    slideAnim.setValue(0);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!name.trim()) {
        Alert.alert('Missing Information', 'Please enter your friend\'s name to continue.');
        return;
      }
      if (!relationshipType) {
        Alert.alert('Missing Information', 'Please select a relationship type to continue.');
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

  const handleSubmit = () => {
    if (interests.length === 0) {
      Alert.alert('Missing Information', 'Please select at least one interest for your friend.');
      return;
    }

    onAddFriend({
      name: name.trim(),
      relationshipType,
      interests,
    });

    resetForm();
  };

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
            Add Friend
          </Text>
          <View style={styles.placeholder} />
        </View>

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${(step / 2) * 100}%`, backgroundColor: '#6366f1' }
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
                  Friend Details
                </Text>
                <Text style={[styles.stepSubtitle, { color: darkMode ? '#9ca3af' : '#6b7280' }]}>
                  Tell us about your friend
                </Text>

                {/* Name Input */}
                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: darkMode ? '#ffffff' : '#0f172a' }]}>
                    Name *
                  </Text>
                  <TextInput
                    style={[
                      styles.textInput,
                      {
                        backgroundColor: darkMode ? '#1f2937' : '#f9fafb',
                        borderColor: darkMode ? '#374151' : '#d1d5db',
                        color: darkMode ? '#ffffff' : '#0f172a',
                      }
                    ]}
                    value={name}
                    onChangeText={setName}
                    placeholder="Enter friend's name"
                    placeholderTextColor={darkMode ? '#6b7280' : '#9ca3af'}
                  />
                </View>

                {/* Relationship Type */}
                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: darkMode ? '#ffffff' : '#0f172a' }]}>
                    Relationship Type *
                  </Text>
                  <TextInput
                    style={[
                      styles.textInput,
                      {
                        backgroundColor: darkMode ? '#1f2937' : '#f9fafb',
                        borderColor: darkMode ? '#374151' : '#d1d5db',
                        color: darkMode ? '#ffffff' : '#0f172a',
                      }
                    ]}
                    value={relationshipType}
                    onChangeText={setRelationshipType}
                    placeholder="Enter relationship type (e.g., Best Friend, Colleague)"
                    placeholderTextColor={darkMode ? '#6b7280' : '#9ca3af'}
                  />
                  <View style={styles.chipContainer}>
                    {RELATIONSHIP_TYPES.map((type) => (
                      <TouchableOpacity
                        key={type}
                        style={[
                          styles.suggestionChip,
                          {
                            backgroundColor: darkMode ? '#374151' : '#e5e7eb',
                            borderColor: darkMode ? '#4b5563' : '#d1d5db',
                          }
                        ]}
                        onPress={() => setRelationshipType(type)}
                        activeOpacity={0.8}
                      >
                        <Text
                          style={[
                            styles.suggestionChipText,
                            { color: darkMode ? '#d1d5db' : '#4b5563' }
                          ]}
                        >
                          {type}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.nextButton, { backgroundColor: result?.archetype?.color || '#6366f1' }]}
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
                    {name}'s Interests
                  </Text>
                  <Text style={[styles.stepSubtitle, { color: darkMode ? '#9ca3af' : '#6b7280' }]}>
                    What does {name} enjoy?
                  </Text>
                </View>
              </View>

              <InterestSelectionQuiz
                selectedInterests={interests}
                onInterestsChange={setInterests}
                darkMode={darkMode}
                onCategoryChange={setCurrentCategoryIndex}
              />

              <TouchableOpacity
                style={[
                  styles.submitButton,
                  {
                    backgroundColor: (currentCategoryIndex === 8 && interests.length > 0) ? (result?.archetype?.color || '#10b981') : darkMode ? '#374151' : '#d1d5db',
                  }
                ]}
                onPress={handleSubmit}
                disabled={!(currentCategoryIndex === 8 && interests.length > 0)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.submitButtonText,
                    {
                      color: (currentCategoryIndex === 8 && interests.length > 0) ? '#ffffff' : darkMode ? '#6b7280' : '#9ca3af',
                    }
                  ]}
                >
                  Add Friend
                </Text>
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
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Rubik',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Rubik',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    margin: 4,
  },
  chipText: {
    fontSize: 14,
    fontFamily: 'Rubik',
  },
  suggestionChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    margin: 2,
  },
  suggestionChipText: {
    fontSize: 12,
    fontFamily: 'Rubik',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 32,
  },
  nextButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Rubik',
    marginRight: 8,
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 32,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Rubik',
  },
});

export default AddFriendModal;