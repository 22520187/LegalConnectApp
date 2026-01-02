import apiClient from './ApiClient';

/**
 * Get all posts with filters and pagination
 * @param {number} page - Page number (default: 0)
 * @param {number} size - Page size (default: 10)
 * @param {number|null} categoryId - Filter by category ID
 * @param {string|null} timeFilter - Filter by time (week, month, year)
 * @returns {Promise<Object>} Page object with posts
 */
export const getAllPosts = async (page = 0, size = 10, categoryId = null, timeFilter = null) => {
    try {
        const params = { page, size };
        if (categoryId) params.categoryId = categoryId;
        if (timeFilter) params.timeFilter = timeFilter;

        // Gọi API /api/forum/posts
        const response = await apiClient.get('/forum/posts', { params });

        // Kiểm tra phản hồi có hợp lệ không
        if (response.status >= 200 && response.status < 300) {
            return response.data; // Đây là Page<PostDto>
        } else {
            console.error('API returned non-success status:', response.status);
            return null;
        }
    } catch (error) {
        console.error('Error fetching posts:', error);
        throw error;
    }
};

/**
 * Get all post categories
 * @returns {Promise<Array>} List of categories
 */
export const getCategories = async () => {
    try {
        const response = await apiClient.get('/forum/categories');

        if (response.status >= 200 && response.status < 300) {
            return response.data;
        } else {
            console.error('API returned non-success status:', response.status);
            return [];
        }
    } catch (error) {
        console.error('Error fetching categories:', error);
        throw error;
    }
};

/**
 * Get posts with advanced options (sort, filter, etc.)
 * @param {Object} options - Query options
 * @param {number} options.page - Page number
 * @param {number} options.size - Page size
 * @param {string} options.sort - Sort field and direction (e.g., "createdAt,desc")
 * @param {number} options.categoryId - Filter by category ID
 * @param {string} options.timeFilter - Filter by time
 * @returns {Promise<Object>} Page object with posts
 */
export const getPosts = async (options = {}) => {
    try {
        const { 
            page = 0, 
            size = 20, 
            sort = 'createdAt,desc',
            categoryId = null,
            timeFilter = null 
        } = options;

        const params = { page, size, sort };
        if (categoryId) params.categoryId = categoryId;
        if (timeFilter) params.timeFilter = timeFilter;

        const response = await apiClient.get('/forum/posts', { params });

        if (response.status >= 200 && response.status < 300) {
            return response.data;
        } else {
            console.error('API returned non-success status:', response.status);
            return { content: [], totalElements: 0, totalPages: 0, number: 0 };
        }
    } catch (error) {
        console.error('Error fetching posts:', error);
        throw error;
    }
};

/**
 * Get post by ID
 * @param {number} postId - Post ID
 * @returns {Promise<Object>} Post details
 */
export const getPostById = async (postId) => {
    try {
        const response = await apiClient.get(`/forum/posts/${postId}`);
        
        if (response.status >= 200 && response.status < 300) {
            return response.data;
        } else {
            console.error('API returned non-success status:', response.status);
            return null;
        }
    } catch (error) {
        console.error('Error fetching post:', error);
        throw error;
    }
};

/**
 * Create a new post
 * @param {Object} postData - Post data
 * @param {string} postData.title - Post title
 * @param {string} postData.content - Post content
 * @param {number} postData.categoryId - Category ID
 * @param {Array<string>} postData.tags - Post tags
 * @returns {Promise<Object>} Created post
 */
