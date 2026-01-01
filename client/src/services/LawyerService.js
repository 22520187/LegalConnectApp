import apiClient from "./ApiClient";

/**
 * Upload documents for lawyer application
 * @param {Array<Object>} files - Array of file objects from DocumentPicker
 * @returns {Promise<Array<string>>} Array of uploaded document URLs
 */
export const uploadDocuments = async (files) => {
    try {
        if (!files || files.length === 0) {
            throw new Error('No files provided');
        }

        const formData = new FormData();
        files.forEach((file, index) => {
            formData.append('files', {
                uri: file.uri,
                type: file.mimeType || 'application/pdf',
                name: file.name || `document_${index}.pdf`,
            });
        });

        const response = await apiClient.post('/upload/documents', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        if (response.status >= 200 && response.status < 300) {
            if (response.data.success && response.data.data) {
                return response.data.data;
            }
            throw new Error(response.data.message || 'Failed to upload documents');
        } else {
            console.error('API returned non-success status:', response.status);
            throw new Error('Failed to upload documents');
        }
    } catch (error) {
        console.error('Error uploading documents:', error);
        throw error;
    }
};

/**
 * Submit lawyer application
 * @param {Object} applicationData - Lawyer application data
 * @param {string} applicationData.licenseNumber - License number (required)
 * @param {string} applicationData.lawSchool - Law school name (required)
 * @param {number} applicationData.graduationYear - Graduation year (required)
 * @param {Array<string>} applicationData.specializations - Specializations list (required)
 * @param {number} applicationData.yearsOfExperience - Years of experience (required)
 * @param {string} applicationData.currentFirm - Current firm name (optional)
 * @param {string} applicationData.bio - Bio (required)
 * @param {string} applicationData.phoneNumber - Phone number (optional, 10-11 digits)
 * @param {string} applicationData.officeAddress - Office address (optional)
 * @param {Array<string>} applicationData.documentUrls - Document URLs (required)
 * @returns {Promise<Object>} Submitted application data
 */
export const submitLawyerApplication = async (applicationData) => {
    try {
        const response = await apiClient.post('/lawyer/apply', applicationData);
        
        if (response.status >= 200 && response.status < 300) {
            if (response.data.success && response.data.data) {
                return response.data.data;
            }
            throw new Error(response.data.message || 'Failed to submit application');
        } else {
            console.error('API returned non-success status:', response.status);
            const errorMessage = response.data?.message || 'Failed to submit application';
            throw new Error(errorMessage);
        }
    } catch (error) {
        console.error('Error submitting lawyer application:', error);
        // Extract error message from response
        if (error.response?.data?.message) {
            throw new Error(error.response.data.message);
        }
        throw error;
    }
};

/**
 * Get current user's lawyer application
 * @returns {Promise<Object|null>} Application data or null if not found
 */
export const getUserApplication = async () => {
    try {
        const response = await apiClient.get('/lawyer/application');
        
        if (response.status >= 200 && response.status < 300) {
            if (response.data.success && response.data.data) {
                return response.data.data;
            }
            return null;
        } else {
            console.error('API returned non-success status:', response.status);
            return null;
        }
    } catch (error) {
        console.error('Error fetching user application:', error);
        return null;
    }
};

/**
 * Check if current user can apply to become a lawyer
 * @returns {Promise<boolean>} True if user can apply
 */
export const canUserApply = async () => {
    try {
        const response = await apiClient.get('/lawyer/can-apply');
        
        if (response.status >= 200 && response.status < 300) {
            if (response.data.success && response.data.data !== undefined) {
                return response.data.data;
            }
            return false;
        } else {
            console.error('API returned non-success status:', response.status);
            return false;
        }
    } catch (error) {
        console.error('Error checking if user can apply:', error);
        return false;
    }
};

/**
 * Check if current user has already applied
 * @returns {Promise<boolean>} True if user has applied
 */
export const hasUserApplied = async () => {
    try {
        const response = await apiClient.get('/lawyer/has-applied');
        
        if (response.status >= 200 && response.status < 300) {
            if (response.data.success && response.data.data !== undefined) {
                return response.data.data;
            }
            return false;
        } else {
            console.error('API returned non-success status:', response.status);
            return false;
        }
    } catch (error) {
        console.error('Error checking if user has applied:', error);
        return false;
    }
};

/**
 * Get detailed application information
 * @returns {Promise<Object|null>} Detailed application data or null if not found
 */
export const getApplicationDetails = async () => {
    try {
        const response = await apiClient.get('/lawyer/application');
        
        if (response.status >= 200 && response.status < 300) {
            if (response.data.success && response.data.data) {
                return response.data.data;
            }
            return null;
        } else {
            console.error('API returned non-success status:', response.status);
            return null;
        }
    } catch (error) {
        console.error('Error fetching application details:', error);
        if (error.response?.data?.message) {
            throw new Error(error.response.data.message);
        }
        throw error;
    }
};

/**
 * Update application documents
 * @param {number} applicationId - Application ID
 * @param {Array<string>} documentUrls - Array of document URLs
 * @returns {Promise<Object>} Updated application data
 */
export const updateApplicationDocuments = async (applicationId, documentUrls) => {
    try {
        const response = await apiClient.put(`/lawyer/application/${applicationId}/documents`, {
            documentUrls: documentUrls
        });
        
        if (response.status >= 200 && response.status < 300) {
            if (response.data.success && response.data.data) {
                return response.data.data;
            }
            throw new Error(response.data.message || 'Failed to update documents');
        } else {
            console.error('API returned non-success status:', response.status);
            const errorMessage = response.data?.message || 'Failed to update documents';
            throw new Error(errorMessage);
        }
    } catch (error) {
        console.error('Error updating application documents:', error);
        // Extract error message from response
        if (error.response?.data?.message) {
            throw new Error(error.response.data.message);
        }
        throw error;
    }
};

// Export default object with all methods
const LawyerService = {
    uploadDocuments,
    submitLawyerApplication,
    getUserApplication,
    canUserApply,
    hasUserApplied,
    getApplicationDetails,
    updateApplicationDocuments,
};

export default LawyerService;

