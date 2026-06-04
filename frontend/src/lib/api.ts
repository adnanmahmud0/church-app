import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const token = Cookies.get('token');
  const headers = new Headers(options.headers || {});
  
  if (token) {
    headers.set('Authorization', token.startsWith('Bearer') ? token : `Bearer ${token}`);
  }
  
  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  let response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle 401 Unauthorized for token refresh
  if (response.status === 401 && endpoint !== '/auth/login' && endpoint !== '/auth/refresh') {
    const refreshToken = Cookies.get('refreshToken');
    if (refreshToken) {
      try {
        const refreshResponse = await fetch(`${API_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken })
        });
        
        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          const newToken = refreshData.data.accessToken;
          const newRefreshToken = refreshData.data.refreshToken;
          
          Cookies.set('token', newToken, { expires: 7 });
          if (newRefreshToken) {
            Cookies.set('refreshToken', newRefreshToken, { expires: 7 });
          }

          // Retry the original request
          headers.set('Authorization', `Bearer ${newToken}`);
          response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers,
          });
        } else {
          // Refresh failed, logout
          Cookies.remove('token');
          Cookies.remove('refreshToken');
        }
      } catch (err) {
        // Ignore or handle refresh network error
      }
    }
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || 'API request failed');
  }

  return data;
};
