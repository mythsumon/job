import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Request, Response, NextFunction } from 'express';
import { storage } from './storage';
import { pool } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';
const REFRESH_TOKEN_EXPIRES_IN = '30d';

export interface JWTPayload {
  userId: number;
  username: string;
  email: string;
  userType: string;
  iat?: number;
  exp?: number;
}

export interface AuthRequest extends Request {
  user?: JWTPayload;
}

// Generate JWT token
export function generateToken(user: any): string {
  if (!user) {
    throw new Error('User object is required for token generation');
  }
  
  const userType = user.userType || user.user_type;
  const role = user.role;
  
  // 관리자는 admin 타입으로 설정
  const finalUserType = (userType === 'admin' || role === 'admin') ? 'admin' : userType;
  
  const payload: JWTPayload = {
    userId: user.id,
    username: user.username || user.email,
    email: user.email,
    userType: finalUserType
  };
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// Verify JWT token
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

// Compare password
export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

// Enhanced authentication middleware with improved error handling
export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      console.log(`[AUTH] No token provided for ${req.method} ${req.path}`);
      return res.status(401).json({ message: 'Access token required' });
    }

    let decoded = verifyToken(token);
    
    // Fallback for demo tokens
    if (!decoded && (token.startsWith('token_') || token.startsWith('fake-jwt-token-'))) {
      let userId: number;
      if (token.startsWith('fake-jwt-token-')) {
        userId = parseInt(token.replace('fake-jwt-token-', ''));
      } else {
        userId = parseInt(token.split('_')[1]);
      }
      
      if (!isNaN(userId)) {
        // For user 42, set as employer type
        const userType = userId === 42 ? 'employer' : 'candidate';
        decoded = {
          userId: userId,
          username: `user_${userId}`,
          email: `user${userId}@example.com`,
          userType: userType
        };
      }
    }
    
    if (!decoded) {
      console.log(`[AUTH] Invalid token for ${req.method} ${req.path}`);
      return res.status(403).json({ message: 'Invalid or expired token' });
    }

    // Attach user to request object
    req.user = decoded;
    console.log(`[AUTH] User ${decoded.userId} (${decoded.userType}) authenticated for ${req.method} ${req.path}`);
    next();
  } catch (error) {
    console.error(`[AUTH] Authentication error:`, error);
    return res.status(500).json({ message: 'Internal authentication error' });
  }
}

// Optional authentication middleware (doesn't fail if no token)
export function optionalAuth(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = verifyToken(token);
      if (decoded) {
        req.user = decoded;
        console.log(`[AUTH] Optional auth - User ${decoded.userId} authenticated`);
      }
    }

    next();
  } catch (error) {
    console.error(`[AUTH] Optional auth error:`, error);
    next(); // Continue without authentication in optional auth
  }
}

// Role-based authorization middleware
export function authorizeRoles(...allowedRoles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        console.log(`[AUTH] No user found for role authorization`);
        return res.status(401).json({ message: 'Authentication required' });
      }

      if (!allowedRoles.includes(req.user.userType)) {
        console.log(`[AUTH] User ${req.user.userId} with role ${req.user.userType} not authorized. Required: ${allowedRoles.join(', ')}`);
        return res.status(403).json({ message: 'Insufficient permissions' });
      }

      console.log(`[AUTH] User ${req.user.userId} authorized with role ${req.user.userType}`);
      next();
    } catch (error) {
      console.error(`[AUTH] Authorization error:`, error);
      return res.status(500).json({ message: 'Internal authorization error' });
    }
  };
}

// User type specific middleware
export function requireEmployer(req: AuthRequest, res: Response, next: NextFunction) {
  return authorizeRoles('employer')(req, res, next);
}

export function requireCandidate(req: AuthRequest, res: Response, next: NextFunction) {
  return authorizeRoles('candidate')(req, res, next);
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  return authorizeRoles('admin')(req, res, next);
}

