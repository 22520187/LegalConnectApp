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
 * Lấy danh sách tất cả bài viết cho admin quản lý
 * @param {Object} options - Query options
 * @param {number} options.page - Số trang (default: 0)
 * @param {number} options.size - Số lượng items mỗi trang (default: 10)
 * @param {string} options.sortBy - Trường sắp xếp (default: "createdAt")
 * @param {string} options.sortDir - Hướng sắp xếp "asc" hoặc "desc" (default: "desc")
 * @param {string|null} options.search - Tìm kiếm theo từ khóa (optional)
 * @param {boolean|null} options.isActive - Lọc theo trạng thái active (optional)
 * @returns {Promise<Object>} Page object với PostModerationDto (content, totalElements, totalPages, etc.)
 */
export const getAllPosts = async (options = {}) => {
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

        const response = await apiClient.get('/admin/posts', { params });

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
        console.error('Error fetching posts:', error);
        throw error;
    }
};

/**
 * Cập nhật trạng thái hot của bài viết
 * @param {number} postId - ID của bài viết
 * @param {boolean} isHot - Trạng thái hot (true = hot, false = not hot)
 * @returns {Promise<Object>} Response từ API
 */
export const updatePostHotStatus = async (postId, isHot) => {
    try {
        const response = await apiClient.put(`/admin/posts/${postId}/hot`, null, {
            params: { isHot }
        });

        if (response.status >= 200 && response.status < 300) {
            // Backend trả về ApiResponse<String>
            if (response.data.success) {
                return response.data;
            }
            return response.data;
        } else {
            console.error('API returned non-success status:', response.status);
            const error = new Error('Failed to update post hot status');
            error.response = response;
            if (response.data && response.data.message) {
                error.message = response.data.message;
            }
            throw error;
        }
    } catch (error) {
        console.error('Error updating post hot status:', error);
        throw error;
    }
};

/**
 * Cập nhật trạng thái pin của bài viết
 * @param {number} postId - ID của bài viết
 * @param {boolean} isPinned - Trạng thái pin (true = pinned, false = unpinned)
 * @returns {Promise<Object>} Response từ API
 */
