import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader, FilterTabs, QuestionList, FloatingActionButton } from '../../components';
import COLORS from '../../constant/colors';

const Home = ({ navigation }) => {
    const [activeTab, setActiveTab] = useState('newest');
    const [questions, setQuestions] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(false);

    // Mock user data
    const user = {
        name: 'John Doe',
        avatar: null, // URL to avatar image or null for default
    };

    // Mock questions data
    const mockQuestions = [
        {
            id: 1,
            title: 'What are the legal requirements for starting a business in Vietnam?',
            summary: 'I want to start a small business and need to understand the legal procedures, required documents, and regulations...',
            voteCount: 15,
            answerCount: 3,
            viewCount: 124,
            tags: ['Business Law', 'Startup', 'Vietnam'],
            author: {
                id: 1,
                name: 'Alice Johnson',
                avatar: null,
            },
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
            hasAcceptedAnswer: true,
        },
        {
            id: 2,
            title: 'Employment contract termination rights in Vietnam',
            summary: 'My employer wants to terminate my contract. What are my rights and what compensation should I expect?',
            voteCount: 8,
            answerCount: 5,
            viewCount: 89,
            tags: ['Employment Law', 'Contract', 'Rights'],
            author: {
                id: 2,
                name: 'Mike Chen',
                avatar: null,
            },
            createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
            hasAcceptedAnswer: false,
        },
        {
            id: 3,
            title: 'Intellectual property protection for software developers',
            summary: 'How can I protect my mobile app idea and source code from being copied by competitors?',
            voteCount: 12,
            answerCount: 0,
            viewCount: 67,
            tags: ['IP Law', 'Software', 'Copyright'],
            author: {
                id: 3,
                name: 'Sarah Wilson',
                avatar: null,
            },
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
            hasAcceptedAnswer: false,
        },
        {
            id: 4,
            title: 'Real estate purchase agreement review needed',
            summary: 'I am buying my first house and the contract seems complex. What should I look out for?',
            voteCount: 6,
            answerCount: 2,
            viewCount: 45,
            tags: ['Real Estate', 'Contract Review', 'Property'],
            author: {
                id: 4,
                name: 'David Brown',
                avatar: null,
            },
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
            hasAcceptedAnswer: false,
        },
        {
            id: 5,
            title: 'Divorce proceedings and child custody laws',
            summary: 'What should I know about divorce procedures and how child custody is determined in Vietnamese law?',
            voteCount: 20,
            answerCount: 7,
            viewCount: 203,
            tags: ['Family Law', 'Divorce', 'Child Custody'],
            author: {
                id: 5,
                name: 'Emma Davis',
                avatar: null,
            },
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
            hasAcceptedAnswer: true,
        },
    ];

    useEffect(() => {
        loadQuestions();
    }, [activeTab]);

    const loadQuestions = () => {
        setLoading(true);
        // Simulate API call delay
        setTimeout(() => {
            let filteredQuestions = [...mockQuestions];
            
            // Filter based on active tab
            switch (activeTab) {
                case 'hot':
                    filteredQuestions = filteredQuestions.sort((a, b) => b.voteCount - a.voteCount);
                    break;
                case 'unanswered':
                    filteredQuestions = filteredQuestions.filter(q => q.answerCount === 0);
                    break;
                case 'newest':
                default:
                    filteredQuestions = filteredQuestions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                    break;
            }
            
            setQuestions(filteredQuestions);
            setLoading(false);
        }, 500);
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

    const handleRefresh = () => {
        setRefreshing(true);
        setTimeout(() => {
            loadQuestions();
            setRefreshing(false);
        }, 1000);
    };

    const handleLoadMore = () => {
        // Implement pagination here
        console.log('Load more questions');
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
                    user={user}
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
                
                <FloatingActionButton onPress={handleAddQuestion} />
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
