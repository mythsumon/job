// Enhanced JWT authentication utilities
export class AuthManager {
  private static readonly TOKEN_KEY = 'auth_token';
  private static readonly USER_KEY = 'user_data';

  // Get stored token
  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // Store token securely
  static setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  // Remove token and user data
  static clearAuth(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    localStorage.removeItem('token');
    console.log('[AUTH] All auth data cleared');
  }

  // Check if token exists and is not expired
  static isTokenValid(): boolean {
    // MOCK MODE: Always return true if token exists
    const MOCK_MODE = true;
    const token = this.getToken();
    
    if (MOCK_MODE) {
      return !!token; // In mock mode, any token is valid
    }
    
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp > currentTime;
    } catch (error) {
      console.error('[AUTH] Invalid token format:', error);
      return false;
    }
  }

  // Get user data from token
  static getUserFromToken(): any | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        userId: payload.userId,
        username: payload.username,
        email: payload.email,
        userType: payload.userType
      };
    } catch (error) {
      console.error('[AUTH] Failed to decode token:', error);
      return null;
    }
  }

  // Enhanced API request with automatic token handling
  static async authenticatedRequest(url: string, options: RequestInit = {}): Promise<Response> {
    // MOCK MODE: Return mock data
    const MOCK_MODE = true;
    
    if (MOCK_MODE) {
      console.log('[MOCK AUTH] authenticatedRequest:', url);
      const { getMockData, mockDelay } = await import('@/lib/mockData');
      await mockDelay(100);
      
      const mockData = getMockData(url);
      return {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => mockData,
        text: async () => JSON.stringify(mockData),
      } as Response;
    }

    const token = this.getToken();
    
    if (!token || !this.isTokenValid()) {
      this.clearAuth();
      throw new Error('401: Authentication required');
    }

    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    };

    const response = await fetch(url, config);

    // Handle authentication errors
    if (response.status === 401 || response.status === 403) {
      console.log('[AUTH] Token expired or invalid, clearing auth');
      this.clearAuth();
      throw new Error(`${response.status}: ${response.statusText}`);
    }

    return response;
  }

  // Login with credentials
  static async login(credentials: { username?: string; email?: string; password: string }): Promise<{ token: string; user: any }> {
    // MOCK MODE: Return mock data
    const MOCK_MODE = true;
    
    if (MOCK_MODE) {
      console.log('[MOCK AUTH] Login:', credentials.email || credentials.username);
      const { mockUsers, mockDelay } = await import('@/lib/mockData');
      await mockDelay(300);
      
      // Find user by email
      const email = credentials.email || credentials.username;
      const user = mockUsers.find(u => u.email === email) || mockUsers[0];
      
      const mockData = {
        token: "mock-token-123",
        user: user,
        message: "Success",
      };
      
      this.setToken(mockData.token);
      localStorage.setItem(this.USER_KEY, JSON.stringify(mockData.user));
      
      console.log('[MOCK AUTH] Login successful for:', user.userType);
      return mockData;
    }

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    const data = await response.json();
    
    // Store token and user data
    this.setToken(data.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(data.user));
    
    console.log('[AUTH] Login successful for user:', data.user.username);
    return data;
  }

  // Register new user
  static async register(userData: {
    username: string;
    email: string;
    password: string;
    fullName: string;
    userType: 'candidate' | 'employer';
  }): Promise<{ token: string; user: any }> {
    // MOCK MODE: Return mock data
    const MOCK_MODE = true;
    
    if (MOCK_MODE) {
      console.log('[MOCK AUTH] Register:', userData.email);
      const { getMockData, mockDelay } = await import('@/lib/mockData');
      await mockDelay(300);
      
      const mockData = getMockData('/api/auth/register');
      // Update mock user with registration data
      const mockUser = {
        ...mockData.user,
        email: userData.email,
        fullName: userData.fullName,
        userType: userData.userType,
        username: userData.username,
      };
      
      this.setToken(mockData.token);
      localStorage.setItem(this.USER_KEY, JSON.stringify(mockUser));
      
      console.log('[MOCK AUTH] Registration successful');
      return { ...mockData, user: mockUser };
    }

    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }

    const data = await response.json();
    
    // Store token and user data
    this.setToken(data.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(data.user));
    
    console.log('[AUTH] Registration successful for user:', data.user.username);
    return data;
  }

  // Logout user
  static async logout(): Promise<void> {
    // MOCK MODE: Just clear auth
    const MOCK_MODE = true;
    
    if (MOCK_MODE) {
      console.log('[MOCK AUTH] Logout');
      this.clearAuth();
      return;
    }

    try {
      const token = this.getToken();
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('[AUTH] Logout request failed:', error);
    } finally {
      this.clearAuth();
      console.log('[AUTH] User logged out');
    }
  }
}

// Role-based access control helpers
export const canAccessRoute = (userType: string | undefined, requiredRoles: string[]): boolean => {
  if (!userType) return false;
  return requiredRoles.includes(userType);
};

export const requireEmployer = (userType: string | undefined): boolean => {
  return canAccessRoute(userType, ['employer']);
};

export const requireCandidate = (userType: string | undefined): boolean => {
  return canAccessRoute(userType, ['candidate']);
};

export const requireAdmin = (userType: string | undefined): boolean => {
  return canAccessRoute(userType, ['admin']);
};