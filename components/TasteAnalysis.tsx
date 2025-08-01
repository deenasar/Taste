
import React, { useContext, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Pressable } from 'react-native';
import { AppContext } from '@/App';
import { InformationCircleIcon, XMarkIcon } from 'react-native-heroicons/outline';
import { QUIZ_QUESTIONS, CATEGORY_ICONS, OPTION_AFFINITY } from '@/constants';
import { SparklesIcon } from 'react-native-heroicons/solid';

const MatchMeter: React.FC<{ score: number; color: string }> = ({ score, color }) => {
    return (
        <View style={{ flexDirection: 'row', gap: 2 }}>
            {[1, 2, 3].map(i => (
                <SparklesIcon key={i} size={16} color={i <= score ? color : '#e5e7eb'} style={{ opacity: i <= score ? 1 : 0.5 }} />
            ))}
        </View>
    );
};

const TasteAnalysis: React.FC = () => {
    const context = useContext(AppContext);
    const [infoModal, setInfoModal] = useState<{ title: string; content: string; } | null>(null);

    if (!context || !context.preferences || !context.result) return null;

    const { darkMode, preferences, result: { archetype } } = context;
    const styles = createStyles(darkMode);

    const dimensions = useMemo(() => {
        const allSelected = Object.values(preferences).flat();
        if (allSelected.length === 0) {
            return { adventurousness: 0, diversity: 'None', timelessness: 'N/A' };
        }
        
        const adventurousOptions = ['Indie Rock', 'Folk', 'Electronic', 'Jazz', 'A24 Films', 'Documentaries', 'Foreign Language', 'Street Tacos', 'Spicy Curries', 'Vegan Cuisine', 'Poetry Collections', 'Non-fiction', 'Graphic Novels', 'Backpacking SE Asia', 'Cultural Immersion', 'Mountain Retreats'];
        const nostalgicOptions = ['80s Synth-pop', 'Classical', 'Historical Dramas', 'Classic Literature', 'Biographies'];

        const adventurousCount = allSelected.filter(opt => adventurousOptions.includes(opt as string)).length;
        const nostalgicCount = allSelected.filter(opt => nostalgicOptions.includes(opt as string)).length;
        
        const adventurousness = Math.round((adventurousCount / allSelected.length) * 100);
        
        let diversity: 'Focused' | 'Moderate' | 'High' | 'Very High';
        if (allSelected.length > 15) diversity = "Very High";
        else if (allSelected.length > 10) diversity = "High";
        else if (allSelected.length > 5) diversity = "Moderate";
        else diversity = "Focused";

        let timelessness: 'Leans Nostalgic' | 'Balanced' | 'Leans Contemporary';
        const contemporaryCount = allSelected.length - nostalgicCount;
        if (nostalgicCount > contemporaryCount * 1.2) timelessness = "Leans Nostalgic";
        else if (contemporaryCount > nostalgicCount * 1.2) timelessness = "Leans Contemporary";
        else timelessness = "Balanced";
        
        return { adventurousness, diversity, timelessness };
    }, [preferences]);

    const analysisInfo = "This section shows how each of your selected tastes resonates with your archetype. The more sparkles, the stronger the connection!";
    const dimensionsInfo = "These metrics analyze the character of your tastes.\n\nAdventurousness reflects your taste for the novel vs. mainstream.\n\nDiversity measures how broad your interests are.\n\nTimelessness shows if you lean towards classic or contemporary content.";

    return (
        <>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>
                        Taste & Archetype Resonance
                    </Text>
                    <TouchableOpacity onPress={() => setInfoModal({ title: 'About Taste Resonance', content: analysisInfo })}>
                        <InformationCircleIcon size={20} color={darkMode ? "#9ca3af" : "#6b7280"} />
                    </TouchableOpacity>
                </View>

                <View style={styles.grid}>
                    {QUIZ_QUESTIONS.map(question => {
                        const category = question.id;
                        const selectedOptions = preferences[category] || [];
                        const CategoryIcon = CATEGORY_ICONS[category];

                        if (selectedOptions.length === 0) return null;

                        return (
                            <View key={category} style={styles.categoryContainer}>
                                <View style={styles.categoryHeader}>
                                    <CategoryIcon size={20} color={archetype.color} />
                                    <Text style={styles.categoryTitle}>{category.charAt(0).toUpperCase() + category.slice(1)}</Text>
                                </View>
                                <View style={styles.optionsList}>
                                    {selectedOptions.map(option => {
                                        const score = OPTION_AFFINITY[option]?.[archetype.name] || 0;
                                        return (
                                            <View key={option} style={styles.optionRow}>
                                                <Text style={styles.optionText}>{option}</Text>
                                                <MatchMeter score={score} color={archetype.color} />
                                            </View>
                                        );
                                    })}
                                </View>
                            </View>
                        );
                    })}
                </View>
                
                <View style={styles.divider} />

                <View>
                    <View style={styles.header}>
                        <Text style={styles.subtitle}>Taste Dimensions</Text>
                         <TouchableOpacity onPress={() => setInfoModal({ title: 'About Taste Dimensions', content: dimensionsInfo })}>
                            <InformationCircleIcon size={20} color={darkMode ? "#9ca3af" : "#6b7280"} />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.dimensionsGrid}>
                        <View style={styles.dimensionBox}>
                            <Text style={styles.dimensionLabel}>Adventurousness</Text>
                            <Text style={[styles.dimensionValue, {color: '#f43f5e'}]}>{dimensions.adventurousness}%</Text>
                        </View>
                        <View style={styles.dimensionBox}>
                            <Text style={styles.dimensionLabel}>Diversity</Text>
                            <Text style={[styles.dimensionValue, {color: '#38bdf8'}]}>{dimensions.diversity}</Text>
                        </View>
                        <View style={styles.dimensionBox}>
                            <Text style={styles.dimensionLabel}>Timelessness</Text>
                            <Text style={[styles.dimensionValue, {color: '#f59e0b'}]}>{dimensions.timelessness}</Text>
                        </View>
                    </View>
                </View>
            </View>

            <Modal
                animationType="fade"
                transparent={true}
                visible={infoModal !== null}
                onRequestClose={() => setInfoModal(null)}
            >
                <Pressable style={styles.modalBackdrop} onPress={() => setInfoModal(null)}>
                    <Pressable style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{infoModal?.title}</Text>
                        <Text style={styles.modalText}>{infoModal?.content}</Text>
                        <TouchableOpacity 
                            onPress={() => setInfoModal(null)}
                            style={styles.modalCloseButton}
                        >
                          <XMarkIcon size={24} color={darkMode ? '#9ca3af' : '#6b7280'} />
                        </TouchableOpacity>
                    </Pressable>
                </Pressable>
            </Modal>
        </>
    );
};

