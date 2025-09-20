import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Switch,
    Alert,
    Dimensions,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../constant/colors';

const { width } = Dimensions.get('window');

const AskQuestion = ({ navigation }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [tags, setTags] = useState([]);
    const [currentTag, setCurrentTag] = useState('');
    const [isPreviewMode, setIsPreviewMode] = useState(false);

    // Suggestions data
    const similarQuestions = [
        'Làm thế nào để ly hôn thuận tình?',
        'Quy định về hợp đồng lao động',
        'Thủ tục đăng ký kinh doanh',
        'Quyền lợi của người tiêu dùng'
    ];

    const guidelines = [
        'Viết tiêu đề rõ ràng, súc tích',
        'Mô tả chi tiết vấn đề pháp lý của bạn',
        'Thêm các tag liên quan để dễ tìm kiếm',
        'Kiểm tra lại trước khi đăng'
    ];

    const addTag = () => {
        if (currentTag.trim() && !tags.includes(currentTag.trim())) {
            setTags([...tags, currentTag.trim()]);
            setCurrentTag('');
        }
    };

    const removeTag = (tagToRemove) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    const handleSubmit = () => {
        if (!title.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập tiêu đề câu hỏi');
            return;
        }
        if (!description.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập mô tả câu hỏi');
            return;
        }

        // TODO: Implement API call to submit question
        Alert.alert('Thành công', 'Câu hỏi của bạn đã được đăng!', [
            { text: 'OK', onPress: () => navigation.goBack() }
        ]);
    };

    const renderPreview = () => (
        <View style={styles.previewContainer}>
            <Text style={styles.previewTitle}>{title || 'Tiêu đề câu hỏi...'}</Text>
            <Text style={styles.previewDescription}>
                {description || 'Mô tả câu hỏi sẽ hiển thị ở đây...'}
            </Text>
            <View style={styles.previewTagsContainer}>
                {tags.map((tag, index) => (
                    <View key={index} style={styles.previewTag}>
                        <Text style={styles.previewTagText}>{tag}</Text>
                    </View>
                ))}
            </View>
        </View>
    );

    const renderForm = () => (
        <View style={styles.formContainer}>
            {/* Title Input */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Tiêu đề <Text style={styles.required}>*</Text></Text>
                <TextInput
                    style={styles.titleInput}
                    placeholder="Nhập tiêu đề câu hỏi..."
                    value={title}
                    onChangeText={setTitle}
                    maxLength={200}
                    multiline
                />
                <Text style={styles.charCount}>{title.length}/200</Text>
            </View>

            {/* Description Input */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Mô tả <Text style={styles.required}>*</Text></Text>
                <TextInput
                    style={styles.descriptionInput}
                    placeholder="Mô tả chi tiết vấn đề pháp lý của bạn...&#10;&#10;Bạn có thể sử dụng:&#10;**in đậm**&#10;*in nghiêng*&#10;- Danh sách"
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    textAlignVertical="top"
                />
                <Text style={styles.markdownHint}>
                    Hỗ trợ Markdown cơ bản: **in đậm**, *in nghiêng*, - danh sách
                </Text>
            </View>

            {/* Tags Input */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Tags</Text>
                <View style={styles.tagInputContainer}>
                    <TextInput
                        style={styles.tagInput}
                        placeholder="Nhập tag và nhấn thêm..."
                        value={currentTag}
                        onChangeText={setCurrentTag}
                        onSubmitEditing={addTag}
                    />
                    <TouchableOpacity style={styles.addTagButton} onPress={addTag}>
                        <Ionicons name="add" size={20} color={COLORS.WHITE} />
                    </TouchableOpacity>
                </View>
                <View style={styles.tagsContainer}>
                    {tags.map((tag, index) => (
                        <View key={index} style={styles.tag}>
                            <Text style={styles.tagText}>{tag}</Text>
                            <TouchableOpacity onPress={() => removeTag(tag)}>
                                <Ionicons name="close" size={16} color={COLORS.WHITE} />
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
            </View>
        </View>
    );

    const renderSuggestions = () => (
        <View style={styles.suggestionsContainer}>
            {/* Similar Questions */}
            <View style={styles.suggestionSection}>
                <Text style={styles.suggestionTitle}>Câu hỏi tương tự</Text>
                {similarQuestions.map((question, index) => (
                    <TouchableOpacity key={index} style={styles.suggestionItem}>
                        <Text style={styles.suggestionText}>{question}</Text>
                        <Ionicons name="chevron-forward" size={16} color={COLORS.GRAY} />
                    </TouchableOpacity>
                ))}
            </View>

            {/* Guidelines */}
            <View style={styles.suggestionSection}>
                <Text style={styles.suggestionTitle}>Hướng dẫn viết câu hỏi</Text>
                {guidelines.map((guideline, index) => (
                    <View key={index} style={styles.guidelineItem}>
                        <Ionicons name="checkmark-circle" size={16} color={COLORS.GREEN} />
                        <Text style={styles.guidelineText}>{guideline}</Text>
                    </View>
                ))}
            </View>
        </View>
    );

    return (
        <KeyboardAvoidingView 
            style={styles.container} 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.BLACK} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Đặt câu hỏi</Text>
                <View style={styles.headerRight} />
            </View>

            <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                {/* Preview Toggle */}
                <View style={styles.toggleContainer}>
                    <Text style={styles.toggleLabel}>Xem trước</Text>
                    <Switch
                        value={isPreviewMode}
                        onValueChange={setIsPreviewMode}
                        trackColor={{ false: COLORS.GRAY_BG, true: COLORS.BLUE_LIGHT }}
                        thumbColor={isPreviewMode ? COLORS.BLUE : COLORS.WHITE}
                    />
                </View>

                {/* Content */}
                {isPreviewMode ? renderPreview() : renderForm()}

                {/* Suggestions */}
                {renderSuggestions()}
            </ScrollView>

            {/* Submit Button */}
            <View style={styles.submitContainer}>
                <TouchableOpacity 
                    style={[
                        styles.submitButton,
                        (!title.trim() || !description.trim()) && styles.submitButtonDisabled
                    ]} 
                    onPress={handleSubmit}
                    disabled={!title.trim() || !description.trim()}
                >
                    <Text style={styles.submitButtonText}>Đăng câu hỏi</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.WHITE,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.GRAY_BG,
        paddingTop: Platform.OS === 'ios' ? 50 : 16,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.BLACK,
    },
    headerRight: {
        width: 24,
    },
    scrollContainer: {
        flex: 1,
    },
    toggleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.GRAY_BG,
    },
    toggleLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: COLORS.BLACK,
    },
    formContainer: {
        padding: 16,
    },
    inputGroup: {
        marginBottom: 24,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.BLACK,
        marginBottom: 8,
    },
    required: {
        color: COLORS.RED,
    },
    titleInput: {
        borderWidth: 1,
        borderColor: COLORS.GRAY_BG,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        minHeight: 80,
        textAlignVertical: 'top',
    },
    charCount: {
        fontSize: 12,
        color: COLORS.GRAY,
        textAlign: 'right',
        marginTop: 4,
    },
    descriptionInput: {
        borderWidth: 1,
        borderColor: COLORS.GRAY_BG,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        minHeight: 150,
        textAlignVertical: 'top',
    },
    markdownHint: {
        fontSize: 12,
        color: COLORS.GRAY,
        marginTop: 4,
        fontStyle: 'italic',
    },
    tagInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    tagInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: COLORS.GRAY_BG,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        marginRight: 8,
    },
    addTagButton: {
        backgroundColor: COLORS.BLUE,
        borderRadius: 8,
        padding: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    tag: {
        backgroundColor: COLORS.BLUE,
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginRight: 8,
        marginBottom: 8,
        flexDirection: 'row',
        alignItems: 'center',
    },
    tagText: {
        color: COLORS.WHITE,
        fontSize: 14,
        marginRight: 4,
    },
    previewContainer: {
        padding: 16,
        backgroundColor: COLORS.GRAY_BG,
        margin: 16,
        borderRadius: 8,
    },
    previewTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.BLACK,
        marginBottom: 12,
    },
    previewDescription: {
        fontSize: 16,
        color: COLORS.GRAY_DARK,
        lineHeight: 24,
        marginBottom: 16,
    },
    previewTagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    previewTag: {
        backgroundColor: COLORS.BLUE_LIGHT,
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
        marginRight: 6,
        marginBottom: 6,
    },
    previewTagText: {
        color: COLORS.BLUE,
        fontSize: 12,
        fontWeight: '500',
    },
    suggestionsContainer: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: COLORS.GRAY_BG,
    },
    suggestionSection: {
        marginBottom: 24,
    },
    suggestionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.BLACK,
        marginBottom: 12,
    },
    suggestionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: COLORS.GRAY_BG,
        borderRadius: 8,
        marginBottom: 8,
    },
    suggestionText: {
        flex: 1,
        fontSize: 14,
        color: COLORS.BLUE,
    },
    guidelineItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
    },
    guidelineText: {
        flex: 1,
        fontSize: 14,
        color: COLORS.GRAY_DARK,
        marginLeft: 8,
    },
    submitContainer: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: COLORS.GRAY_BG,
    },
    submitButton: {
        backgroundColor: COLORS.BLUE,
        borderRadius: 8,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    submitButtonDisabled: {
        backgroundColor: COLORS.GRAY,
    },
    submitButtonText: {
        color: COLORS.WHITE,
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default AskQuestion;
