import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../constant/colors';
import SCREENS from '../index';

const MyPosts = ({ navigation }) => {
    const handleAskQuestion = () => {
        navigation.navigate(SCREENS.ASKQUESTION);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>My Posts</Text>
            <Text style={styles.subtitle}>Your legal posts and questions</Text>
            
            <TouchableOpacity style={styles.askButton} onPress={handleAskQuestion}>
                <Ionicons name="add" size={24} color={COLORS.WHITE} />
                <Text style={styles.askButtonText}>Đặt câu hỏi</Text>
            </TouchableOpacity>
        </View>
        
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.WHITE,
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.BLACK,
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.GRAY,
        textAlign: 'center',
        marginBottom: 30,
    },
    askButton: {
        backgroundColor: COLORS.BLUE,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        elevation: 2,
        shadowColor: COLORS.BLACK,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    askButtonText: {
        color: COLORS.WHITE,
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
});

export default MyPosts;