export const createPost = async (postData) => {
    try {
        const response = await apiClient.post('/forum/posts', postData);
        
        if (response.status >= 200 && response.status < 300) {
            return response.data;
        } else {
            // Throw error for non-success status codes
            const error = new Error('Failed to create post');
            error.response = response;
            error.status = response.status;
            // Extract validation error message if available
            if (response.data) {
                // Handle ApiResponse format from GlobalExceptionHandler
                if (response.data.data && typeof response.data.data === 'object') {
                    // Extract validation errors from data object
                    const validationErrors = Object.values(response.data.data).join(', ');
                    error.message = validationErrors || response.data.message || 'Validation failed';
                } else if (response.data.message) {
                    error.message = response.data.message;
                } else if (response.data.errors && Array.isArray(response.data.errors)) {
                    // Handle validation errors from Spring Boot (alternative format)
                    const errorMessages = response.data.errors.map(err => err.defaultMessage || err.message).join(', ');
                    error.message = errorMessages || 'Validation failed';
                } else if (response.data.validationErrors) {
                    // Handle PostExceptionHandler format
                    const validationErrors = Object.values(response.data.validationErrors).join(', ');
                    error.message = validationErrors || 'Validation failed';
                }
            }
            throw error;
        }
    } catch (error) {
        console.error('Error creating post:', error);
        throw error;
    }
};

/**
 * Update a post
 * @param {number} postId - Post ID
 * @param {Object} postData - Updated post data
 * @returns {Promise<Object>} Updated post
 */
export const updatePost = async (postId, postData) => {
    try {
        const response = await apiClient.put(`/forum/posts/${postId}`, postData);
        
        if (response.status >= 200 && response.status < 300) {
            return response.data;
        } else {
            console.error('API returned non-success status:', response.status);
            return null;
        }
    } catch (error) {
        console.error('Error updating post:', error);
        throw error;
    }
};

/**
 * Delete a post
 * @param {number} postId - Post ID
 * @returns {Promise<boolean>} Success status
 */
export const deletePost = async (postId) => {
    try {
        const response = await apiClient.delete(`/forum/posts/${postId}`);
        return response.status >= 200 && response.status < 300;
    } catch (error) {
        console.error('Error deleting post:', error);
        throw error;
    }
};

/**
 * Vote on a post
 * @param {number} postId - Post ID
 * @param {'UPVOTE'|'DOWNVOTE'|'NONE'} voteType - Vote action
 * @returns {Promise<Object>} Vote response (VoteDto)
 */
export const votePost = async (postId, voteType) => {
    try {
        const response = await apiClient.post(`/forum/posts/${postId}/vote`, { voteType });
        
        if (response.status >= 200 && response.status < 300) {
            return response.data;
        } else {
            console.error('API returned non-success status:', response.status);
            return null;
        }
    } catch (error) {
        console.error('Error voting post:', error);
        throw error;
    }
};

/**
 * Vote on a reply
 * @param {number} replyId - Reply ID
 * @param {'UPVOTE'|'DOWNVOTE'|'NONE'} voteType - Vote action
 * @returns {Promise<Object>} Vote response (VoteDto)
 */
export const voteReply = async (replyId, voteType) => {
    try {
        const response = await apiClient.post(`/forum/replies/${replyId}/vote`, { voteType });
        
        if (response.status >= 200 && response.status < 300) {
            return response.data;
        } else {
            console.error('API returned non-success status:', response.status);
            return null;
        }
    } catch (error) {
        console.error('Error voting reply:', error);
        throw error;
    }
};

/**
 * Get aggregated vote stats for a post
 * @param {number} postId - Post ID
 * @returns {Promise<Object|null>} Vote statistics (VoteDto)
 */
export const getPostVotes = async (postId) => {
    try {
        const response = await apiClient.get(`/forum/posts/${postId}/votes`);
        
        if (response.status >= 200 && response.status < 300) {
            return response.data;
        } else {
            console.error('API returned non-success status:', response.status);
            return null;
        }
    } catch (error) {
        console.error('Error fetching post votes:', error);
        throw error;
    }
};

/**
 * Get aggregated vote stats for a reply
 * @param {number} replyId - Reply ID
 * @returns {Promise<Object|null>} Vote statistics (VoteDto)
 */
export const getReplyVotes = async (replyId) => {
    try {
        const response = await apiClient.get(`/forum/replies/${replyId}/votes`);
        
        if (response.status >= 200 && response.status < 300) {
            return response.data;
        } else {
            console.error('API returned non-success status:', response.status);
            return null;
        }
    } catch (error) {
        console.error('Error fetching reply votes:', error);
        throw error;
    }
};

/**
 * Get replies for a post
 * @param {number} postId - Post ID
 * @returns {Promise<Array>} List of replies
 */
