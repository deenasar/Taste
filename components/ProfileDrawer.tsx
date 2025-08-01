import React, { useContext, useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    TextInput,
    Animated,
    Dimensions,
    Modal,
    Alert,
    PermissionsAndroid,
    Platform
} from 'react-native';
import { AppContext } from '@/App';
import { useNavigation, CommonActions } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import { CameraIcon, ArrowPathIcon, ArrowRightOnRectangleIcon, XMarkIcon, PencilIcon, PhotoIcon, BookmarkIcon, UserGroupIcon } from 'react-native-heroicons/solid';

// Image picker with fallback
let launchCamera: any, launchImageLibrary: any;
try {
    const ImagePicker = require('react-native-image-picker');
    launchCamera = ImagePicker.launchCamera;
    launchImageLibrary = ImagePicker.launchImageLibrary;
} catch (error) {
    console.log('Image picker not available');
}
import { SessionManager } from './SessionManager';
import LinearGradient from 'react-native-linear-gradient';

const { width: screenWidth } = Dimensions.get('window');
const DRAWER_WIDTH = screenWidth * 0.5;

interface ProfileDrawerProps {
    visible: boolean;
    onClose: () => void;
}

const ProfileDrawer: React.FC<ProfileDrawerProps> = ({ visible, onClose }) => {
    const { darkMode, result, toggleDarkMode } = useContext(AppContext)!;
    const navigation = useNavigation<NavigationProp<any>>();
    const styles = createStyles(darkMode, result);
    
    const [slideAnim] = useState(new Animated.Value(0));
    const [backdropAnim] = useState(new Animated.Value(0));
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [userName, setUserName] = useState('User');
    const [isEditingName, setIsEditingName] = useState(false);
    const [tempName, setTempName] = useState('User');
    const [showPhotoModal, setShowPhotoModal] = useState(false);


    useEffect(() => {
        const getUserData = async () => {
            const session = await SessionManager.getSession();
            if (session) {
                if (session.name) {
                    setUserName(session.name);
                    setTempName(session.name);
                } else if (session.email) {
                    const nameFromEmail = session.email.split('@')[0];
                    setUserName(nameFromEmail);
                    setTempName(nameFromEmail);
                }
                if (session.profileImage) {
                    setProfileImage(session.profileImage);
                }
            }
        };
        if (visible) {
            getUserData();
        }
    }, [visible]);

    useEffect(() => {
        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue: visible ? 1 : 0,
                duration: 280,
                useNativeDriver: false,
            }),
            Animated.timing(backdropAnim, {
                toValue: visible ? 1 : 0,
                duration: 280,
                useNativeDriver: true,
            })
        ]).start();
    }, [visible]);

    const requestCameraPermission = async () => {
        if (Platform.OS === 'android') {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.CAMERA,
                    {
                        title: 'Camera Permission',
                        message: 'This app needs access to camera to take photos',
                        buttonNeutral: 'Ask Me Later',
                        buttonNegative: 'Cancel',
                        buttonPositive: 'OK',
                    }
                );
                return granted === PermissionsAndroid.RESULTS.GRANTED;
            } catch (err) {
                console.warn(err);
                return false;
            }
        }
        return true;
    };

    const requestStoragePermission = async () => {
        if (Platform.OS === 'android') {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                    {
                        title: 'Storage Permission',
                        message: 'This app needs access to storage to select photos',
                        buttonNeutral: 'Ask Me Later',
                        buttonNegative: 'Cancel',
                        buttonPositive: 'OK',
                    }
                );
                return granted === PermissionsAndroid.RESULTS.GRANTED;
            } catch (err) {
                console.warn(err);
                return false;
            }
        }
        return true;
    };

    const handleTakePhoto = async () => {
        setShowPhotoModal(false);
        const hasPermission = await requestCameraPermission();
        if (hasPermission) {
            if (launchCamera) {
                launchCamera(
                    {
                        mediaType: 'photo',
                        quality: 0.8,
                        includeBase64: false,
                    },
                    (response: any) => {
                        if (response.assets && response.assets[0]) {
                            const imageUri = response.assets[0].uri;
                            if (imageUri) {
                                setProfileImage(imageUri);
                                updateProfileImage(imageUri);
                            }
                        }
                    }
                );
            } else {
                // Fallback with mock image
                const mockImageUri = `https://picsum.photos/400/400?random=${Date.now()}`;
                setProfileImage(mockImageUri);
                updateProfileImage(mockImageUri);
            }
        } else {
            Alert.alert('Permission Required', 'Camera permission is needed to take photos');
        }
    };

    const handleChooseFromGallery = async () => {
        setShowPhotoModal(false);
        
        if (launchImageLibrary) {
            launchImageLibrary(
                {
                    mediaType: 'photo',
                    quality: 0.8,
                    includeBase64: false,
                    selectionLimit: 1,
                },
                (response: any) => {
                    if (response.didCancel || response.error) {
                        return;
                    }
                    if (response.assets && response.assets[0]) {
                        const imageUri = response.assets[0].uri;
                        if (imageUri) {
                            setProfileImage(imageUri);
                            updateProfileImage(imageUri);
                        }
                    }
                }
            );
        } else {
            const mockImageUri = `https://picsum.photos/400/400?random=${Date.now() + 1}`;
            setProfileImage(mockImageUri);
            updateProfileImage(mockImageUri);
        }
    };

    const updateProfileImage = async (imagePath: string) => {
        const session = await SessionManager.getSession();
        if (session) {
            await SessionManager.saveSession({
                ...session,
                profileImage: imagePath
            });
        }
    };

    const handleNameSave = async () => {
        setUserName(tempName);
        setIsEditingName(false);
        
        const session = await SessionManager.getSession();
        if (session && session.uid) {
            try {
                await SessionManager.saveSession({ 
                    ...session, 
                    name: tempName
                });
            } catch (error) {
                console.error('Error updating name:', error);
            }
        }
    };

    const retakeQuiz = () => {
        onClose();
        navigation.navigate('TasteQuiz');
    };

    const handleLogout = async () => {
        await SessionManager.clearSession();
        onClose();
        navigation.dispatch(CommonActions.reset({
            index: 0,
            routes: [{ name: 'Login' }],
        }));
    };

    const renderProfileImage = () => {
        if (profileImage) {
            return <Image source={{ uri: profileImage }} style={styles.profileImage} />;
        }
        
        const Icon = result?.archetype?.icon;
        const gradientColors = result?.archetype?.gradientColors || ['#6b7280', '#4b5563'];
        
        return (
            <LinearGradient
                colors={gradientColors}
                style={styles.profileImage}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <View style={styles.placeholderContent}>
                    <Text style={styles.profileImageText}>{userName.charAt(0).toUpperCase()}</Text>
                    {Icon && (
                        <View style={styles.archetypeIconBadge}>
                            <Icon size={16} color="#fff" />
                        </View>
                    )}
                </View>
            </LinearGradient>
        );
    };

    const PhotoModal = () => (
        <Modal
            visible={showPhotoModal}
            animationType="fade"
            transparent={true}
            onRequestClose={() => setShowPhotoModal(false)}
        >
            <View style={styles.photoModalContainer}>
                <View style={styles.photoModalContent}>
                    <Text style={styles.photoModalTitle}>Update Profile Picture</Text>
                    <TouchableOpacity 
                        style={[styles.photoModalButton, { backgroundColor: result?.archetype?.color || '#4b5563' }]}
                        onPress={handleTakePhoto}
                    >
                        <CameraIcon size={20} color="#fff" />
                        <Text style={styles.photoModalButtonText}>Take a Photo</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.photoModalButton, { backgroundColor: result?.archetype?.color || '#4b5563' }]}
                        onPress={handleChooseFromGallery}
                    >
                        <PhotoIcon size={20} color="#fff" />
                        <Text style={styles.photoModalButtonText}>Choose from Gallery</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={styles.photoModalCancelButton}
                        onPress={() => setShowPhotoModal(false)}
                    >
                        <Text style={styles.photoModalCancelText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );

    if (!visible) return null;

    return (
        <Modal
            visible={visible}
            animationType="none"
            transparent={true}
            onRequestClose={onClose}
            statusBarTranslucent={true}
        >
            <View style={styles.overlay}>
                <Animated.View 
                    style={[styles.backdrop, { opacity: backdropAnim }]}
                >
                    <TouchableOpacity 
                        style={styles.backdropTouchable} 
                        activeOpacity={1} 
                        onPress={onClose}
                    />
                </Animated.View>
                <Animated.View 
                    style={[
                        styles.drawer,
                        { 
                            right: slideAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [-DRAWER_WIDTH, 0]
                            })
                        }
                    ]}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <XMarkIcon size={24} color={darkMode ? '#9ca3af' : '#6b7280'} />
                        </TouchableOpacity>
                    </View>

                    {/* Profile Section */}
                    <View style={styles.profileSection}>
                        <View style={styles.profileImageContainer}>
                            {renderProfileImage()}
                            <TouchableOpacity 
                                style={[styles.cameraButton, { backgroundColor: result?.archetype?.gradientColors?.[0] || '#6b7280' }]}
                                onPress={() => setShowPhotoModal(true)}
                            >
                                <CameraIcon size={16} color={darkMode ? '#1f2937' : '#1f2937'} />
                            </TouchableOpacity>
                        </View>

                        {/* Username Section */}
                        <View style={styles.usernameSection}>
                            {isEditingName ? (
                                <View style={styles.nameEditContainer}>
                                    <TextInput
                                        style={styles.nameInput}
                                        value={tempName}
                                        onChangeText={setTempName}
                                        onBlur={handleNameSave}
                                        onSubmitEditing={handleNameSave}
                                        autoFocus
                                    />
                                </View>
                            ) : (
                                <TouchableOpacity 
                                    style={styles.nameDisplayContainer}
                                    onPress={() => setIsEditingName(true)}
                                >
                                    <Text style={styles.userName}>{userName}</Text>
                                    <PencilIcon size={16} color={darkMode ? '#9ca3af' : '#6b7280'} />
                                </TouchableOpacity>
                            )}
                            <Text style={styles.archetypeName}>{result?.archetype?.name || 'User'}</Text>
                        </View>
                    </View>

                    {/* Quick Actions */}
                    <View style={styles.actionsSection}>
                        <TouchableOpacity 
                            style={styles.actionButton}
                            onPress={retakeQuiz}
                        >
                            <ArrowPathIcon size={18} color={darkMode ? (result?.archetype?.gradientColors?.[0] || '#6b7280') : '#1f2937'} />
                            <Text style={[styles.actionButtonText, { color: darkMode ? (result?.archetype?.gradientColors?.[0] || '#6b7280') : '#111827' }]}>
                                Retake Quiz
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={styles.actionButton}
                            onPress={() => {
                                onClose();
                                navigation.getParent()?.navigate('Collections');
                            }}
                        >
                            <BookmarkIcon size={18} color={darkMode ? (result?.archetype?.gradientColors?.[0] || '#6b7280') : '#1f2937'} />
                            <Text style={[styles.actionButtonText, { color: darkMode ? (result?.archetype?.gradientColors?.[0] || '#6b7280') : '#111827' }]}>
                                Collections
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={styles.actionButton}
                            onPress={() => {
                                onClose();
                                navigation.getParent()?.navigate('Friends');
                            }}
                        >
                            <UserGroupIcon size={18} color={darkMode ? (result?.archetype?.gradientColors?.[0] || '#6b7280') : '#1f2937'} />
                            <Text style={[styles.actionButtonText, { color: darkMode ? (result?.archetype?.gradientColors?.[0] || '#6b7280') : '#111827' }]}>
                                Friends
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={styles.actionButton}
                            onPress={handleLogout}
                        >
                            <ArrowRightOnRectangleIcon size={18} color="#ef4444" />
                            <Text style={[styles.actionButtonText, { color: '#ef4444' }]}>
                                Log Out
                            </Text>
                        </TouchableOpacity>
                    </View>

                </Animated.View>
            </View>
            <PhotoModal />
            

        </Modal>
    );
};