export const updatePostPinStatus = async (postId, isPinned) => {
    try {
        const response = await apiClient.put(`/admin/posts/${postId}/pin`, null, {
            params: { isPinned }
        });

        if (response.status >= 200 && response.status < 300) {
            // Backend trả về ApiResponse<String>
            if (response.data.success) {
                return response.data;
            }
            return response.data;
        } else {
            console.error('API returned non-success status:', response.status);
            const error = new Error('Failed to update post pin status');
            error.response = response;
            if (response.data && response.data.message) {
                error.message = response.data.message;
            }
            throw error;
        }
    } catch (error) {
        console.error('Error updating post pin status:', error);
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

/**
 * Lấy danh sách tất cả người dùng cho admin quản lý
 * @param {Object} options - Query options
 * @param {number} options.page - Số trang (default: 0)
 * @param {number} options.size - Số lượng items mỗi trang (default: 10)
 * @param {string} options.sortBy - Trường sắp xếp (default: "createdAt")
 * @param {string} options.sortDir - Hướng sắp xếp "asc" hoặc "desc" (default: "desc")
 * @param {string|null} options.search - Tìm kiếm theo từ khóa (optional)
 * @param {string|null} options.role - Lọc theo role (optional)
 * @returns {Promise<Object>} Page object với UserManagementDto (content, totalElements, totalPages, etc.)
 */
export const getAllUsers = async (options = {}) => {
    try {
        const {
            page = 0,
            size = 10,
            sortBy = 'createdAt',
            sortDir = 'desc',
            search = null,
            role = null
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

        if (role !== null && role.trim() !== '') {
            params.role = role.trim();
        }

        const response = await apiClient.get('/admin/users', { params });

        if (response.status >= 200 && response.status < 300) {
            // Backend trả về ApiResponse<Page<UserManagementDto>>
            if (response.data.success && response.data.data) {
                return response.data.data;
            }
            return response.data || { content: [], totalElements: 0, totalPages: 0, number: 0 };
        } else {
            console.error('API returned non-success status:', response.status);
            return { content: [], totalElements: 0, totalPages: 0, number: 0 };
        }
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
};

/**
 * Cập nhật trạng thái enabled/disabled của người dùng
 * @param {number} userId - ID của người dùng
 * @param {boolean} isEnabled - Trạng thái enabled (true = enabled, false = disabled)
 * @returns {Promise<Object>} Response từ API
 */
export const updateUserStatus = async (userId, isEnabled) => {
    try {
        const response = await apiClient.put(`/admin/users/${userId}/status`, null, {
            params: { isEnabled }
        });

        if (response.status >= 200 && response.status < 300) {
            // Backend trả về ApiResponse<String>
            if (response.data.success) {
                return response.data;
            }
            return response.data;
        } else {
            console.error('API returned non-success status:', response.status);
            const error = new Error('Failed to update user status');
            error.response = response;
            if (response.data && response.data.message) {
                error.message = response.data.message;
            }
            throw error;
        }
    } catch (error) {
        console.error('Error updating user status:', error);
        throw error;
    }
};

/**
 * Lấy danh sách đơn xin trở thành luật sư cho admin
 * @param {Object} options - Query options
 * @param {number} options.page - Số trang (default: 0)
 * @param {number} options.size - Số lượng items mỗi trang (default: 10)
 * @param {string} options.sortBy - Trường sắp xếp (default: "createdAt")
 * @param {string} options.sortDir - Hướng sắp xếp "asc" hoặc "desc" (default: "desc")
 * @param {string|null} options.status - Lọc theo trạng thái: "PENDING", "APPROVED", "REJECTED" (optional)
 * @param {string|null} options.search - Tìm kiếm theo từ khóa (optional)
 * @returns {Promise<Object>} Page object với LawyerApplicationDto (content, totalElements, totalPages, etc.)
 */
export const getLawyerApplications = async (options = {}) => {
    try {
        const {
            page = 0,
            size = 10,
            sortBy = 'createdAt',
            sortDir = 'desc',
            status = null,
            search = null
        } = options;

        const params = {
            page,
            size,
            sortBy,
            sortDir
        };

        if (status !== null && status.trim() !== '') {
            params.status = status.trim();
        }

        if (search !== null && search.trim() !== '') {
            params.search = search.trim();
        }

        const response = await apiClient.get('/admin/lawyer-applications', { params });

        if (response.status >= 200 && response.status < 300) {
            // Backend trả về ApiResponse<Page<LawyerApplicationDto>>
            if (response.data.success && response.data.data) {
                return response.data.data;
            }
            return response.data || { content: [], totalElements: 0, totalPages: 0, number: 0 };
        } else {
            console.error('API returned non-success status:', response.status);
            return { content: [], totalElements: 0, totalPages: 0, number: 0 };
        }
    } catch (error) {
        console.error('Error fetching lawyer applications:', error);
        throw error;
    }
};

/**
 * Phê duyệt đơn xin trở thành luật sư
 * @param {number} applicationId - ID của đơn xin
 * @param {string|null} adminNotes - Ghi chú của admin (optional)
 * @returns {Promise<Object>} Response từ API
 */
export const approveLawyerApplication = async (applicationId, adminNotes = null) => {
    try {
        const params = {};
        if (adminNotes !== null && adminNotes.trim() !== '') {
            params.adminNotes = adminNotes.trim();
        }

        const response = await apiClient.put(`/admin/lawyer-applications/${applicationId}/approve`, null, {
            params
        });

        if (response.status >= 200 && response.status < 300) {
            // Backend trả về ApiResponse<String>
            if (response.data.success) {
                return response.data;
            }
            return response.data;
        } else {
            console.error('API returned non-success status:', response.status);
            const error = new Error('Failed to approve lawyer application');
            error.response = response;
            if (response.data && response.data.message) {
                error.message = response.data.message;
            }
            throw error;
        }
    } catch (error) {
        console.error('Error approving lawyer application:', error);
        throw error;
    }
};

/**
 * Từ chối đơn xin trở thành luật sư
 * @param {number} applicationId - ID của đơn xin
 * @param {string|null} adminNotes - Ghi chú của admin (optional)
 * @returns {Promise<Object>} Response từ API
 */
export const rejectLawyerApplication = async (applicationId, adminNotes = null) => {
    try {
        const params = {};
        if (adminNotes !== null && adminNotes.trim() !== '') {
            params.adminNotes = adminNotes.trim();
        }

        const response = await apiClient.put(`/admin/lawyer-applications/${applicationId}/reject`, null, {
            params
        });

        if (response.status >= 200 && response.status < 300) {
            // Backend trả về ApiResponse<String>
            if (response.data.success) {
                return response.data;
            }
            return response.data;
        } else {
            console.error('API returned non-success status:', response.status);
            const error = new Error('Failed to reject lawyer application');
            error.response = response;
            if (response.data && response.data.message) {
                error.message = response.data.message;
            }
            throw error;
        }
    } catch (error) {
        console.error('Error rejecting lawyer application:', error);
        throw error;
    }
};

// Export default object with all methods
const AdminService = {
    getViolationPosts,
    getPostDetails,
    updatePostStatus,
    getAllUsers,
    updateUserStatus,
    getLawyerApplications,
    approveLawyerApplication,
    rejectLawyerApplication,
    getAllPosts,
    updatePostHotStatus,
    updatePostPinStatus,
};

export default AdminService;

