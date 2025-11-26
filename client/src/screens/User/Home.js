import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader, FilterTabs, QuestionList, FloatingActionButton } from '../../components';
import COLORS from '../../constant/colors';
import ForumService from '../../services/ForumService';
import { useAuth } from '../../context/AuthContext';
import Toast from 'react-native-toast-message';

// Helper function to strip HTML tags and create summary
const stripHtml = (html = '') => {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '').trim();
};

const createSummary = (content = '', maxLength = 150) => {
    const plainText = stripHtml(content);
    if (plainText.length <= maxLength) return plainText;
    return plainText.substring(0, maxLength) + '...';
};

// Map PostDto to question format for UI
const mapPostToQuestion = (post) => {
    const tagsArray = post.tags ? (Array.isArray(post.tags) ? post.tags : Array.from(post.tags)) : [];
    
    return {
        id: post.id,
        title: post.title || '',
        summary: createSummary(post.content || ''),
        voteCount: post.upvoteCount || 0, // Using views as voteCount for now
        answerCount: post.replyCount || 0,
        viewCount: post.views || 0,
        tags: tagsArray,
        author: {
            id: post.author?.id || null,
            name: post.author?.name || 'Unknown',
            avatar: post.author?.avatar || null,
        },
        createdAt: post.createdAt ? new Date(post.createdAt) : new Date(),
        hasAcceptedAnswer: post.solved || false,
    };
};

const Home = ({ navigation }) => {
    const [activeTab, setActiveTab] = useState('newest');
    const [questions, setQuestions] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const { user } = useAuth();

    // User data for header
    const userDisplay = {
        name: user?.fullName || user?.name || 'Guest',
        avatar: user?.avatar || null,
    };

    useEffect(() => {
        loadQuestions(true);
    }, [activeTab]);

    const loadQuestions = async (resetPage = false) => {
        try {
            if (resetPage) {
                setPage(0);
                setLoading(true);
            }

            const currentPage = resetPage ? 0 : page;

            // Determine sort order based on active tab
            let sort = 'createdAt,desc';
            let filterUnanswered = false;

            switch (activeTab) {
                case 'hot':
                    sort = 'views,desc'; // Sort by views for hot posts
                    break;
                case 'unanswered':
                    sort = 'createdAt,desc';
                    filterUnanswered = true; // Filter on frontend or backend
                    break;
                case 'newest':
                default:
                    sort = 'createdAt,desc';
                    break;
            }

            const response = await ForumService.getPosts({
                page: currentPage,
                size: 20,
                sort: sort,
            });

            // Spring Page response structure: { content: [], totalElements, totalPages, number, size }
            const posts = response.content || [];
            let mappedQuestions = posts.map(mapPostToQuestion);

            // Filter unanswered on frontend if needed
            if (filterUnanswered && activeTab === 'unanswered') {
                mappedQuestions = mappedQuestions.filter(q => q.answerCount === 0);
            }

            if (resetPage) {
                setQuestions(mappedQuestions);
            } else {
                setQuestions(prev => [...prev, ...mappedQuestions]);
            }

            // Check if there are more pages
            const totalPages = response.totalPages || 0;
            setHasMore(currentPage < totalPages - 1);

            if (!resetPage) {
                setPage(prev => prev + 1);
            } else {
                setPage(1);
            }
        } catch (error) {
            console.error('Error loading questions:', error);
            Toast.show({
                type: 'error',
                text1: 'Lỗi tải dữ liệu',
                text2: error.message || 'Không thể tải danh sách bài viết',
            });
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    const handleSearch = () => {
        navigation.navigate('Search');
    };

    const handleNotification = () => {
        navigation.navigate('Notification');
    };

    const handleQuestionPress = (question) => {
        navigation.navigate('QuestionDetail', { question });
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadQuestions(true);
    };

    const handleLoadMore = () => {
        if (!loading && hasMore) {
            loadQuestions(false);
        }
    };

    const handleAddQuestion = () => {
        Alert.alert('Add Question', 'Navigate to add question screen');
    };

    return (
        <View style={styles.container}>
            <StatusBar 
                barStyle="dark-content" 
                backgroundColor={COLORS.WHITE} 
                translucent={false}
            />
            <SafeAreaView style={styles.safeArea} edges={['bottom']}>
                <AppHeader
                    onSearch={handleSearch}
                    onNotification={handleNotification}
                    user={userDisplay}
                />
                
                <FilterTabs
                    activeTab={activeTab}
                    onTabChange={handleTabChange}
                />
                
                <View style={styles.content}>
                    <QuestionList
                        questions={questions}
                        onQuestionPress={handleQuestionPress}
                        onRefresh={handleRefresh}
                        refreshing={refreshing}
                        onLoadMore={handleLoadMore}
                        loading={loading}
                    />
                </View>
                <Toast />
                
                {/* <FloatingActionButton onPress={handleAddQuestion} /> */}
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.WHITE,
    },
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.BG,
    },
    content: {
        flex: 1,
    },
});

export default Home;