const createStyles = (darkMode: boolean) => StyleSheet.create({
    container: {
        backgroundColor: darkMode ? '#1f2937' : '#fff',
        borderRadius: 16,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: darkMode ? 0.2 : 0.05,
        shadowRadius: 10,
        elevation: 5,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: 8,
        marginBottom: 24,
    },
    title: {
        fontFamily: 'Rubik',
        fontWeight: 'bold',
        fontSize: 20,
        color: darkMode ? '#fff' : '#111827',
    },
    subtitle: {
        fontFamily: 'Rubik',
        fontWeight: 'bold',
        fontSize: 18,
        color: darkMode ? '#fff' : '#111827',
    },
    grid: {
        gap: 24,
    },
    categoryContainer: {
        gap: 12,
    },
    categoryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    categoryTitle: {
        fontFamily: 'Lato',
        fontWeight: 'bold',
        fontSize: 14,
        color: darkMode ? '#e5e7eb' : '#374151',
        textTransform: 'uppercase',
    },
    optionsList: {
        gap: 8,
    },
    optionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: darkMode ? '#374151' : '#f9fafb',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    optionText: {
        fontFamily: 'Lato',
        fontWeight: 'bold',
        fontSize: 14,
        color: darkMode ? '#d1d5db' : '#374151',
    },
    divider: {
        height: 1,
        backgroundColor: darkMode ? '#374151' : '#e5e7eb',
        marginVertical: 24,
    },
    dimensionsGrid: {
        flexDirection: 'row',
        gap: 12,
        justifyContent: 'space-between',
    },
    dimensionBox: {
        flex: 1,
        backgroundColor: darkMode ? '#374151' : '#f9fafb',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    dimensionLabel: {
        fontFamily: 'Lato',
        fontWeight: 'bold',
        fontSize: 12,
        color: darkMode ? '#9ca3af' : '#6b7280',
        marginBottom: 4,
    },
    dimensionValue: {
        fontFamily: 'Rubik',
        fontWeight: 'bold',
        fontSize: 20,
    },
    // Modal
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    modalContent: {
        width: '100%',
        maxWidth: 400,
        backgroundColor: darkMode ? '#1f2937' : '#fff',
        borderRadius: 16,
        padding: 24,
        position: 'relative',
    },
    modalTitle: {
        fontFamily: 'Rubik',
        fontWeight: 'bold',
        fontSize: 20,
        color: darkMode ? '#fff' : '#111827',
        marginBottom: 16,
    },
    modalText: {
        fontFamily: 'Lato',
        fontSize: 16,
        lineHeight: 24,
        color: darkMode ? '#d1d5db' : '#4b5563',
    },
    modalCloseButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        padding: 4,
    }
});

export default TasteAnalysis;
