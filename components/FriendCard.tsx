import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { PencilIcon, TrashIcon } from 'react-native-heroicons/outline';
import EditFriendModal from './EditFriendModal';

const { width } = Dimensions.get('window');

interface Friend {
  id: string;
  name: string;
  relationshipType: string;
  interests: string[];
  userId: string;
}

interface FriendCardProps {
  friend: Friend;
  onEdit: (friendId: string, updatedData: Partial<Friend>) => void;
  onDelete: (friendId: string, friendName: string) => void;
  darkMode: boolean;
}

const FriendCard: React.FC<FriendCardProps> = ({ friend, onEdit, onDelete, darkMode }) => {
  const [showEditModal, setShowEditModal] = useState(false);

  const handleEdit = (updatedData: Partial<Friend>) => {
    onEdit(friend.id, updatedData);
    setShowEditModal(false);
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

  return (
    <>
      <View style={[styles.container, { width: (width - 56) / 2 }]}>
        <TouchableOpacity
          style={[
            styles.card,
            {
              backgroundColor: darkMode ? '#1f2937' : '#ffffff',
              borderColor: darkMode ? '#374151' : '#e5e7eb',
            }
          ]}
          activeOpacity={0.9}
        >
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            <View
              style={[
                styles.avatar,
                { backgroundColor: getAvatarColor(friend.name) }
              ]}
            >
              <Text style={styles.avatarText}>
                {getInitials(friend.name)}
              </Text>
            </View>
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  { backgroundColor: darkMode ? '#374151' : '#f3f4f6' }
                ]}
                onPress={() => setShowEditModal(true)}
                activeOpacity={0.8}
              >
                <PencilIcon size={14} color={darkMode ? '#ffffff' : '#0f172a'} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  { backgroundColor: '#ef4444' }
                ]}
                onPress={() => onDelete(friend.id, friend.name)}
                activeOpacity={0.8}
              >
                <TrashIcon size={14} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Friend Info */}
          <View style={styles.info}>
            <Text
              style={[
                styles.name,
                { color: darkMode ? '#ffffff' : '#0f172a' }
              ]}
              numberOfLines={1}
            >
              {friend.name}
            </Text>
            <Text
              style={[
                styles.relationship,
                { color: darkMode ? '#9ca3af' : '#6b7280' }
              ]}
              numberOfLines={1}
            >
              {friend.relationshipType}
            </Text>
          </View>

          {/* Interests */}
          <View style={styles.interestsContainer}>
            {friend.interests.slice(0, 3).map((interest, index) => (
              <View
                key={interest}
                style={[
                  styles.interestTag,
                  {
                    backgroundColor: darkMode ? '#374151' : '#f3f4f6',
                  }
                ]}
              >
                <Text
                  style={[
                    styles.interestText,
                    { color: darkMode ? '#d1d5db' : '#4b5563' }
                  ]}
                  numberOfLines={1}
                >
                  {interest}
                </Text>
              </View>
            ))}
            {friend.interests.length > 3 && (
              <View
                style={[
                  styles.moreTag,
                  {
                    backgroundColor: darkMode ? '#4b5563' : '#e5e7eb',
                  }
                ]}
              >
                <Text
                  style={[
                    styles.moreText,
                    { color: darkMode ? '#ffffff' : '#6b7280' }
                  ]}
                >
                  +{friend.interests.length - 3}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>

      <EditFriendModal
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
        friend={friend}
        onSave={handleEdit}
        darkMode={darkMode}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Rubik',
  },
  actionButtons: {
    position: 'absolute',
    top: -6,
    right: -6,
    flexDirection: 'row',
    gap: 4,
  },
  actionButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  info: {
    alignItems: 'center',
    marginBottom: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Rubik',
    marginBottom: 4,
  },
  relationship: {
    fontSize: 12,
    fontFamily: 'Rubik',
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginHorizontal: -2,
  },
  interestTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    margin: 2,
    maxWidth: '45%',
  },
  interestText: {
    fontSize: 10,
    fontFamily: 'Rubik',
    textAlign: 'center',
  },
  moreTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    margin: 2,
  },
  moreText: {
    fontSize: 10,
    fontWeight: '600',
    fontFamily: 'Rubik',
  },
});

export default FriendCard;