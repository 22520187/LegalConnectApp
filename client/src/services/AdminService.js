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

/**
 * Lấy thống kê dashboard cho admin
 * @returns {Promise<Object>} AdminDashboardStatsDto
 */
export const getDashboardStats = async () => {
    try {
        const response = await apiClient.get('/admin/dashboard/stats');

        if (response.status >= 200 && response.status < 300) {
            // Backend trả về ApiResponse<AdminDashboardStatsDto>
            if (response.data.success && response.data.data) {
                return response.data.data;
            }
            return response.data;
        } else {
            console.error('API returned non-success status:', response.status);
            throw new Error('Failed to fetch dashboard statistics');
        }
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        throw error;
    }
};

/**
 * Lấy danh sách tất cả categories cho admin quản lý
 * @param {Object} options - Query options
 * @param {number} options.page - Số trang (default: 0)
 * @param {number} options.size - Số lượng items mỗi trang (default: 10)
 * @param {string} options.sortBy - Trường sắp xếp (default: "displayOrder")
 * @param {string} options.sortDir - Hướng sắp xếp "asc" hoặc "desc" (default: "asc")
 * @param {string|null} options.search - Tìm kiếm theo từ khóa (optional)
 * @returns {Promise<Object>} Page object với PostCategoryDto (content, totalElements, totalPages, etc.)
 */
export const getAllCategories = async (options = {}) => {
    try {
        const {
            page = 0,
            size = 10,
            sortBy = 'displayOrder',
            sortDir = 'asc',
            search = null
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

        const response = await apiClient.get('/admin/categories', { params });

        if (response.status >= 200 && response.status < 300) {
            // Backend trả về ApiResponse<Page<PostCategoryDto>>
            if (response.data.success && response.data.data) {
                return response.data.data;
            }
            return response.data || { content: [], totalElements: 0, totalPages: 0, number: 0 };
        } else {
            console.error('API returned non-success status:', response.status);
            return { content: [], totalElements: 0, totalPages: 0, number: 0 };
        }
    } catch (error) {
        console.error('Error fetching categories:', error);
        throw error;
    }
};

/**
 * Tạo category mới
 * @param {Object} categoryData - Dữ liệu category
 * @param {string} categoryData.name - Tên category (required)
 * @param {string} categoryData.slug - Slug category (required)
 * @param {string|null} categoryData.description - Mô tả (optional)
 * @param {string|null} categoryData.icon - Icon (optional)
 * @param {number|null} categoryData.displayOrder - Thứ tự hiển thị (optional)
 * @param {boolean|null} categoryData.isActive - Trạng thái active (optional, default: true)
 * @returns {Promise<Object>} PostCategoryDto
 */
export const createCategory = async (categoryData) => {
    try {
        const response = await apiClient.post('/admin/categories', categoryData);

        if (response.status >= 200 && response.status < 300) {
            // Backend trả về ApiResponse<PostCategoryDto>
            if (response.data.success && response.data.data) {
                return response.data.data;
            }
            return response.data;
        } else {
            console.error('API returned non-success status:', response.status);
            const error = new Error('Failed to create category');
            error.response = response;
            if (response.data && response.data.message) {
                error.message = response.data.message;
            }
            throw error;
        }
    } catch (error) {
        console.error('Error creating category:', error);
        throw error;
    }
};

/**
 * Cập nhật category
 * @param {number} categoryId - ID của category
 * @param {Object} categoryData - Dữ liệu category cần cập nhật
 * @param {string} categoryData.name - Tên category (required)
 * @param {string} categoryData.slug - Slug category (required)
 * @param {string|null} categoryData.description - Mô tả (optional)
 * @param {string|null} categoryData.icon - Icon (optional)
 * @param {number|null} categoryData.displayOrder - Thứ tự hiển thị (optional)
 * @param {boolean|null} categoryData.isActive - Trạng thái active (optional)
 * @returns {Promise<Object>} PostCategoryDto
 */
export const updateCategory = async (categoryId, categoryData) => {
    try {
        const response = await apiClient.put(`/admin/categories/${categoryId}`, categoryData);

        if (response.status >= 200 && response.status < 300) {
            // Backend trả về ApiResponse<PostCategoryDto>
            if (response.data.success && response.data.data) {
                return response.data.data;
            }
            return response.data;
        } else {
            console.error('API returned non-success status:', response.status);
            const error = new Error('Failed to update category');
            error.response = response;
            if (response.data && response.data.message) {
                error.message = response.data.message;
            }
            throw error;
        }
    } catch (error) {
        console.error('Error updating category:', error);
        throw error;
    }
};

/**
 * Cập nhật trạng thái active/inactive của category
 * @param {number} categoryId - ID của category
 * @param {boolean} isActive - Trạng thái active (true = active, false = inactive)
 * @returns {Promise<Object>} Response từ API
 */
export const updateCategoryStatus = async (categoryId, isActive) => {
    try {
        const response = await apiClient.put(`/admin/categories/${categoryId}/status`, null, {
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
            const error = new Error('Failed to update category status');
            error.response = response;
            if (response.data && response.data.message) {
                error.message = response.data.message;
            }
            throw error;
        }
    } catch (error) {
        console.error('Error updating category status:', error);
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
    getDashboardStats,
    getAllCategories,
    createCategory,
    updateCategory,
    updateCategoryStatus,
};

export default AdminService;

