import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useAuth } from '../../context/AuthContext';
import UserService from '../../services/UserService';
import COLORS from '../../constant/colors';
import SCREENS from '../index';
import QuestionList from '../../components/QuestionList/QuestionList';
import FloatingActionButton from '../../components/FloatingActionButton/FloatingActionButton';


const stripHtml = (html = '') => html.replace(/<[^>]*>/g, '').trim();
const createSummary = (content = '', maxLength = 150) => {
    const text = stripHtml(content);
    return text.length <= maxLength ? text : `${text.substring(0, maxLength)}...`;
};

const mapUserPostToQuestion = (post, author) => ({
    id: post.id,
    title: post.title || '',
    summary: createSummary(post.content || ''),
    voteCount: post.views || 0,
    answerCount: post.replyCount || 0,
    viewCount: post.views || 0,
    tags: post.categoryName ? [post.categoryName] : [],
    author: {
        id: author?.id ?? null,
        name: author?.fullName || 'Bạn',
        avatar: author?.avatar || null,
    },
    createdAt: post.createdAt ? new Date(post.createdAt) : new Date(),
    hasAcceptedAnswer: post.solved ?? false,
});

const MyPosts = ({ navigation }) => {
    const [activeTab, setActiveTab] = useState('myPosts');
    const [myPosts, setMyPosts] = useState([]);
    const [bookmarkedPosts] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const { user } = useAuth();

    const loadMyPosts = useCallback(async ({ pageIndex = 0, append = false } = {}) => {
        if (!user?.id) {
            return Promise.resolve();
        }

        try {
            const response = await UserService.getUserPosts(user.id, {
                page: pageIndex,
                size: 10,
                sort: 'createdAt,desc',
            });

            const content = response?.content ?? [];
            const mapped = content.map(post => mapUserPostToQuestion(post, user));

            setMyPosts(prev => (append ? [...prev, ...mapped] : mapped));

            const totalPages = response?.totalPages ?? 0;
            setHasMore(pageIndex < totalPages - 1);
            setPage(pageIndex + 1);
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Không thể tải bài viết của bạn',
                text2: error.message || 'Vui lòng thử lại sau',
            });
            throw error;
        }
    }, [user]);

    useEffect(() => {
        if (activeTab === 'myPosts') {
            setLoading(true);
            loadMyPosts({ pageIndex: 0, append: false })
                .catch(() => null)
                .finally(() => setLoading(false));
        }
    }, [activeTab, user?.id, loadMyPosts]);

    const handleAskQuestion = () => navigation.navigate(SCREENS.ASKQUESTION);
    const handleQuestionPress = question =>
        navigation.navigate(SCREENS.QUESTIONDETAIL, { question });

    const handleRefresh = () => {
        if (activeTab !== 'myPosts') return;
        setRefreshing(true);
        loadMyPosts({ pageIndex: 0, append: false })
            .catch(() => null)
            .finally(() => setRefreshing(false));
    };

    const handleLoadMore = () => {
        if (activeTab === 'myPosts' && !loading && hasMore) {
            setLoading(true);
            loadMyPosts({ pageIndex: page, append: true })
                .catch(() => null)
                .finally(() => setLoading(false));
        }
    };


    const getCurrentData = () =>
        activeTab === 'myPosts' ? myPosts : bookmarkedPosts;

    const getEmptyMessage = () =>
        activeTab === 'myPosts'
            ? {
                icon: '📝',
                title: 'Chưa có bài viết',
                text: 'Hãy đặt câu hỏi pháp lý đầu tiên của bạn!',
            }
            : {
                icon: '🔖',
                title: 'Chưa có bookmark',
                text: 'Bookmark những bài viết hữu ích để đọc lại sau!',
            };

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
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
                    onLoadMore={activeTab === 'myPosts' ? handleLoadMore : undefined}
                    loading={activeTab === 'myPosts' ? loading : false}
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
