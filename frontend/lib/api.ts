const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://warm-lead-sourcer-zvoa.onrender.com';
console.log('API_BASE_URL:', API_BASE_URL, 'ENV:', process.env.NEXT_PUBLIC_API_URL);

class ApiClient {
  private getAuthHeaders(): Record<string, string> {
    // HTTP-only cookies are handled by credentials: 'include'
    // No need to manually add Authorization header
    return {};
  }

  async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
          ...(options.headers || {}),
        } as HeadersInit,
      });

      if (response.status === 401) {
        // Try to refresh token
        try {
          await fetch(`${API_BASE_URL}/users/refresh`, {
            method: 'POST',
            credentials: 'include',
          });
          
          // Retry original request
          const retryResponse = await fetch(url, {
            ...options,
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              ...this.getAuthHeaders(),
              ...(options.headers || {}),
            } as HeadersInit,
          });
          
          if (retryResponse.ok) {
            return retryResponse.json();
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
        }
        
        // If refresh fails, redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        throw new Error('Session expired. Please login again.');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || `API Error: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async get(endpoint: string) {
    return this.request(endpoint);
  }

  async post(endpoint: string, data: Record<string, unknown>) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const api = new ApiClient();

export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats'),
  getRecentActivity: () => api.get('/dashboard/recent-activity'),
};

export const leadsApi = {
  getByPost: (postId: string, filters?: Record<string, string>) => {
    const params = new URLSearchParams(filters).toString();
    return api.get(`/leads/post/${postId}${params ? `?${params}` : ''}`);
  },
  getStats: (postId: string) => api.get(`/leads/post/${postId}/stats`),
};

export const forgotPassword = (data: { email: string }) => api.post('/users/forgot-password', data);
export const resetPassword = (data: { token: string, newPassword: string }) => api.post('/users/reset-password', data);