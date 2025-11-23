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
            console.error('API returned non-success status:', response.status);
            return null;
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
 * @param {number} voteType - Vote type (1 for upvote, -1 for downvote)
 * @returns {Promise<Object>} Updated post
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
 * Get replies for a post
 * @param {number} postId - Post ID
 * @param {number} page - Page number
 * @param {number} size - Page size
 * @returns {Promise<Object>} Page object with replies
 */
export const getReplies = async (postId, page = 0, size = 10) => {
    try {
        const params = { page, size };
        const response = await apiClient.get(`/forum/posts/${postId}/replies`, { params });
        
        if (response.status >= 200 && response.status < 300) {
            return response.data;
        } else {
            console.error('API returned non-success status:', response.status);
            return { content: [], totalElements: 0, totalPages: 0, number: 0 };
        }
    } catch (error) {
        console.error('Error fetching replies:', error);
        throw error;
    }
};

/**
 * Create a reply to a post
 * @param {number} postId - Post ID
 * @param {Object} replyData - Reply data
 * @param {string} replyData.content - Reply content
 * @returns {Promise<Object>} Created reply
 */
export const createReply = async (postId, replyData) => {
    try {
        const response = await apiClient.post(`/forum/posts/${postId}/replies`, replyData);
        
        if (response.status >= 200 && response.status < 300) {
            return response.data;
        } else {
            console.error('API returned non-success status:', response.status);
            return null;
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
    getReplies,
    createReply,
    getCategories,
};

export default ForumService;