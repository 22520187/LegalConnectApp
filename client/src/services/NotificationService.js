import apiClient from './ApiClient';

/**
 * Lấy danh sách notifications của user hiện tại
 * @param {boolean|null} unreadOnly - Chỉ lấy notifications chưa đọc (optional)
 * @param {number} page - Số trang (default: 0)
 * @param {number} size - Số lượng items mỗi trang (default: 20)
 * @returns {Promise<Object>} Page object với notifications (content, totalElements, totalPages, etc.)
 */
export const getNotifications = async (unreadOnly = null, page = 0, size = 20) => {
    try {
        const params = { page, size };
        if (unreadOnly !== null) {
            params.unreadOnly = unreadOnly;
        }

        const response = await apiClient.get('/notifications', { params });
        
        if (response.status >= 200 && response.status < 300) {
            return response.data; // Page<NotificationDto>
        } else {
            console.error('API returned non-success status:', response.status);
            return { content: [], totalElements: 0, totalPages: 0, number: 0 };
        }
    } catch (error) {
        console.error('Error fetching notifications:', error);
        throw error;
    }
};

/**
 * Đánh dấu một notification là đã đọc
 * @param {number} notificationId - ID của notification
 * @returns {Promise<Object>} Notification đã được cập nhật
 */
export const markAsRead = async (notificationId) => {
    try {
        const response = await apiClient.put(`/notifications/${notificationId}/read`);
        
        if (response.status >= 200 && response.status < 300) {
            return response.data;
        } else {
            console.error('API returned non-success status:', response.status);
            return null;
        }
    } catch (error) {
        console.error('Error marking notification as read:', error);
        throw error;
    }
};

/**
 * Đánh dấu tất cả notifications là đã đọc
 * @returns {Promise<boolean>} True nếu thành công
 */
export const markAllAsRead = async () => {
    try {
        const response = await apiClient.put('/notifications/read-all');
        
        if (response.status >= 200 && response.status < 300) {
            return true;
        } else {
            console.error('API returned non-success status:', response.status);
            return false;
        }
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        throw error;
    }
};

/**
 * Lấy số lượng notifications chưa đọc
 * @returns {Promise<number>} Số lượng notifications chưa đọc
 */
export const getUnreadCount = async () => {
    try {
        const response = await apiClient.get('/notifications/unread-count');
        
        if (response.status >= 200 && response.status < 300) {
            return response.data || 0;
        } else {
            console.error('API returned non-success status:', response.status);
            return 0;
        }
    } catch (error) {
        console.error('Error fetching unread count:', error);
        return 0;
    }
};

// Export default object with all methods
const NotificationService = {
    getNotifications,
    markAsRead,
    markAllAsRead,
    getUnreadCount,
};

export default NotificationService;

