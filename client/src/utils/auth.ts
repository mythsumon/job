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
  }

  // Check if token exists and is not expired
  static isTokenValid(): boolean {
    const token = this.getToken();
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