import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { XMarkIcon } from 'react-native-heroicons/outline';
import InterestSelectionQuiz from './InterestSelectionQuiz';

interface Friend {
  id: string;
  name: string;
  relationshipType: string;
  interests: string[];
  userId: string;
}

interface EditFriendModalProps {
  visible: boolean;
  onClose: () => void;
  friend: Friend;
  onSave: (updatedData: Partial<Friend>) => void;
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
];

const EditFriendModal: React.FC<EditFriendModalProps> = ({
  visible,
  onClose,
  friend,
  onSave,
  darkMode,
}) => {
  const [name, setName] = useState('');
  const [relationshipType, setRelationshipType] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'details' | 'interests'>('details');

  useEffect(() => {
    if (visible && friend) {
      setName(friend.name);
      setRelationshipType(friend.relationshipType);
      setInterests(friend.interests);
      setActiveTab('details');
    }
  }, [visible, friend]);

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your friend\'s name');
      return;
    }
    if (!relationshipType) {
      Alert.alert('Error', 'Please select a relationship type');
      return;
    }
    if (interests.length === 0) {
      Alert.alert('Error', 'Please select at least one interest');
      return;
    }

    onSave({
      name: name.trim(),
      relationshipType,
      interests,
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: darkMode ? '#0f172a' : '#ffffff' }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: darkMode ? '#374151' : '#e5e7eb' }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <XMarkIcon size={24} color={darkMode ? '#ffffff' : '#0f172a'} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: darkMode ? '#ffffff' : '#0f172a' }]}>
            Edit Friend
          </Text>
          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Text style={[styles.saveButtonText, { color: '#6366f1' }]}>
              Save
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Navigation */}
        <View style={[styles.tabContainer, { borderBottomColor: darkMode ? '#374151' : '#e5e7eb' }]}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'details' && styles.activeTab,
              activeTab === 'details' && { borderBottomColor: '#6366f1' }
            ]}
            onPress={() => setActiveTab('details')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color: activeTab === 'details' 
                    ? '#6366f1' 
                    : darkMode ? '#9ca3af' : '#6b7280'
                }
              ]}
            >
              Details
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'interests' && styles.activeTab,
              activeTab === 'interests' && { borderBottomColor: '#6366f1' }
            ]}
            onPress={() => setActiveTab('interests')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color: activeTab === 'interests' 
                    ? '#6366f1' 
                    : darkMode ? '#9ca3af' : '#6b7280'
                }
              ]}
            >
              Interests
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {activeTab === 'details' ? (
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
              <View style={styles.section}>
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
                  <View style={styles.chipContainer}>
                    {RELATIONSHIP_TYPES.map((type) => (
                      <TouchableOpacity
                        key={type}
                        style={[
                          styles.chip,
                          {
                            backgroundColor: relationshipType === type
                              ? '#6366f1'
                              : darkMode ? '#1f2937' : '#f9fafb',
                            borderColor: relationshipType === type
                              ? '#6366f1'
                              : darkMode ? '#374151' : '#d1d5db',
                          }
                        ]}
                        onPress={() => setRelationshipType(type)}
                        activeOpacity={0.8}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            {
                              color: relationshipType === type
                                ? '#ffffff'
                                : darkMode ? '#ffffff' : '#0f172a',
                            }
                          ]}
                        >
                          {type}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            </ScrollView>
          ) : (
            <View style={styles.interestsContainer}>
              <InterestSelectionQuiz
                selectedInterests={interests}
                onInterestsChange={setInterests}
                darkMode={darkMode}
              />
            </View>
          )}
        </View>
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
  saveButton: {
    padding: 4,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Rubik',
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Rubik',
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 24,
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
  interestsContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
});

export default EditFriendModal;