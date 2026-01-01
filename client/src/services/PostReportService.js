import apiClient from './ApiClient';

/**
 * Báo cáo một bài viết
 * @param {number} postId - ID của bài viết cần báo cáo
 * @param {Object} reportData - Dữ liệu báo cáo
 * @param {string} reportData.reason - Lý do báo cáo (required, max 100 ký tự)
 * @param {string} reportData.description - Mô tả chi tiết (optional, max 500 ký tự)
 * @returns {Promise<Object>} PostReportDto
 */
export const reportPost = async (postId, reportData) => {
    try {
        const reason = (reportData?.reason || '').toString().trim();
        const descriptionRaw = reportData?.description;
        const description =
            descriptionRaw === undefined || descriptionRaw === null
                ? null
                : descriptionRaw.toString().trim();

        const response = await apiClient.post(`/posts/${postId}/reports`, {
            reason,
            description,
        });
        
        if (response.status >= 200 && response.status < 300) {
            // Backend trả về ApiResponse<PostReportDto>
            if (response.data.success && response.data.data) {
                return response.data.data;
            }
            return response.data;
        } else {
            console.error('API returned non-success status:', response.status);
            const error = new Error('Failed to report post');
            error.response = response;
            // Prefer backend validation errors when available
            if (response.data) {
                if (response.data.data && typeof response.data.data === 'object') {
                    const validationErrors = Object.values(response.data.data)
                        .filter(Boolean)
                        .join('\n');
                    error.message = validationErrors || response.data.message || error.message;
                } else if (response.data.message) {
                    error.message = response.data.message;
                }
            }
            throw error;
        }
    } catch (error) {
        console.error('Error reporting post:', error);
        throw error;
    }
};

/**
 * Kiểm tra người dùng đã báo cáo bài viết chưa
 * @param {number} postId - ID của bài viết
 * @returns {Promise<boolean>} True nếu đã báo cáo, false nếu chưa
 */
export const checkUserReported = async (postId) => {
    try {
        const response = await apiClient.get(`/posts/${postId}/reports/check`);
        
        if (response.status >= 200 && response.status < 300) {
            // Backend trả về ApiResponse<Boolean>
            if (response.data.success !== undefined) {
                return response.data.data || false;
            }
            return response.data || false;
        } else {
            console.error('API returned non-success status:', response.status);
            return false;
        }
    } catch (error) {
        console.error('Error checking user reported status:', error);
        return false;
    }
};

/**
 * Lấy danh sách báo cáo của người dùng hiện tại
 * @returns {Promise<Array>} Danh sách PostReportDto
 */
export const getUserReports = async () => {
    try {
        const response = await apiClient.get('/user/reports');
        
        if (response.status >= 200 && response.status < 300) {
            // Backend trả về ApiResponse<List<PostReportDto>>
            if (response.data.success && response.data.data) {
                return response.data.data;
            }
            return response.data || [];
        } else {
            console.error('API returned non-success status:', response.status);
            return [];
        }
    } catch (error) {
        console.error('Error fetching user reports:', error);
        throw error;
    }
};

// Export default object with all methods
const PostReportService = {
    reportPost,
    checkUserReported,
    getUserReports,
};

export default PostReportService;

