import apiClient from "./ApiClient";

export const getUserConversations = async (userId) => {
    try {
        const response = await apiClient.get(`/api/conversations/${userId}`);
        if (response.status >= 200 && response.status < 300) {
            return response.data;
        } else {
            console.error('API returned non-success status:', response.status);
            return null;
        }
    } catch (error) {
        console.error('Error fetching user conversations:', error);
        throw error;
    }
}