import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../constant/colors';
import SCREENS from '../index';
import QuestionList from '../../components/QuestionList/QuestionList';
import FloatingActionButton from '../../components/FloatingActionButton/FloatingActionButton';

const MyPosts = ({ navigation }) => {
    const [activeTab, setActiveTab] = useState('myPosts');
    const [refreshing, setRefreshing] = useState(false);

    // Mock data for posts - in real app, this would come from API
    const myPosts = [
        {
            id: 1,
            title: "Hợp đồng thuê nhà có hiệu lực bao lâu?",
            summary: "Tôi vừa ký hợp đồng thuê nhà với chủ nhà, nhưng không rõ thời hạn hiệu lực...",
            tags: ["hợp đồng", "thuê nhà", "luật dân sự"],
            voteCount: 5,
            answerCount: 3,
            viewCount: 120,
            hasAcceptedAnswer: true,
            author: { name: "Bạn" },
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
        },
        {
            id: 2,
            title: "Quy định về chấm dứt hợp đồng lao động",
            summary: "Công ty tôi muốn chấm dứt hợp đồng lao động với tôi mà không có lý do chính đáng...",
            tags: ["lao động", "hợp đồng", "chấm dứt"],
            voteCount: 8,
            answerCount: 0,
            viewCount: 85,
            hasAcceptedAnswer: false,
            author: { name: "Bạn" },
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
        }
    ];

    const bookmarkedPosts = [
        {
            id: 3,
            title: "Thủ tục ly hôn đơn phương cần những gì?",
            summary: "Tôi muốn ly hôn đơn phương nhưng chưa biết cần chuẩn bị những giấy tờ gì...",
            tags: ["ly hôn", "hôn nhân", "thủ tục"],
            voteCount: 12,
            answerCount: 7,
            viewCount: 245,
            hasAcceptedAnswer: true,
            author: { name: "Luật sư Minh" },
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
        },
        {
            id: 4,
            title: "Quyền lợi của người lao động khi nghỉ việc",
            summary: "Khi nghỉ việc, tôi có được hưởng những quyền lợi gì từ công ty...",
            tags: ["lao động", "nghỉ việc", "quyền lợi"],
            voteCount: 6,
            answerCount: 4,
            viewCount: 156,
            hasAcceptedAnswer: false,
            author: { name: "Chuyên gia HR" },
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
        }
    ];

    const handleAskQuestion = () => {
        navigation.navigate(SCREENS.ASKQUESTION);
    };

    const handleQuestionPress = (question) => {
        // Navigate to question detail - implement this when you have the detail screen
        console.log('Question pressed:', question.title);
    };

    const handleRefresh = () => {
        setRefreshing(true);
        // Simulate API call
        setTimeout(() => {
            setRefreshing(false);
        }, 1500);
    };

    const getCurrentData = () => {
        return activeTab === 'myPosts' ? myPosts : bookmarkedPosts;
    };

    const getEmptyMessage = () => {
        return activeTab === 'myPosts' 
            ? { icon: '📝', title: 'Chưa có bài viết', text: 'Hãy đặt câu hỏi pháp lý đầu tiên của bạn!' }
            : { icon: '🔖', title: 'Chưa có bookmark', text: 'Bookmark những bài viết hữu ích để đọc lại sau!' };
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Bài đăng</Text>
            </View>

            {/* Tabs */}
            <View style={styles.tabsContainer}>
                <TouchableOpacity 
                    style={[styles.tab, activeTab === 'myPosts' && styles.activeTab]}
                    onPress={() => setActiveTab('myPosts')}
                >
                    <Ionicons 
                        name="document-text-outline" 
                        size={20} 
                        color={activeTab === 'myPosts' ? COLORS.WHITE : COLORS.GRAY_DARK} 
                    />
                    <Text style={[
                        styles.tabText, 
                        activeTab === 'myPosts' && styles.activeTabText
                    ]}>
                        Bài viết của tôi
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={[styles.tab, activeTab === 'bookmarked' && styles.activeTab]}
                    onPress={() => setActiveTab('bookmarked')}
                >
                    <Ionicons 
                        name="bookmark-outline" 
                        size={20} 
                        color={activeTab === 'bookmarked' ? COLORS.WHITE : COLORS.GRAY_DARK} 
                    />
                    <Text style={[
                        styles.tabText, 
                        activeTab === 'bookmarked' && styles.activeTabText
                    ]}>
                        Đã bookmark
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Content */}
            <View style={styles.content}>
                <QuestionList
                    questions={getCurrentData()}
                    onQuestionPress={handleQuestionPress}
                    onRefresh={handleRefresh}
                    refreshing={refreshing}
                    emptyState={getEmptyMessage()}
                />
            </View>

            {/* Floating Action Button */}
            <FloatingActionButton
                onPress={handleAskQuestion}
                icon="add"
                style={styles.fab}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.BG,
    },
    header: {
        backgroundColor: COLORS.WHITE,
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.GRAY_BG,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.BLACK,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: COLORS.GRAY,
    },
    tabsContainer: {
        flexDirection: 'row',
        backgroundColor: COLORS.WHITE,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.GRAY_BG,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginHorizontal: 4,
        borderRadius: 8,
        backgroundColor: COLORS.GRAY_BG,
    },
    activeTab: {
        backgroundColor: COLORS.BLUE,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.GRAY_DARK,
        marginLeft: 8,
    },
    activeTabText: {
        color: COLORS.WHITE,
    },
    content: {
        flex: 1,
    },
    fab: {
        position: 'absolute',
        bottom: 20,
        right: 20,
    },
});

export default MyPosts;
