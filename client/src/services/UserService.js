import apiClient from "./ApiClient";

/**
 * Get user profile by userId
 * @param {number} userId - User ID
 * @returns {Promise<Object>} User profile data
 */

export const getUserProfile = async (userId) => {
    try {
        const response = await apiClient.get(`/users/${userId}`);
        if (response.status >= 200 && response.status < 300) {
            if (response.data.success && response.data.data) {
                return response.data.data;
            }
            return response.data;
        } else {
            console.error('API returned non-success status:', response.status);
            return null;
        }
    } catch (error) {
        console.error('Error fetching user profile:', error);
        throw error;
    }
}

/**
 * Get user posts with pagination
 * @param {number} userId - User ID
 * @param {Object} options - Pagination options
 * @param {number} options.page - Page number (default: 0)
 * @param {number} options.size - Page size (default: 20)
 * @param {string} options.sort - Sort field and direction (default: "createdAt,desc")
 * @returns {Promise<Object>} Page object with posts
 */

export const getUserPosts = async (userId, options = {}) => {
    try {
        const { 
            page = 0, 
            size = 20, 
            sort = 'createdAt,desc'
        } = options;

        const params = { page, size, sort };
        const response = await apiClient.get(`/users/${userId}/posts`, { params });
        
        if (response.status >= 200 && response.status < 300) {
            // Backend trả về Page<UserPostDto> trực tiếp
            return response.data;
        } else {
            console.error('API returned non-success status:', response.status);
            return { content: [], totalElements: 0, totalPages: 0, number: 0 };
        }
    } catch (error) {
        console.error('Error fetching user posts:', error);
        throw error;
    }
};

// Export default object with all methods
const UserService = {
    getUserProfile,
    getUserPosts,
};

export default UserService;