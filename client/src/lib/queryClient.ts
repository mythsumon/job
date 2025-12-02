import { QueryClient, QueryFunction } from "@tanstack/react-query";
import type { ApiResponse, PaginatedResponse } from '@shared/types';

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    let errorMessage = `${res.status}: ${res.statusText}`;
    
    try {
      const errorData = JSON.parse(text) as ApiResponse<never>;
      if (errorData.error) {
        errorMessage = `${errorData.error.code}: ${errorData.error.message}`;
      }
    } catch {
      errorMessage += ` - ${text}`;
    }
    
    throw new Error(errorMessage);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
  options?: RequestInit
): Promise<Response> {
  // Get JWT token from localStorage (try both possible keys)
  const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
  
  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options?.headers,
    },
    credentials: 'include',
    body: data ? JSON.stringify(data) : undefined,
    ...options,
  };

  const res = await fetch(url, config);
  await throwIfResNotOk(res);
  return res;
}

// Specialized API functions
export async function apiGet<T>(url: string): Promise<T> {
  const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
  
  const res = await fetch(url, { 
    credentials: 'include',
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
      'Content-Type': 'application/json'
    }
  });
  await throwIfResNotOk(res);
  return res.json();
}

export async function apiPost<T>(url: string, data?: any): Promise<T> {
  const response = await apiRequest('POST', url, data);
  return response.json();
}

export async function apiPut<T>(url: string, data?: any): Promise<T> {
  const response = await apiRequest('PUT', url, data);
  return response.json();
}

export async function apiDelete<T>(url: string): Promise<T> {
  const response = await apiRequest('DELETE', url);
  return response.json();
}

// Pagination helper
export async function apiGetPaginated<T>(
  url: string,
  page: number = 1,
  limit: number = 20,
  filters?: Record<string, any>
): Promise<PaginatedResponse<T>> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...filters,
  });
  
  return apiGet<PaginatedResponse<T>>(`${url}?${params}`);
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const token = localStorage.getItem('auth_token');
    
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        'Content-Type': 'application/json'
      }
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

// Cache keys for consistent cache management
export const cacheKeys = {
  jobs: {
    all: (filters?: any) => ['jobs', filters],
    featured: () => ['jobs', 'featured'],
    detail: (id: number) => ['jobs', id],
    byCompany: (companyId: number) => ['jobs', 'company', companyId],
    search: (query: string, filters?: any) => ['jobs', 'search', query, filters],
  },
  companies: {
    all: (filters?: any) => ['companies', filters],
    detail: (id: number) => ['companies', id],
    search: (query: string) => ['companies', 'search', query],
  },
  users: {
    profile: (id: number) => ['users', id],
    talents: (filters?: any) => ['users', 'talents', filters],
    applications: (userId: number) => ['users', userId, 'applications'],
    savedJobs: (userId: number) => ['users', userId, 'saved-jobs'],
  },
  stats: {
    platform: () => ['stats', 'platform'],
    company: (id: number) => ['stats', 'company', id],
    user: (id: number) => ['stats', 'user', id],
  },
  chat: {
    rooms: (userId: number) => ['chat', 'rooms', userId],
    messages: (roomId: number) => ['chat', 'messages', roomId],
  },
};

// Cache invalidation helpers
export const invalidateCache = {
  jobs: () => queryClient.invalidateQueries({ queryKey: ['jobs'] }),
  companies: () => queryClient.invalidateQueries({ queryKey: ['companies'] }),
  users: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  stats: () => queryClient.invalidateQueries({ queryKey: ['stats'] }),
  chat: () => queryClient.invalidateQueries({ queryKey: ['chat'] }),
  all: () => queryClient.invalidateQueries(),
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes for better UX
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors
        if (error?.message?.includes('401') || error?.message?.includes('403')) {
          return false;
        }
        return failureCount < 3;
      },
    },
    mutations: {
      retry: false,
      onError: (error) => {
        console.error('Mutation error:', error);
      },
    },
  },
});
