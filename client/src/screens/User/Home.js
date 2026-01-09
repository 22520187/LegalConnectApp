import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
    View,
    StyleSheet,
    Alert,
    StatusBar,
    Text,
    TouchableOpacity,
    Modal,
    Pressable,
    FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader, FilterTabs, QuestionList, FloatingActionButton } from '../../components';
import COLORS from '../../constant/colors';
import ForumService from '../../services/ForumService';
import NotificationService from '../../services/NotificationService';
import { useAuth } from '../../context/AuthContext';
import Toast from 'react-native-toast-message';
import { useFocusEffect } from '@react-navigation/native';

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

const mapPostToQuestion = (post, categories = []) => {
    const tagsArray = post.tags ? (Array.isArray(post.tags) ? post.tags : Array.from(post.tags)) : [];

    const postCategoryId =
        post.categoryId ?? post.category?.id ?? post.category?.categoryId ?? null;
    const resolvedCategoryName =
        post.categoryName ||
        post.category?.name ||
        categories.find((c) => String(c?.id) === String(postCategoryId))?.name ||
        '';
    
    return {
        id: post.id,
        title: post.title || '',
        summary: createSummary(post.content || ''),
        voteCount: post.upvoteCount || 0, // Using views as voteCount for now
        answerCount: post.replyCount || 0,
        viewCount: post.views || 0,
        tags: tagsArray,
        categoryId: postCategoryId,
        categoryName: resolvedCategoryName,
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
    const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
    const { user, logout } = useAuth();

    // Prevent stale requests from overwriting new tab results
    const requestSeqRef = useRef(0);

    // Advanced filters (similar to web forum filters)
    const [categories, setCategories] = useState([]);
    const [categoriesLoading, setCategoriesLoading] = useState(false);
    const [selectedCategoryId, setSelectedCategoryId] = useState(null); // null = all

    // Modal state for filter selection
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [filterModalType, setFilterModalType] = useState(null); // 'category'

    // User data for header
    const userDisplay = {
        name: user?.fullName || user?.name || 'Guest',
        avatar: user?.avatar || null,
    };

    useEffect(() => {
        loadQuestions(true);
    }, [activeTab]);

    useEffect(() => {
        // Reload when advanced filters change
        loadQuestions(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedCategoryId]);

    useEffect(() => {
        const loadCategories = async () => {
            try {
                setCategoriesLoading(true);
                const data = await ForumService.getCategories();
                const list = Array.isArray(data) ? data : [];
                setCategories(list);
            } catch (error) {
                console.error('Error loading categories:', error);
                Toast.show({
                    type: 'error',
                    text1: 'Lỗi tải danh mục',
                    text2: error.message || 'Không thể tải danh mục bài viết',
                });
            } finally {
                setCategoriesLoading(false);
            }
        };
        loadCategories();
    }, []);

    // Load unread notification count
    const loadUnreadNotificationCount = async () => {
        try {
            const count = await NotificationService.getUnreadCount();
            setUnreadNotificationCount(count || 0);
        } catch (error) {
            console.error('Error loading unread notification count:', error);
            setUnreadNotificationCount(0);
        }
    };

    // Load notification count when component mounts
    useEffect(() => {
        loadUnreadNotificationCount();
    }, []);

    // Reload notification count when screen comes into focus
    useFocusEffect(
        React.useCallback(() => {
            loadUnreadNotificationCount();
        }, [])
    );

    const selectedCategoryName = useMemo(() => {
        if (!selectedCategoryId) return 'Tất cả';
        const found = categories.find((c) => String(c?.id) === String(selectedCategoryId));
        return found?.name || found?.title || 'Danh mục';
    }, [categories, selectedCategoryId]);

    const sortQuestionsByTab = (items, tabKey) => {
        const arr = Array.isArray(items) ? [...items] : [];
        switch (tabKey) {
            case 'mostViewed':
                return arr.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
            case 'mostReplied':
                return arr.sort((a, b) => (b.answerCount || 0) - (a.answerCount || 0));
            case 'newest':
            default:
                return arr.sort(
                    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
        }
    };

    const loadQuestions = async (resetPage = false) => {
        const requestId = ++requestSeqRef.current;
        try {
            if (resetPage) {
                setPage(0);
                setLoading(true);
            }

            const currentPage = resetPage ? 0 : page;

            // Determine sort order based on active tab
            let sort = 'createdAt,desc';

            switch (activeTab) {
                case 'mostViewed':
                    sort = 'views,desc';
                    break;
                case 'mostReplied':
                    sort = 'replyCount,desc';
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
                categoryId: selectedCategoryId,
            });

            // Ignore stale results (e.g., user taps tabs quickly)
            if (requestId !== requestSeqRef.current) return;

            // Backend may return either:
            // - Spring Page-like: { content, totalPages, number, ... }
            // - Wrapped page: { content, page: { totalPages, number, ... } }
            const posts = response?.content || [];
            let mappedQuestions = posts.map((p) => mapPostToQuestion(p, categories));

            setQuestions((prev) => {
                const merged = resetPage ? mappedQuestions : [...prev, ...mappedQuestions];
                // Local sort fallback to ensure UI ordering even if backend ignores sort
                return sortQuestionsByTab(merged, activeTab);
            });

            // Check if there are more pages
            const currentPageNum =
                response?.number ?? response?.page?.number ?? currentPage;
            const totalPages =
                response?.totalPages ?? response?.page?.totalPages ?? 0;

            setHasMore(currentPageNum < totalPages - 1);
            setPage(currentPageNum + 1);
        } catch (error) {
            console.error('Error loading questions:', error);
            Toast.show({
                type: 'error',
                text1: 'Lỗi tải dữ liệu',
                text2: error.message || 'Không thể tải danh sách bài viết',
            });
        } finally {
            // Only clear loading for the latest request
            if (requestId === requestSeqRef.current) {
                setLoading(false);
                setRefreshing(false);
            }
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

    const handleLogout = () => {
        Alert.alert(
            'Đăng xuất',
            'Bạn có chắc chắn muốn đăng xuất?',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Đăng xuất',
                    style: 'destructive',
                    onPress: async () => {
                        // Logout sẽ luôn thành công vì đã xóa local storage
                        // API call có thể fail nếu session hết hạn nhưng không ảnh hưởng
                        await logout();
                    },
                },
            ]
        );
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
        Alert.alert('Tạo câu hỏi', 'Đi tới màn hình tạo câu hỏi');
    };

    const openFilterModal = (type) => {
        setFilterModalType(type);
        setFilterModalVisible(true);
    };

    const closeFilterModal = () => {
        setFilterModalVisible(false);
        setFilterModalType(null);
    };

    const clearAdvancedFilters = () => {
        setSelectedCategoryId(null);
    };

    const renderFilterOption = ({ item }) => {
        const isSelected = item?.selected;
        return (
            <TouchableOpacity
                style={[styles.filterOption, isSelected && styles.filterOptionSelected]}
                onPress={item?.onPress}
            >
                <Text style={[styles.filterOptionText, isSelected && styles.filterOptionTextSelected]}>
                    {item?.label}
                </Text>
            </TouchableOpacity>
        );
    };

    const filterOptions = useMemo(() => {
        if (filterModalType === 'category') {
            const allOption = {
                key: 'all',
                label: 'Tất cả danh mục',
                selected: !selectedCategoryId,
                onPress: () => {
                    setSelectedCategoryId(null);
                    closeFilterModal();
                },
            };

            const mapped = (Array.isArray(categories) ? categories : []).map((c) => ({
                key: String(c?.id),
                label: c?.name || c?.title || 'Danh mục',
                selected: String(selectedCategoryId) === String(c?.id),
                onPress: () => {
                    setSelectedCategoryId(c?.id ?? null);
                    closeFilterModal();
                },
            }));

            return [allOption, ...mapped];
        }

        return [];
    }, [categories, filterModalType, selectedCategoryId]);

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
                    onLogout={handleLogout}
                    notificationCount={unreadNotificationCount}
                />
                
                <FilterTabs
                    activeTab={activeTab}
                    onTabChange={handleTabChange}
                />

                {/* Advanced filters row */}
                <View style={styles.advancedFilters}>
                    <View style={styles.filterBar}>
                        <TouchableOpacity
                            style={styles.categorySelect}
                            onPress={() => openFilterModal('category')}
                            activeOpacity={0.8}
                        >
                            <View style={styles.categoryText}>
                                <Text style={styles.categoryLabel}>Danh mục</Text>
                                <Text style={styles.categoryValue} numberOfLines={1}>
                                    {categoriesLoading ? 'Đang tải danh mục...' : selectedCategoryName}
                                </Text>
                            </View>
                            <Text style={styles.chevron}>›</Text>
                        </TouchableOpacity>

                        {!!selectedCategoryId && (
                            <TouchableOpacity
                                style={styles.clearButton}
                                onPress={clearAdvancedFilters}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.clearButtonText}>Xoá</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
                
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

            {/* Filter Modal */}
            <Modal
                visible={filterModalVisible}
                transparent
                animationType="slide"
                onRequestClose={closeFilterModal}
            >
                <Pressable style={styles.modalOverlay} onPress={closeFilterModal} />
                <View style={styles.modalSheet}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>
                            {filterModalType === 'category'
                                ? 'Chọn danh mục'
                                : 'Bộ lọc'}
                        </Text>
                        <TouchableOpacity onPress={closeFilterModal}>
                            <Text style={styles.modalClose}>Đóng</Text>
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        data={filterOptions}
                        keyExtractor={(item) => item.key}
                        renderItem={renderFilterOption}
                        showsVerticalScrollIndicator={false}
                    />
                </View>
            </Modal>
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
    advancedFilters: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: COLORS.BG,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.GRAY_BG,
    },
    filterBar: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    categorySelect: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: COLORS.WHITE,
        borderWidth: 1,
        borderColor: COLORS.GRAY_BG,
    },
    categoryText: {
        flex: 1,
    },
    categoryLabel: {
        fontSize: 12,
        color: COLORS.GRAY_DARK,
        marginBottom: 2,
    },
    categoryValue: {
        fontSize: 14,
        color: COLORS.BLACK,
        fontWeight: '700',
    },
    chevron: {
        marginLeft: 10,
        fontSize: 22,
        lineHeight: 22,
        color: COLORS.GRAY_DARK,
    },
    clearButton: {
        marginLeft: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: COLORS.BLUE,
        justifyContent: 'center',
        alignItems: 'center',
    },
    clearButtonText: {
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.WHITE,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.35)',
    },
    modalSheet: {
        maxHeight: '60%',
        backgroundColor: COLORS.WHITE,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        paddingBottom: 16,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.GRAY_BG,
    },
    modalTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.BLACK,
    },
    modalClose: {
        fontSize: 14,
        color: COLORS.BLUE,
        fontWeight: '600',
    },
    filterOption: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.GRAY_BG,
    },
    filterOptionSelected: {
        backgroundColor: COLORS.GRAY_BG,
    },
    filterOptionText: {
        fontSize: 14,
        color: COLORS.BLACK,
    },
    filterOptionTextSelected: {
        fontWeight: '700',
    },
});

export default Home;