const createStyles = (darkMode: boolean, result: any) => StyleSheet.create({
    overlay: {
        flex: 1,
        flexDirection: 'row',
    },
    backdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    backdropTouchable: {
        flex: 1,
    },
    drawer: {
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        width: DRAWER_WIDTH,
        backgroundColor: darkMode ? '#1f2937' : '#ffffff',
        paddingTop: 0,
        paddingHorizontal: 20,
        shadowColor: '#000',
        shadowOffset: { width: -2, height: 0 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30,
        marginTop: 50,
    },
    closeButton: {
        padding: 8,
    },

    profileSection: {
        alignItems: 'center',
        marginBottom: 40,
    },
    profileImageContainer: {
        position: 'relative',
        marginBottom: 20,
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: darkMode ? '#374151' : '#e5e7eb',
    },
    placeholderContent: {
        position: 'relative',
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileImageText: {
        color: '#fff',
        fontSize: 32,
        fontWeight: 'bold',
        fontFamily: 'Rubik',
    },
    archetypeIconBadge: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.25)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cameraButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: darkMode ? '#1f2937' : '#ffffff',
    },
    usernameSection: {
        alignItems: 'center',
        width: '100%',
    },
    nameDisplayContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    nameEditContainer: {
        marginBottom: 8,
    },
    nameInput: {
        fontSize: 20,
        fontWeight: 'bold',
        fontFamily: 'Rubik',
        color: darkMode ? '#f3f4f6' : '#111827',
        backgroundColor: darkMode ? '#374151' : '#f3f4f6',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        textAlign: 'center',
        minWidth: 150,
    },
    userName: {
        fontSize: 20,
        fontWeight: 'bold',
        fontFamily: 'Rubik',
        color: darkMode ? '#f3f4f6' : '#111827',
    },
    archetypeName: {
        fontSize: 14,
        fontFamily: 'Lato',
        color: darkMode ? '#9ca3af' : '#6b7280',
    },
    actionsSection: {
        gap: 16,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: 12,
        paddingVertical: 16,
        paddingHorizontal: 0,
        width: '100%',
    },


    actionButtonText: {
        fontSize: 16,
        fontWeight: '600',
        fontFamily: 'Lato',
    },

    photoModalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    photoModalContent: {
        width: '80%',
        backgroundColor: darkMode ? '#1f2937' : '#ffffff',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        gap: 16,
    },
    photoModalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: 'Rubik',
        color: darkMode ? '#f3f4f6' : '#111827',
        marginBottom: 8,
    },
    photoModalButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 12,
        width: '100%',
    },
    photoModalButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        fontFamily: 'Lato',
    },
    photoModalCancelButton: {
        paddingVertical: 12,
        paddingHorizontal: 24,
    },
    photoModalCancelText: {
        color: darkMode ? '#9ca3af' : '#6b7280',
        fontSize: 16,
        fontWeight: '600',
        fontFamily: 'Lato',
    },

});

export default ProfileDrawer;