export const getReplies = async (postId) => {
    try {
        const response = await apiClient.get(`/forum/posts/${postId}/replies`);
        
        if (response.status >= 200 && response.status < 300) {
            // Backend returns List<PostReplyDto>, not Page
            return Array.isArray(response.data) ? response.data : [];
        } else {
            console.error('API returned non-success status:', response.status);
            return [];
        }
    } catch (error) {
        console.error('Error fetching replies:', error);
        throw error;
    }
};

/**
 * Search posts by keyword
 * @param {string} keyword - Search keyword
 * @param {Object} options - Query options
 * @param {number} options.page - Page number (default: 0)
 * @param {number} options.size - Page size (default: 20)
 * @param {string} options.sort - Sort field and direction (e.g., "createdAt,desc")
 * @returns {Promise<Object>} Page object with posts
 */
export const searchPosts = async (keyword, options = {}) => {
    try {
        const { 
            page = 0, 
            size = 20, 
            sort = 'createdAt,desc'
        } = options;

        const params = { keyword, page, size, sort };
        const response = await apiClient.get('/forum/posts/search', { params });

        if (response.status >= 200 && response.status < 300) {
            return response.data;
        } else {
            console.error('API returned non-success status:', response.status);
            return { content: [], totalElements: 0, totalPages: 0, number: 0 };
        }
    } catch (error) {
        console.error('Error searching posts:', error);
        throw error;
    }
};

/**
 * Get popular tags
 * @param {number} limit - Number of tags to return (default: 5)
 * @returns {Promise<Array>} List of popular tags with count
 */
export const getPopularTags = async (limit = 5) => {
    try {
        const response = await apiClient.get('/forum/popular-tags', { 
            params: { limit } 
        });

        if (response.status >= 200 && response.status < 300) {
            return Array.isArray(response.data) ? response.data : [];
        } else {
            console.error('API returned non-success status:', response.status);
            return [];
        }
    } catch (error) {
        console.error('Error fetching popular tags:', error);
        throw error;
    }
};

/**
 * Create a reply to a post
 * @param {number} postId - Post ID
 * @param {Object} replyData - Reply data
 * @param {string} replyData.content - Reply content (required, min 10 chars)
 * @param {number} replyData.parentId - Parent reply ID (optional, for nested replies)
 * @returns {Promise<Object>} Created reply
 */
export const createReply = async (postId, replyData) => {
    try {
        const response = await apiClient.post(`/forum/posts/${postId}/replies`, replyData);
        
        if (response.status >= 200 && response.status < 300) {
            return response.data;
        } else {
            // Throw error for non-success status codes
            const error = new Error('Failed to create reply');
            error.response = response;
            error.status = response.status;
            // Extract validation error message if available
            if (response.data) {
                // Handle ApiResponse format from GlobalExceptionHandler
                if (response.data.data && typeof response.data.data === 'object') {
                    // Extract validation errors from data object
                    const validationErrors = Object.values(response.data.data).join(', ');
                    error.message = validationErrors || response.data.message || 'Validation failed';
                } else if (response.data.message) {
                    error.message = response.data.message;
                } else if (response.data.errors && Array.isArray(response.data.errors)) {
                    // Handle validation errors from Spring Boot (alternative format)
                    const errorMessages = response.data.errors.map(err => err.defaultMessage || err.message).join(', ');
                    error.message = errorMessages || 'Validation failed';
                } else if (response.data.validationErrors) {
                    // Handle PostExceptionHandler format
                    const validationErrors = Object.values(response.data.validationErrors).join(', ');
                    error.message = validationErrors || 'Validation failed';
                }
            }
            throw error;
        }
    } catch (error) {
        console.error('Error creating reply:', error);
        throw error;
    }
};

// Export default object with all methods
const ForumService = {
    getAllPosts,
    getPosts,
    getPostById,
    createPost,
    updatePost,
    deletePost,
    votePost,
    voteReply,
    getPostVotes,
    getReplyVotes,
    getReplies,
    createReply,
    getCategories,
    searchPosts,
    getPopularTags,
};

export default ForumService;