// Login handler
export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    console.log(`[LOGIN] Attempting login with email: ${email}`);

    if (!email || !password) {
      console.log(`[LOGIN] Missing credentials - email: ${!!email}, password: ${!!password}`);
      return res.status(400).json({ message: 'Email and password required' });
    }

    // Find user by email using database pool
    const query = 'SELECT id, email, password, user_type, full_name, role, is_active FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    
    if (result.rows.length === 0) {
      console.log(`[LOGIN] No user found for email: ${email}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = result.rows[0];
    console.log(`[LOGIN] User found: ${!!user}, ID: ${user?.id}, userType: ${user?.user_type}`);

    // Verify password
    console.log(`[LOGIN] Comparing password for user ${user.id}`);
    const isValidPassword = await comparePassword(password, user.password);
    console.log(`[LOGIN] Password valid: ${isValidPassword}`);
    
    if (!isValidPassword) {
      console.log(`[LOGIN] Invalid password for user: ${user.id}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token with correct user data structure
    const tokenUser = {
      id: user.id,
      username: user.email,
      email: user.email,
      userType: user.user_type,
      user_type: user.user_type,
      role: user.role
    };

    const token = generateToken(tokenUser);
    const refreshTokenValue = generateRefreshToken(tokenUser);

    // Return user data without password
    res.json({
      token,
      refreshToken: refreshTokenValue,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        userType: user.user_type,
        role: user.role,
        isActive: user.is_active,
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

// Register handler
export async function register(req: Request, res: Response) {
  try {
    console.log('🔍 Register request body:', req.body);
    
    const { 
      email, 
      password, 
      fullName, 
      userType,
      location,
      // Citizenship fields
      citizenshipType,
      nationality,
      foreignId,
      // Mongolian specific fields
      ovog,
      ner,
      mongolianId,
      birthDate,
      birthPlace,
      // Phone fields
      phone,
      countryCode,
      fullPhone,
      // Employer specific fields
      companyRegistrationNumber,
      companyName,
      industry,
      companySize,
      position
    } = req.body;

    console.log('📞 Phone data received:', { phone, countryCode, fullPhone });
    
    // Phone field debugging
    const finalPhone = fullPhone || (countryCode && phone ? `${countryCode} ${phone}` : phone) || null;
    console.log('📱 Final phone to save:', finalPhone);

    if (!email || !password || !userType) {
      return res.status(400).json({ message: 'Email, password, and user type are required' });
    }

    // For candidates, either fullName or (ovog + ner) is required
    if (userType === 'candidate') {
      if (!fullName && (!ovog || !ner)) {
        return res.status(400).json({ message: 'Full name or Mongolian name (ovog + ner) is required for candidates' });
      }
    } else if (userType === 'employer' && !fullName) {
      return res.status(400).json({ message: 'Full name is required for employers' });
    }

    // Check if user already exists
    const existingUser = await storage.getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    // Check if Mongolian ID already exists (for Mongolian citizens)
    if (mongolianId) {
      try {
        const existingMongolianId = await storage.getUserByMongolianId(mongolianId);
        if (existingMongolianId) {
          return res.status(409).json({ message: 'Mongolian ID already exists' });
        }
      } catch (error) {
        console.log('Mongolian ID check skipped:', error);
      }
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Prepare user data
    const userData: any = {
      email,
      password: hashedPassword,
      fullName: fullName || `${ovog} ${ner}`,
      userType,
      role: 'user',
      isActive: true,
      location: location || null,
      // Phone data - save both separate and combined
      phone: fullPhone || (countryCode && phone ? `${countryCode} ${phone}` : phone) || null,
      countryCode: countryCode || null,
      // Citizenship fields
      citizenshipType: citizenshipType || 'mongolian',
      nationality: nationality || null,
      foreignId: foreignId || null,
      // Mongolian specific fields
      ovog: ovog || null,
      ner: ner || null,
      mongolianId: mongolianId || null,
      birthDate: birthDate || null,
      birthPlace: birthPlace || null
    };

    // Create user
    const newUser = await storage.createUser(userData);

    // If employer, create company and link to company_users
    if (userType === 'employer') {
      try {
        const companyData = {
          name: companyName || `${fullName}의 회사`,
          registrationNumber: companyRegistrationNumber || null,
          logo: null,
          size: companySize || null,
          status: 'pending',
          description: '',
          industry: industry || null,
          location: location || null,
          culture: null,
          benefits: [],
          website: null,
          founded: null,
          employeeCount: null,
          isDetailComplete: !!companyName // true if company name was provided
        };

        const company = await storage.createCompany(companyData);

        // Link user to company in company_users table
        await storage.createCompanyUser({
          userId: newUser.id,
          companyId: company.id,
          role: 'admin',
          isPrimary: true
        });

        console.log(`Created company and linked user ${newUser.id} to company ${company.id}`);
      } catch (companyError) {
        console.error('Error creating company for employer:', companyError);
        // Continue with registration even if company creation fails
      }
    }

    // Generate token
    const token = generateToken(newUser);
    const refreshTokenValue = generateRefreshToken(newUser);

    // Return user data without password
    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json({
      token,
      refreshToken: refreshTokenValue,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

// Get current user
export async function getCurrentUser(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const user = await storage.getUser(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

// Refresh token endpoint handler
export async function refreshToken(req: Request, res: Response) {
  try {
    const { refreshToken } = req.body as { refreshToken?: string };

    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token required' });
    }

    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      return res.status(403).json({ message: 'Invalid or expired refresh token' });
    }

    const user = await storage.getUser(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const newAccessToken = generateToken(user);
    const newRefreshToken = generateRefreshToken(user);

    res.json({ token: newAccessToken, refreshToken: newRefreshToken });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export function generateRefreshToken(user: any): string {
  const userType = user.userType || user.user_type;
  const payload: JWTPayload = {
    userId: user.id,
    username: user.username || user.email,
    email: user.email,
    userType,
  };
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES_IN });
}

export function verifyRefreshToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}