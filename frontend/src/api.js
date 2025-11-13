// API utility for making requests
// Uses environment variable for API URL, falls back to relative path for local dev

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Debug logging
console.log('🔧 API Configuration:', {
  VITE_API_URL: import.meta.env.VITE_API_URL,
  API_BASE_URL: API_BASE_URL || '(empty - using relative paths)',
  NODE_ENV: import.meta.env.MODE
});

export const api = {
  get: async (endpoint) => {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Debug logging
    console.log('🌐 API Request:', {
      endpoint,
      fullUrl: url,
      apiBaseUrl: API_BASE_URL,
      timestamp: new Date().toISOString()
    });
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('📡 API Response:', {
        url,
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      if (!response.ok) {
        let errorData = {};
        try {
          errorData = await response.json();
        } catch (e) {
          console.error('❌ Failed to parse error response:', e);
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
        }
        
        const errorMessage = errorData.error || errorData.details || `Request failed: ${response.status} ${response.statusText}`;
        console.error('❌ API Error:', {
          url,
          status: response.status,
          statusText: response.statusText,
          errorData,
          errorMessage
        });
        
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      console.log('✅ API Success:', {
        url,
        dataLength: Array.isArray(data) ? data.length : 'object',
        timestamp: new Date().toISOString()
      });
      
      return data;
    } catch (err) {
      // Enhanced error logging for network issues
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        console.error('🚫 Network Error (Failed to fetch):', {
          url,
          error: err.message,
          name: err.name,
          possibleCauses: [
            'CORS issue - backend not allowing requests from this origin',
            'Backend server is down or not accessible',
            'Wrong API URL - check VITE_API_URL environment variable',
            'SSL/HTTPS mismatch',
            'Network connectivity issue'
          ],
          apiBaseUrl: API_BASE_URL,
          endpoint,
          fullUrl: url
        });
        
        throw new Error(`Network error: Cannot reach ${url}. Check if backend is running and CORS is configured. Original error: ${err.message}`);
      }
      
      console.error('❌ API Request Failed:', {
        url,
        error: err.message,
        name: err.name,
        stack: err.stack
      });
      
      throw err;
    }
  }
};

