import apiClient from './ApiClient';

/**
 * Lấy danh sách bài viết vi phạm (bị báo cáo) cho admin
 * @param {Object} options - Query options
 * @param {number} options.page - Số trang (default: 0)
 * @param {number} options.size - Số lượng items mỗi trang (default: 10)
 * @param {string} options.sortBy - Trường sắp xếp (default: "createdAt")
 * @param {string} options.sortDir - Hướng sắp xếp "asc" hoặc "desc" (default: "desc")
 * @param {string|null} options.search - Tìm kiếm theo từ khóa (optional)
 * @param {boolean|null} options.isActive - Lọc theo trạng thái active (optional)
 * @returns {Promise<Object>} Page object với PostModerationDto (content, totalElements, totalPages, etc.)
 */
export const getViolationPosts = async (options = {}) => {
    try {
        const {
            page = 0,
            size = 10,
            sortBy = 'createdAt',
            sortDir = 'desc',
            search = null,
            isActive = null
        } = options;

        const params = {
            page,
            size,
            sortBy,
            sortDir
        };

        if (search !== null && search.trim() !== '') {
            params.search = search.trim();
        }

        if (isActive !== null) {
            params.isActive = isActive;
        }

        const response = await apiClient.get('/admin/violations', { params });

        if (response.status >= 200 && response.status < 300) {
            // Backend trả về ApiResponse<Page<PostModerationDto>>
            if (response.data.success && response.data.data) {
                return response.data.data;
            }
            return response.data || { content: [], totalElements: 0, totalPages: 0, number: 0 };
        } else {
            console.error('API returned non-success status:', response.status);
            return { content: [], totalElements: 0, totalPages: 0, number: 0 };
        }
    } catch (error) {
        console.error('Error fetching violation posts:', error);
        throw error;
    }
};

/**
 * Lấy chi tiết bài viết cho admin review
 * @param {number} postId - ID của bài viết
 * @returns {Promise<Object>} PostModerationDto
 */
export const getPostDetails = async (postId) => {
    try {
        const response = await apiClient.get(`/admin/posts/${postId}`);

        if (response.status >= 200 && response.status < 300) {
            // Backend trả về ApiResponse<PostModerationDto>
            if (response.data.success && response.data.data) {
                return response.data.data;
            }
            return response.data;
        } else {
            console.error('API returned non-success status:', response.status);
            return null;
        }
    } catch (error) {
        console.error('Error fetching post details:', error);
        throw error;
    }
};

/**
 * Cập nhật trạng thái active/inactive của bài viết
 * @param {number} postId - ID của bài viết
 * @param {boolean} isActive - Trạng thái active (true = active, false = inactive/banned)
 * @returns {Promise<Object>} Response từ API
 */
export const updatePostStatus = async (postId, isActive) => {
    try {
        const response = await apiClient.put(`/admin/posts/${postId}/status`, null, {
            params: { isActive }
        });

        if (response.status >= 200 && response.status < 300) {
            // Backend trả về ApiResponse<String>
            if (response.data.success) {
                return response.data;
            }
            return response.data;
        } else {
            console.error('API returned non-success status:', response.status);
            const error = new Error('Failed to update post status');
            error.response = response;
            if (response.data && response.data.message) {
                error.message = response.data.message;
            }
            throw error;
        }
    } catch (error) {
        console.error('Error updating post status:', error);
        throw error;
    }
};

// Export default object with all methods
const AdminService = {
    getViolationPosts,
    getPostDetails,
    updatePostStatus,
};

export default AdminService;

