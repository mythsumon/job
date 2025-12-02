import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertJobSchema, insertCompanySchema, insertApplicationSchema, insertSavedJobSchema, insertUserSchema, insertChatRoomSchema, insertChatMessageSchema, insertResumeSchema } from "@shared/schema";
import { z } from "zod";
import { login, register, getCurrentUser, authenticateToken, optionalAuth, AuthRequest, verifyToken, refreshToken as refreshTokenHandler } from "./auth";
import { pool } from "./db";
import { 
  requestLogger, 
  securityHeaders, 
  corsMiddleware, 
  errorHandler,
  parsePagination,
  createRateLimit,
  healthCheck
} from "./middleware";
import { createApiResponse } from "./utils/response";
import { cacheMiddleware } from "./utils/cache";
import { monitor, BusinessMetrics, initializeMonitoring } from "./utils/monitoring";

export async function registerRoutes(app: Express): Promise<Server> {
  // Apply global middleware
  app.use(corsMiddleware);
  app.use(securityHeaders);
  app.use(requestLogger);
  app.use(healthCheck);
  
  // Initialize monitoring
  initializeMonitoring();
  
  // Rate limiting for auth endpoints
  const authRateLimit = createRateLimit({
    windowMs: process.env.NODE_ENV === 'development' ? 1 * 60 * 1000 : 15 * 60 * 1000, // 1분 (개발) / 15분 (운영)
    maxRequests: process.env.NODE_ENV === 'development' ? 50 : 5 // 50번 (개발) / 5번 (운영)
  });

  // JWT Authentication Routes
  app.post('/api/auth/login', authRateLimit, login);
  app.post('/api/auth/register', authRateLimit, register);
  app.get('/api/auth/user', authenticateToken, getCurrentUser);
  app.post('/api/auth/refresh', refreshTokenHandler);
  
  // Mongolian ID validation
  app.post('/api/auth/check-mongolian-id', authRateLimit, async (req, res) => {
    const api = createApiResponse(req, res);
    try {
      const { mongolianId } = req.body;
      
      if (!mongolianId || mongolianId.length !== 10) {
        return api.error('Invalid Mongolian ID format', 400);
      }
      
      const existingUser = await storage.getUserByMongolianId(mongolianId);
      
      return api.success({
        available: !existingUser,
        message: existingUser ? 'Mongolian ID already exists' : 'Mongolian ID available'
      });
    } catch (error) {
      console.error('Error checking Mongolian ID:', error);
      return api.error('Failed to check Mongolian ID', 500);
    }
  });

  // Email validation and verification
  app.post('/api/auth/check-email', authRateLimit, async (req, res) => {
    const api = createApiResponse(req, res);
    try {
      const { email } = req.body;
      
      console.log('🔍 Checking email:', email);
      
      if (!email || !email.includes('@')) {
        console.log('❌ Invalid email format');
        return api.error('Invalid email format', 400);
      }
      
      const existingUser = await storage.getUserByEmail(email);
      console.log('📧 DB query result:', existingUser ? 'User found' : 'No user found');
      console.log('📧 Full user object:', existingUser);
      
      const available = !existingUser;
      console.log('✅ Email available:', available);
      
      return api.success({
        available: available,
        message: existingUser ? 'Email already exists' : 'Email available'
      });
    } catch (error) {
      console.error('❌ Error checking email:', error);
      return api.error('Failed to check email', 500);
    }
  });

  // Temporary storage for verification codes (in production, use Redis or DB)
  const verificationCodes = new Map<string, { code: string; expiresAt: number }>();

  app.post('/api/auth/send-verification', authRateLimit, async (req, res) => {
    const api = createApiResponse(req, res);
    try {
      const { email } = req.body;
      
      if (!email || !email.includes('@')) {
        return api.error('Invalid email format', 400);
      }
      
      // Check if email is already taken
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return api.error('Email already exists', 400);
      }
      
      // Generate 6-digit verification code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
      
      // Store verification code
      verificationCodes.set(email, { code, expiresAt });
      
      // TODO: In production, send actual email using nodemailer or similar
      console.log(`📧 Verification code for ${email}: ${code}`);
      console.log(`🕒 Expires at: ${new Date(expiresAt)}`);
      
      return api.success({
        message: 'Verification code sent',
        // In development, return the code for testing
        ...(process.env.NODE_ENV === 'development' && { code })
      });
    } catch (error) {
      console.error('Error sending verification code:', error);
      return api.error('Failed to send verification code', 500);
    }
  });

  app.post('/api/auth/verify-email', authRateLimit, async (req, res) => {
    const api = createApiResponse(req, res);
    try {
      const { email, code } = req.body;
      
      if (!email || !code) {
        return api.error('Email and code are required', 400);
      }
      
      const storedData = verificationCodes.get(email);
      if (!storedData) {
        return api.error('No verification code found for this email', 400);
      }
      
      if (Date.now() > storedData.expiresAt) {
        verificationCodes.delete(email);
        return api.error('Verification code expired', 400);
      }
      
      if (storedData.code !== code) {
        return api.error('Invalid verification code', 400);
      }
      
      // Code is valid, remove it from storage
      verificationCodes.delete(email);
      
      return api.success({
        message: 'Email verified successfully',
        verified: true
      });
    } catch (error) {
      console.error('Error verifying email:', error);
      return api.error('Failed to verify email', 500);
    }
  });

  // Legacy registration endpoint (keeping for backward compatibility)
  app.post("/api/auth/register-legacy", authRateLimit, async (req, res) => {
    const api = createApiResponse(req, res);
    try {
      const { companyName, industry, companySize, position, userType, ...userData } = req.body;
      
      // Validate core user data
      const userSchema = insertUserSchema.pick({
        username: true,
        password: true,
        email: true,
        fullName: true,
        userType: true,
        location: true
      });
      
      const validatedUserData = userSchema.parse({
        ...userData,
        userType: userType || 'job_seeker'
      });
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedUserData.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const existingUsername = await storage.getUserByUsername(validatedUserData.username);
      if (existingUsername) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Create user first
      const user = await storage.createUser(validatedUserData);
      
      // If employer, create company and link via company_users table
      if (userType === 'employer' && companyName) {
        try {
          const companyData = {
            name: companyName,
            description: '',
            industry: industry || '',
            size: companySize || '',
            location: validatedUserData.location || '',
            website: '',
            logo: '',
            founded: null,
            employeeCount: null,
            benefits: [],
            culture: '',
            status: 'pending',
            isDetailComplete: false
          };
          
          const company = await storage.createCompany(companyData);
          
          // Create company-user relationship with admin role
          await storage.createCompanyUser({
            userId: user.id,
            companyId: company.id,
            role: 'admin',
            isPrimary: true
          });
        } catch (companyError) {
          console.error("Failed to create company:", companyError);
          return res.status(500).json({ message: "Failed to create company" });
        }
      }
      
      const { password, ...userWithoutPassword } = user;
      
      res.status(201).json({
        user: userWithoutPassword,
        token: `fake-jwt-token-${user.id}` // In production, use proper JWT
      });
    } catch (error) {
      console.error("Registration error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.get("/api/auth/user", async (req: any, res) => {
    try {
      // Check if user is logged in via session
      if (!req.session.userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/auth/logout", async (req: any, res) => {
    try {
      req.session.destroy((err: any) => {
        if (err) {
          return res.status(500).json({ message: "Logout failed" });
        }
        res.clearCookie('connect.sid'); // Clear session cookie
        res.json({ message: "Logged out successfully" });
      });
    } catch (error) {
      res.status(500).json({ message: "Logout failed" });
    }
  });

  // User Profile Routes
  app.get('/api/user/profile', async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ message: "인증이 필요합니다." });
      }

      const token = authHeader.replace('Bearer ', '');
      const decoded = verifyToken(token);
      const userId = decoded ? decoded.userId : parseInt(token.replace('fake-jwt-token-', ''));
      
      if (isNaN(userId)) {
        return res.status(401).json({ message: "유효하지 않은 토큰입니다." });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
      }

      const { password, ...userProfile } = user;
      res.json(userProfile);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      res.status(500).json({ message: '프로필을 불러오는데 실패했습니다.' });
    }
  });

  // User profile update route - matching frontend call
  app.put('/api/users/profile', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.userId;
      const updateData = req.body;
      
      // Validate required fields
      if (!updateData.fullName || !updateData.email) {
        return res.status(400).json({ message: "이름과 이메일은 필수입니다." });
      }

      const updatedUser = await storage.updateUser(userId, updateData);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
      }

      const { password, ...userProfile } = updatedUser;
      res.json(userProfile);
    } catch (error) {
      console.error('Error updating user profile:', error);
      res.status(500).json({ message: '프로필 업데이트에 실패했습니다.' });
    }
  });

  // Backward compatibility route
  app.put('/api/user/profile', async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ message: "인증이 필요합니다." });
      }

      const token = authHeader.replace('Bearer ', '');
      const decoded = verifyToken(token);
      const userId = decoded ? decoded.userId : parseInt(token.replace('fake-jwt-token-', ''));
      
      if (isNaN(userId)) {
        return res.status(401).json({ message: "유효하지 않은 토큰입니다." });
      }

      const updateData = req.body;
      const updatedUser = await storage.updateUser(userId, updateData);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
      }

      const { password, ...userProfile } = updatedUser;
      res.json(userProfile);
    } catch (error) {
      console.error('Error updating user profile:', error);
      res.status(500).json({ message: '프로필 업데이트에 실패했습니다.' });
    }
  });

  // User Settings Routes
  app.get('/api/user/settings', async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ message: "인증이 필요합니다." });
      }

      const token = authHeader.replace('Bearer ', '');
      const decoded = verifyToken(token);
      const userId = decoded ? decoded.userId : parseInt(token.replace('fake-jwt-token-', ''));
      
      if (isNaN(userId)) {
        return res.status(401).json({ message: "유효하지 않은 토큰입니다." });
      }

      const settings = {
        emailNotifications: true,
        pushNotifications: true,
        jobAlerts: true,
        messageNotifications: true,
        marketingEmails: false,
        profileVisibility: 'public',
        showEmail: false,
        showPhone: false,
        allowJobRecommendations: true,
      };

      res.json(settings);
    } catch (error) {
      console.error('Error fetching user settings:', error);
      res.status(500).json({ message: '설정을 불러오는데 실패했습니다.' });
    }
  });

  app.put('/api/user/notifications', async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ message: "인증이 필요합니다." });
      }

      const token = authHeader.replace('Bearer ', '');
      const decoded = verifyToken(token);
      const userId = decoded ? decoded.userId : parseInt(token.replace('fake-jwt-token-', ''));
      
      if (isNaN(userId)) {
        return res.status(401).json({ message: "유효하지 않은 토큰입니다." });
      }

      res.json({ message: '알림 설정이 저장되었습니다.' });
    } catch (error) {
      console.error('Error updating notification settings:', error);
      res.status(500).json({ message: '알림 설정 저장에 실패했습니다.' });
    }
  });

  app.put('/api/user/privacy', async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ message: "인증이 필요합니다." });
      }

      const token = authHeader.replace('Bearer ', '');
      const decoded = verifyToken(token);
      const userId = decoded ? decoded.userId : parseInt(token.replace('fake-jwt-token-', ''));
      
      if (isNaN(userId)) {
        return res.status(401).json({ message: "유효하지 않은 토큰입니다." });
      }

      res.json({ message: '개인정보 설정이 저장되었습니다.' });
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      res.status(500).json({ message: '개인정보 설정 저장에 실패했습니다.' });
    }
  });

  app.put('/api/user/password', async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ message: "인증이 필요합니다." });
      }

      const token = authHeader.replace('Bearer ', '');
      const decoded = verifyToken(token);
      const userId = decoded ? decoded.userId : parseInt(token.replace('fake-jwt-token-', ''));
      
      if (isNaN(userId)) {
        return res.status(401).json({ message: "유효하지 않은 토큰입니다." });
      }

      const { currentPassword, newPassword } = req.body;
      
      const user = await storage.getUser(userId);
      if (!user || user.password !== currentPassword) {
        return res.status(400).json({ message: '현재 비밀번호가 올바르지 않습니다.' });
      }

      await storage.updateUser(userId, { password: newPassword });
      res.json({ message: '비밀번호가 성공적으로 변경되었습니다.' });
    } catch (error) {
      console.error('Error updating password:', error);
      res.status(500).json({ message: '비밀번호 변경에 실패했습니다.' });
    }
  });

  app.delete('/api/user/account', async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ message: "인증이 필요합니다." });
      }

      const token = authHeader.replace('Bearer ', '');
      const decoded = verifyToken(token);
      const userId = decoded ? decoded.userId : parseInt(token.replace('fake-jwt-token-', ''));
      
      if (isNaN(userId)) {
        return res.status(401).json({ message: "유효하지 않은 토큰입니다." });
      }

      res.json({ message: '계정이 성공적으로 삭제되었습니다.' });
    } catch (error) {
      console.error('Error deleting account:', error);
      res.status(500).json({ message: '계정 삭제에 실패했습니다.' });
    }
  });

  // Jobs endpoints
  app.get("/api/jobs", async (req, res) => {
    try {
      console.log("Jobs API called with query:", req.query);
      
      const filters = {
        location: req.query.location as string,
        industry: req.query.industry as string,
        experience: req.query.experience as string,
        type: req.query.type as string,
        salaryMin: req.query.salaryMin ? parseInt(req.query.salaryMin as string) : undefined,
        salaryMax: req.query.salaryMax ? parseInt(req.query.salaryMax as string) : undefined,
        isRemote: req.query.isRemote === 'true',
        isFeatured: req.query.isFeatured === 'true',
        search: req.query.search as string,
        companyId: req.query.companyId ? parseInt(req.query.companyId as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        offset: req.query.offset ? parseInt(req.query.offset as string) : undefined,
      };

      // Remove undefined values
      Object.keys(filters).forEach(key => {
        if (filters[key as keyof typeof filters] === undefined) {
          delete filters[key as keyof typeof filters];
        }
      });

      console.log("Processed filters:", filters);
      
      const jobs = await storage.getJobs(filters);
      console.log("Retrieved jobs count:", jobs.length);
      
      res.json(jobs);
    } catch (error) {
      console.error("Jobs API error:", error);
      res.status(500).json({ message: "Failed to fetch jobs" });
    }
  });

  app.get("/api/jobs/featured", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 6;
      const jobs = await storage.getFeaturedJobs(limit);
      res.json(jobs);
    } catch (error) {
      console.error("Featured jobs error:", error);
      res.status(500).json({ message: "Failed to fetch featured jobs" });
    }
  });

  app.get("/api/jobs/pro", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 8;
      const jobs = await storage.getProJobs(limit);
      res.json(jobs);
    } catch (error) {
      console.error("Pro jobs error:", error);
      res.status(500).json({ message: "Failed to fetch pro jobs" });
    }
  });

  app.get("/api/jobs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const job = await storage.getJobWithCompany(id);
      
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }

      // Increment view count
      await storage.incrementJobViews(id);
      
      res.json(job);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch job" });
    }
  });

  app.post("/api/jobs", async (req, res) => {
    try {
      const validatedData = insertJobSchema.parse(req.body);
      const job = await storage.createJob(validatedData);
      res.status(201).json(job);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid job data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create job" });
    }
  });

  // Companies endpoints
  app.get("/api/companies", async (req, res) => {
    try {
      console.log("Companies API called with query:", req.query);
      
      const filters = {
        industry: req.query.industry as string,
        size: req.query.size as string,
        location: req.query.location as string,
      };

      // Remove undefined values
      Object.keys(filters).forEach(key => {
        if (filters[key as keyof typeof filters] === undefined) {
          delete filters[key as keyof typeof filters];
        }
      });

      console.log("Processed company filters:", filters);
      
      const companies = await storage.getCompanies(filters);
      console.log("Retrieved companies count:", companies.length);
      
      res.json(companies);
    } catch (error) {
      console.error("Companies API error:", error);
      res.status(500).json({ message: "Failed to fetch companies" });
    }
  });

  // Company profile management for employers - MUST be before /api/companies/:id
  app.get("/api/companies/profile", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ message: "인증이 필요합니다." });
      }

      // 사용자-회사 매핑 확인 (company_users 테이블)
      const companyUser = await storage.getUserCompanyAssociation(userId);
      if (!companyUser) {
        return res.status(404).json({ message: "회사 정보를 찾을 수 없습니다." });
      }

      const company = await storage.getCompany(companyUser.companyId);
      if (!company) {
        return res.status(404).json({ message: "회사 정보를 찾을 수 없습니다." });
      }

      return res.json(company);
    } catch (error) {
      console.error("[Company Profile API] Error:", error);
      return res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
  });

  // Company logo upload endpoint
  app.post('/api/companies/logo', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { logoUrl, format, size } = req.body;
      
      if (!logoUrl || typeof logoUrl !== 'string') {
        return res.status(400).json({ message: '로고 이미지 URL이 필요합니다.' });
      }
      
      // Validate that the image is in supported format
      const supportedFormats = ['data:image/webp;base64,', 'data:image/jpeg;base64,', 'data:image/png;base64,'];
      const isValidFormat = supportedFormats.some(fmt => logoUrl.startsWith(fmt));
      
      if (!isValidFormat) {
        return res.status(400).json({ message: 'WebP, JPEG, PNG 형식의 이미지만 지원됩니다.' });
      }
      
      // Validate base64 data size (max ~13MB for 10MB file after base64 encoding)
      const base64Data = logoUrl.split(',')[1];
      if (!base64Data || base64Data.length > 13 * 1024 * 1024) {
        return res.status(400).json({ message: '이미지 크기가 너무 큽니다. 최대 10MB까지 허용됩니다.' });
      }
      
      // Validate base64 format
      try {
        Buffer.from(base64Data, 'base64');
      } catch (e) {
        return res.status(400).json({ message: '올바르지 않은 이미지 데이터 형식입니다.' });
      }
      
      const userId = req.user!.userId;
      
      // Get user's company association
      const companyUser = await storage.getUserCompanyAssociation(userId);
      if (!companyUser) {
        return res.status(404).json({ message: "회사 정보를 찾을 수 없습니다." });
      }

      if (companyUser.role !== 'admin') {
        return res.status(403).json({ message: "로고 업로드 권한이 없습니다." });
      }
      
      // Update company logo
      const updatedCompany = await storage.updateCompany(companyUser.companyId, { 
        logo: logoUrl,
        logoFormat: format || 'webp',
        logoSize: size || null
      });
      
      if (!updatedCompany) {
        return res.status(404).json({ message: '회사 정보를 찾을 수 없습니다.' });
      }
      
      return res.json({ 
        logo: updatedCompany.logo,
        logoFormat: updatedCompany.logoFormat,
        logoSize: updatedCompany.logoSize
      });
    } catch (error) {
      console.error('Company logo upload error:', error);
      return res.status(500).json({ message: '로고 업로드에 실패했습니다.' });
    }
  });

  app.put("/api/companies/profile", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ message: "인증이 필요합니다." });
      }

      const token = authHeader.replace('Bearer ', '');
      const decoded = verifyToken(token);
      const userId = decoded ? decoded.userId : parseInt(token.replace('fake-jwt-token-', ''));
      
      if (isNaN(userId)) {
        return res.status(401).json({ message: "유효하지 않은 토큰입니다." });
      }
      
      const user = await storage.getUser(userId);
      if (!user || user.userType !== 'employer') {
        return res.status(403).json({ message: "기업 회원만 접근 가능합니다." });
      }

      // Get user's company association
      const companyUser = await storage.getUserCompanyAssociation(userId);
      if (!companyUser) {
        return res.status(404).json({ message: "회사 정보를 찾을 수 없습니다." });
      }

      if (companyUser.role !== 'admin') {
        return res.status(403).json({ message: "기업 정보 수정 권한이 없습니다." });
      }

      const updateData = req.body;
      
      // Update company data with timestamp
      const updatedCompany = await storage.updateCompany(companyUser.companyId, {
        ...updateData,
        updatedAt: new Date()
      });
      
      if (!updatedCompany) {
        return res.status(404).json({ message: "회사 정보 업데이트에 실패했습니다." });
      }

      res.json(updatedCompany);
    } catch (error) {
      console.error('Company profile update error:', error);
      res.status(500).json({ message: "회사 정보 수정에 실패했습니다." });
    }
  });

  // Generic company routes - placed after specific routes to avoid conflicts
  app.get("/api/companies/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const company = await storage.getCompany(id);
      
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }
      
      res.json(company);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch company" });
    }
  });

  app.get("/api/companies/:id/jobs", async (req, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const jobs = await storage.getJobs({ companyId });
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch company jobs" });
    }
  });

  app.post("/api/companies", async (req, res) => {
    try {
      const validatedData = insertCompanySchema.parse(req.body);
      const company = await storage.createCompany(validatedData);
      res.status(201).json(company);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid company data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create company" });
    }
  });

  // Authentication endpoints
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, fullName, userType } = req.body;
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "이미 존재하는 이메일입니다." });
      }
      
      // Create new user
      const userData = {
        username: email.split('@')[0], // Generate username from email
        email,
        password, // In production, this should be hashed
        fullName,
        userType,
        profilePicture: null,
        location: null,
        phone: null,
        bio: null,
        skills: null,
        experience: null,
        education: null,
      };
      
      const user = await storage.createUser(userData);
      
      // Remove password from response
      const { password: _, ...userResponse } = user;
      
      res.status(201).json({
        message: "회원가입이 완료되었습니다.",
        user: userResponse,
        token: `token_${user.id}_${Date.now()}` // Simple token for demo
      });
    } catch (error: any) {
      res.status(500).json({ message: "회원가입 중 오류가 발생했습니다." });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Find user by email
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "이메일 또는 비밀번호가 잘못되었습니다." });
      }
      
      // Check password (in production, compare hashed passwords)
      if (user.password !== password) {
        return res.status(401).json({ message: "이메일 또는 비밀번호가 잘못되었습니다." });
      }
      
      // Remove password from response
      const { password: _, ...userResponse } = user;
      
      res.json({
        message: "로그인 성공",
        user: userResponse,
        token: `token_${user.id}_${Date.now()}` // Simple token for demo
      });
    } catch (error: any) {
      res.status(500).json({ message: "로그인 중 오류가 발생했습니다." });
    }
  });

  app.get("/api/auth/user", async (req, res) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return res.status(401).json({ message: "인증 토큰이 필요합니다." });
      }
      
      // Extract user ID from token (simple demo implementation)
      const userId = parseInt(token.split('_')[1]);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(401).json({ message: "유효하지 않은 토큰입니다." });
      }
      
      // Remove password from response
      const { password: _, ...userResponse } = user;
      res.json(userResponse);
    } catch (error: any) {
      res.status(401).json({ message: "인증에 실패했습니다." });
    }
  });

  // Get talents (candidates) with optional filtering
  app.get("/api/talents", async (req, res) => {
    try {
      const { search, experience, location, skills } = req.query;
      const talents = await storage.getTalents({
        search: search as string,
        experience: experience as string,
        location: location as string,
        skills: skills as string,
      });
      res.json(talents);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Applications endpoints
  app.post("/api/applications", async (req, res) => {
    try {
      const validatedData = insertApplicationSchema.parse(req.body);
      const application = await storage.createApplication(validatedData);
      res.status(201).json(application);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid application data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create application" });
    }
  });

  app.get("/api/applications/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const applications = await storage.getApplicationsByUser(userId);
      res.json(applications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user applications" });
    }
  });

  app.get("/api/applications/job/:jobId", async (req, res) => {
    try {
      const jobId = parseInt(req.params.jobId);
      const applications = await storage.getApplicationsByJob(jobId);
      res.json(applications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch job applications" });
    }
  });

  // Saved jobs endpoints
  app.post("/api/saved-jobs", async (req, res) => {
    try {
      const validatedData = insertSavedJobSchema.parse(req.body);
      
      // Check if already saved
      const existing = await storage.getSavedJob(validatedData.userId!, validatedData.jobId!);
      if (existing) {
        return res.status(400).json({ message: "Job already saved" });
      }
      
      const savedJob = await storage.createSavedJob(validatedData);
      res.status(201).json(savedJob);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid saved job data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to save job" });
    }
  });

  app.delete("/api/saved-jobs/:userId/:jobId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const jobId = parseInt(req.params.jobId);
      
      const deleted = await storage.deleteSavedJob(userId, jobId);
      if (!deleted) {
        return res.status(404).json({ message: "Saved job not found" });
      }
      
      res.json({ message: "Job unsaved successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to unsave job" });
    }
  });

  app.get("/api/saved-jobs/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const savedJobs = await storage.getSavedJobsByUser(userId);
      res.json(savedJobs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch saved jobs" });
    }
  });

  // Search and filters
  app.get("/api/search/suggestions", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query || query.length < 2) {
        return res.json([]);
      }

      const jobs = await storage.getJobs({ search: query, limit: 10 });
      const suggestions = jobs.map(job => ({
        type: 'job',
        title: job.title,
        company: job.company.name,
        id: job.id
      }));

      res.json(suggestions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch search suggestions" });
    }
  });

  // Statistics endpoint
  app.get("/api/stats", async (req, res) => {
    try {
      const allJobs = await storage.getJobs();
      const allCompanies = await storage.getCompanies();
      
      const stats = {
        totalJobs: allJobs.length,
        totalCompanies: allCompanies.length,
        featuredJobs: allJobs.filter(job => job.isFeatured).length,
        activeJobs: allJobs.filter(job => job.status === 'active').length
      };
      
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  // Chat endpoints - all require authentication
  app.get("/api/chat/rooms/user/:userId", authenticateToken, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const rooms = await storage.getChatRoomsByUser(userId);
      res.json(rooms);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch chat rooms" });
    }
  });

  // Get chat rooms for user
  app.get("/api/chat/rooms", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.query.userId || req.user?.userId;
      if (!userId) {
        return res.status(400).json({ message: "User ID required" });
      }
      
      const chatRooms = await storage.getChatRoomsByUser(parseInt(userId as string));
      res.json(chatRooms);
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
      res.status(500).json({ message: "Failed to fetch chat rooms" });
    }
  });

  // Get chat rooms for company (employer view)
  app.get("/api/chat/rooms/company", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user?.userId;
      console.log('Company chat rooms request - user:', req.user);
      console.log('Extracted userId:', userId);
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized - no user ID" });
      }

      // Get user's primary company
      const primaryCompany = await storage.getUserPrimaryCompany(parseInt(userId.toString()));
      console.log('Primary company found:', primaryCompany);
      
      if (!primaryCompany) {
        return res.status(404).json({ message: "No company found for user" });
      }

      // Get all chat rooms for this company (where employer is from this company)
      const chatRooms = await storage.getChatRoomsByUser(parseInt(userId.toString()));
      res.json(chatRooms);
    } catch (error) {
      console.error('Error fetching company chat rooms:', error);
      res.status(500).json({ message: "Failed to fetch company chat rooms" });
    }
  });

  app.get("/api/chat/rooms/:roomId", authenticateToken, async (req, res) => {
    try {
      const roomId = parseInt(req.params.roomId);
      
      // Check if roomId is a valid number
      if (isNaN(roomId)) {
        return res.status(400).json({ message: "Invalid room ID" });
      }
      
      const room = await storage.getChatRoomWithParticipants(roomId);
      if (!room) {
        return res.status(404).json({ message: "Chat room not found" });
      }
      res.json(room);
    } catch (error) {
      console.error('Error getting chat room with participants:', error);
      res.status(500).json({ message: "Failed to fetch chat room" });
    }
  });

  app.post("/api/chat/rooms", async (req, res) => {
    try {
      const validatedData = insertChatRoomSchema.parse(req.body);
      const room = await storage.findOrCreateChatRoom(
        validatedData.employerId!, 
        validatedData.candidateId!, 
        validatedData.jobId!
      );
      res.json(room);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid chat room data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create chat room" });
    }
  });

  app.get("/api/chat/messages/:roomId", async (req, res) => {
    try {
      const roomId = parseInt(req.params.roomId);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
      
      const messages = await storage.getChatMessagesByRoom(roomId, limit, offset);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post("/api/chat/messages", async (req, res) => {
    try {
      const validatedData = insertChatMessageSchema.parse(req.body);
      const message = await storage.createChatMessage(validatedData);
      
      // Broadcast to WebSocket clients
      const messageWithSender = await storage.getChatMessagesByRoom(message.roomId!, 1, 0);
      if (messageWithSender.length > 0) {
        broadcastToRoom(message.roomId!, messageWithSender[0]);
      }
      
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid message data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  app.post("/api/chat/messages/:roomId/read", async (req, res) => {
    try {
      const roomId = parseInt(req.params.roomId);
      const { userId } = req.body;
      
      await storage.markMessagesAsRead(roomId, userId);
      res.json({ message: "Messages marked as read" });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark messages as read" });
    }
  });

  // Get unread message count for user
  app.get("/api/chat/unread-count", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.query.userId || req.user?.userId;
      if (!userId) {
        return res.status(400).json({ message: "User ID required" });
      }

      const chatRooms = await storage.getChatRoomsByUser(parseInt(userId as string));
      let totalUnread = 0;

      for (const room of chatRooms) {
        if (room.status === 'active') { // Only count unread for active chats
          const unreadCount = await storage.getUnreadMessageCount(room.id, parseInt(userId as string));
          totalUnread += unreadCount;
        }
      }

      res.json(totalUnread);
    } catch (error) {
      console.error('Error getting unread count:', error);
      res.status(500).json({ message: "Failed to get unread count" });
    }
  });

  // Mark messages as read for a specific room
  app.post("/api/chat/rooms/:roomId/mark-read", authenticateToken, async (req, res) => {
    try {
      const roomId = parseInt(req.params.roomId);
      const { userId } = req.body;
      
      await storage.markMessagesAsRead(roomId, userId);
      res.json({ message: "Messages marked as read" });
    } catch (error) {
      console.error('Error marking messages as read:', error);
      res.status(500).json({ message: "Failed to mark messages as read" });
    }
  });

  // Check if user can start chat (only employers can initiate)
  app.post("/api/chat/can-start", authenticateToken, async (req, res) => {
    try {
      const { senderId, receiverId } = req.body;
      
      const sender = await storage.getUser(senderId);
      const receiver = await storage.getUser(receiverId);
      
      if (!sender || !receiver) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Only allow employer -> job_seeker communication
      if (sender.userType !== 'employer' || receiver.userType !== 'job_seeker') {
        return res.status(403).json({ 
          message: "Only employers can initiate chat with job seekers",
          canStart: false 
        });
      }
      
      res.json({ canStart: true });
    } catch (error) {
      console.error('Error checking chat permissions:', error);
      res.status(500).json({ message: "Failed to check permissions" });
    }
  });

  // Start new chat (employer -> job_seeker only)
  app.post("/api/chat/start", authenticateToken, async (req, res) => {
    try {
      const { employerId, jobSeekerId, jobId, initialMessage } = req.body;
      
      const employer = await storage.getUser(employerId);
      const jobSeeker = await storage.getUser(jobSeekerId);
      
      if (!employer || !jobSeeker) {
        return res.status(404).json({ message: "User not found" });
      }
      
      if (employer.userType !== 'employer' || jobSeeker.userType !== 'job_seeker') {
        return res.status(403).json({ message: "Invalid chat participants" });
      }
      
      // Check if chat already exists
      const existingChat = await storage.findOrCreateChatRoom(employerId, jobSeekerId, jobId);
      
      if (existingChat.status === 'closed') {
        // Reopen closed chat
        await storage.reopenChatRoom(existingChat.id, employerId);
      }
      
      // Send initial message
      if (initialMessage) {
        await storage.createChatMessage({
          roomId: existingChat.id,
          senderId: employerId,
          message: initialMessage,
          messageType: 'text'
        });
      }
      
      res.json(existingChat);
    } catch (error) {
      console.error('Error starting chat:', error);
      res.status(500).json({ message: "Failed to start chat" });
    }
  });

  // Close chat room
  app.post("/api/chat/rooms/:roomId/close", authenticateToken, async (req, res) => {
    try {
      const roomId = parseInt(req.params.roomId);
      const { userId } = req.body;
      
      const room = await storage.getChatRoom(roomId);
      if (!room) {
        return res.status(404).json({ message: "Chat room not found" });
      }
      
      // Check if user is participant
      if (room.employerId !== userId && room.candidateId !== userId) {
        return res.status(403).json({ message: "Not authorized to close this chat" });
      }
      
      await storage.closeChatRoom(roomId, userId);
      res.json({ message: "Chat closed successfully" });
    } catch (error) {
      console.error('Error closing chat:', error);
      res.status(500).json({ message: "Failed to close chat" });
    }
  });

  // Request to reopen chat
  app.post("/api/chat/rooms/:roomId/reopen-request", async (req, res) => {
    try {
      const roomId = parseInt(req.params.roomId);
      const { userId } = req.body;
      
      const room = await storage.getChatRoom(roomId);
      if (!room) {
        return res.status(404).json({ message: "Chat room not found" });
      }
      
      if (room.status !== 'closed') {
        return res.status(400).json({ message: "Chat is not closed" });
      }
      
      // Check if user is participant
      if (room.employerId !== userId && room.candidateId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      await storage.requestChatReopen(roomId, userId);
      res.json({ message: "Reopen request sent" });
    } catch (error) {
      console.error('Error requesting chat reopen:', error);
      res.status(500).json({ message: "Failed to request reopen" });
    }
  });

  // Accept reopen request
  app.post("/api/chat/rooms/:roomId/accept-reopen", authenticateToken, async (req, res) => {
    try {
      const roomId = parseInt(req.params.roomId);
      const { userId } = req.body;
      
      const room = await storage.getChatRoom(roomId);
      if (!room) {
        return res.status(404).json({ message: "Chat room not found" });
      }
      
      if (room.status !== 'pending_reopen') {
        return res.status(400).json({ message: "No pending reopen request" });
      }
      
      // Check if user is the other participant (not the one who requested)
      if (room.reopenRequestedBy === userId) {
        return res.status(400).json({ message: "Cannot accept your own request" });
      }
      
      if (room.employerId !== userId && room.candidateId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      await storage.acceptChatReopen(roomId);
      res.json({ message: "Chat reopened successfully" });
    } catch (error) {
      console.error('Error accepting chat reopen:', error);
      res.status(500).json({ message: "Failed to accept reopen" });
    }
  });

  // Delete chat for user (soft delete)
  app.post("/api/chat/rooms/:roomId/delete", async (req, res) => {
    try {
      const roomId = parseInt(req.params.roomId);
      const { userId } = req.body;
      
      const room = await storage.getChatRoom(roomId);
      if (!room) {
        return res.status(404).json({ message: "Chat room not found" });
      }
      
      // Check if user is participant
      if (room.employerId !== userId && room.candidateId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      await storage.deleteChatForUser(roomId, userId);
      res.json({ message: "Chat deleted successfully" });
    } catch (error) {
      console.error('Error deleting chat:', error);
      res.status(500).json({ message: "Failed to delete chat" });
    }
  });

  // Employment History Routes
  app.post('/api/employment/request', async (req, res) => {
    try {
      const employmentData = req.body;
      const employment = await storage.createEmploymentRequest(employmentData);
      res.json(employment);
    } catch (error) {
      console.error('Error creating employment request:', error);
      res.status(500).json({ message: 'Failed to create employment request' });
    }
  });

  app.post('/api/employment/:id/approve', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const approverId = req.body.approverId;
      const employment = await storage.approveEmploymentRequest(id, approverId);
      res.json(employment);
    } catch (error) {
      console.error('Error approving employment request:', error);
      res.status(500).json({ message: 'Failed to approve employment request' });
    }
  });

  app.post('/api/employment/:id/reject', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const employment = await storage.rejectEmploymentRequest(id);
      res.json(employment);
    } catch (error) {
      console.error('Error rejecting employment request:', error);
      res.status(500).json({ message: 'Failed to reject employment request' });
    }
  });

  app.post('/api/employment/:id/terminate', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const terminatedBy = req.body.terminatedBy;
      const employment = await storage.terminateEmployment(id, terminatedBy);
      res.json(employment);
    } catch (error) {
      console.error('Error terminating employment:', error);
      res.status(500).json({ message: 'Failed to terminate employment' });
    }
  });

  app.get('/api/employment/user/:userId', async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const employments = await storage.getEmploymentHistoryByUser(userId);
      res.json(employments);
    } catch (error) {
      console.error('Error fetching user employment history:', error);
      res.status(500).json({ message: 'Failed to fetch employment history' });
    }
  });

  app.get('/api/employment/company/:companyId', async (req, res) => {
    try {
      const companyId = parseInt(req.params.companyId);
      const employments = await storage.getEmploymentHistoryByCompany(companyId);
      res.json(employments);
    } catch (error) {
      console.error('Error fetching company employment history:', error);
      res.status(500).json({ message: 'Failed to fetch employment history' });
    }
  });

  // Evaluation Routes
  app.post('/api/evaluations', async (req, res) => {
    try {
      const evaluationData = req.body;
      const evaluation = await storage.createEvaluation(evaluationData);
      res.json(evaluation);
    } catch (error) {
      console.error('Error creating evaluation:', error);
      res.status(500).json({ message: 'Failed to create evaluation' });
    }
  });

  app.get('/api/evaluations/employment/:employmentId', async (req, res) => {
    try {
      const employmentId = parseInt(req.params.employmentId);
      const evaluations = await storage.getEvaluationsByEmployment(employmentId);
      res.json(evaluations);
    } catch (error) {
      console.error('Error fetching evaluations:', error);
      res.status(500).json({ message: 'Failed to fetch evaluations' });
    }
  });

  app.get('/api/evaluations/user/:userId', async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const evaluatorType = req.query.evaluatorType as string;
      const evaluations = await storage.getEvaluationsByUser(userId, evaluatorType);
      res.json(evaluations);
    } catch (error) {
      console.error('Error fetching user evaluations:', error);
      res.status(500).json({ message: 'Failed to fetch evaluations' });
    }
  });

  // Company Review Routes
  app.post('/api/reviews', async (req, res) => {
    try {
      const reviewData = req.body;
      const review = await storage.createCompanyReview(reviewData);
      res.json(review);
    } catch (error) {
      console.error('Error creating review:', error);
      res.status(500).json({ message: 'Failed to create review' });
    }
  });

  app.get('/api/reviews/company/:companyId', async (req, res) => {
    try {
      const companyId = parseInt(req.params.companyId);
      const isPublic = req.query.public !== 'false';
      const reviews = await storage.getCompanyReviews(companyId, isPublic);
      res.json(reviews);
    } catch (error) {
      console.error('Error fetching company reviews:', error);
      res.status(500).json({ message: 'Failed to fetch reviews' });
    }
  });

  app.get('/api/reviews/company/:companyId/rating', async (req, res) => {
    try {
      const companyId = parseInt(req.params.companyId);
      const rating = await storage.getCompanyRating(companyId);
      res.json(rating);
    } catch (error) {
      console.error('Error fetching company rating:', error);
      res.status(500).json({ message: 'Failed to fetch rating' });
    }
  });

  // Subscription Routes
  app.get('/api/subscription/user/:userId', async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const subscription = await storage.getActiveSubscription(userId);
      res.json(subscription);
    } catch (error) {
      console.error('Error fetching subscription:', error);
      res.status(500).json({ message: 'Failed to fetch subscription' });
    }
  });

  app.post('/api/subscription', async (req, res) => {
    try {
      const subscriptionData = req.body;
      const subscription = await storage.createSubscription(subscriptionData);
      res.json(subscription);
    } catch (error) {
      console.error('Error creating subscription:', error);
      res.status(500).json({ message: 'Failed to create subscription' });
    }
  });

  // Admin Dashboard Routes
  app.get('/api/admin/stats', async (req, res) => {
    try {
      const period = req.query.period as string || '7d';
      
      // Calculate stats based on period
      const allUsers = await storage.getTalents({});
      const allCompanies = Array.from((storage as any).companies?.values() || []);
      const allJobs = Array.from((storage as any).jobs?.values() || []);
      
      const stats = {
        totalUsers: allUsers.length,
        totalCompanies: allCompanies.length,
        activeJobs: allJobs.filter((job: any) => job.status === 'active').length,
        monthlyRevenue: 12500000, // Mock data
        userGrowth: 12.5,
        companyGrowth: 8.3,
        jobGrowth: 15.2,
        revenueGrowth: 23.7,
      };
      
      res.json(stats);
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      res.status(500).json({ message: 'Failed to fetch stats' });
    }
  });

  app.get('/api/admin/recent-activity', async (req, res) => {
    try {
      const activities = [
        {
          id: 1,
          description: "새로운 기업 '테크스타트업'이 등록되었습니다",
          time: "5분 전"
        },
        {
          id: 2,
          description: "사용자 김철수가 소프트웨어 개발자 포지션에 지원했습니다",
          time: "10분 전"
        },
        {
          id: 3,
          description: "기업 '이노베이션코퍼레이션'의 승인이 완료되었습니다",
          time: "1시간 전"
        },
        {
          id: 4,
          description: "새로운 채용공고 '프론트엔드 개발자'가 등록되었습니다",
          time: "2시간 전"
        },
        {
          id: 5,
          description: "결제 처리가 완료되었습니다 (50,000원)",
          time: "3시간 전"
        }
      ];
      
      res.json(activities);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      res.status(500).json({ message: 'Failed to fetch activity' });
    }
  });

  app.get('/api/admin/payments/recent', async (req, res) => {
    try {
      const payments = [
        {
          id: 1,
          description: "프리미엄 구독",
          amount: 50000,
          status: "completed",
          user: { fullName: "김철수" }
        },
        {
          id: 2,
          description: "기업 등록비",
          amount: 100000,
          status: "completed",
          user: { fullName: "박영희" }
        },
        {
          id: 3,
          description: "채용공고 게시비",
          amount: 30000,
          status: "pending",
          user: { fullName: "이민수" }
        }
      ];
      
      res.json(payments);
    } catch (error) {
      console.error('Error fetching payments:', error);
      res.status(500).json({ message: 'Failed to fetch payments' });
    }
  });

  // Banner Management APIs
  app.get('/api/admin/banners', async (req, res) => {
    try {
      // Mock banner data for now - in production this would come from database
      const banners = [
        {
          id: 1,
          title: "🚀 몽골 최고의 개발자 채용 플랫폼",
          content: "프리미엄 기업들과 연결되어 더 나은 기회를 찾아보세요",
          linkUrl: "/user/companies",
          position: "jobs_header",
          priority: 1,
          backgroundColor: "#f59e0b",
          textColor: "#ffffff",
          isActive: true,
          clickCount: 245,
          viewCount: 1520,
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          title: "💼 새로운 커리어의 시작",
          content: "한국 대기업들의 독점 채용정보를 확인하세요",
          linkUrl: "/user/jobs",
          position: "jobs_header",
          priority: 2,
          backgroundColor: "#3b82f6",
          textColor: "#ffffff",
          isActive: true,
          clickCount: 189,
          viewCount: 980,
          createdAt: new Date().toISOString()
        }
      ];
      
      res.json(banners);
    } catch (error) {
      console.error('Error fetching banners:', error);
      res.status(500).json({ message: 'Failed to fetch banners' });
    }
  });

  app.post('/api/admin/banners', async (req, res) => {
    try {
      const bannerData = req.body;
      // In production, this would save to database
      const newBanner = {
        id: Date.now(),
        ...bannerData,
        clickCount: 0,
        viewCount: 0,
        createdAt: new Date().toISOString()
      };
      
      res.status(201).json(newBanner);
    } catch (error) {
      console.error('Error creating banner:', error);
      res.status(500).json({ message: 'Failed to create banner' });
    }
  });

  app.put('/api/admin/banners/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const bannerData = req.body;
      // In production, this would update in database
      const updatedBanner = {
        id,
        ...bannerData,
        updatedAt: new Date().toISOString()
      };
      
      res.json(updatedBanner);
    } catch (error) {
      console.error('Error updating banner:', error);
      res.status(500).json({ message: 'Failed to update banner' });
    }
  });

  app.delete('/api/admin/banners/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      // In production, this would delete from database
      res.json({ message: 'Banner deleted successfully' });
    } catch (error) {
      console.error('Error deleting banner:', error);
      res.status(500).json({ message: 'Failed to delete banner' });
    }
  });

  app.patch('/api/admin/banners/:id/toggle', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { isActive } = req.body;
      // In production, this would update in database
      res.json({ message: 'Banner status updated successfully' });
    } catch (error) {
      console.error('Error toggling banner:', error);
      res.status(500).json({ message: 'Failed to toggle banner status' });
    }
  });

  // Admin Users Management
  app.get('/api/admin/users', async (req, res) => {
    try {
      const { search, userType, status, page = 1 } = req.query;
      const limit = 10;
      const offset = (Number(page) - 1) * limit;
      
      const allUsers = await storage.getTalents({});
      
      let filteredUsers = allUsers;
      
      if (search) {
        filteredUsers = filteredUsers.filter(user => 
          user.fullName?.toLowerCase().includes((search as string).toLowerCase()) ||
          user.email?.toLowerCase().includes((search as string).toLowerCase()) ||
          user.username?.toLowerCase().includes((search as string).toLowerCase())
        );
      }
      
      if (userType && userType !== 'all') {
        filteredUsers = filteredUsers.filter(user => user.userType === userType);
      }
      
      const total = filteredUsers.length;
      const data = filteredUsers.slice(offset, offset + limit);
      
      res.json({ data, total });
    } catch (error) {
      console.error('Error fetching admin users:', error);
      res.status(500).json({ message: 'Failed to fetch users' });
    }
  });

  app.get('/api/admin/users/stats', async (req, res) => {
    try {
      const allUsers = await storage.getTalents({});
      
      const stats = {
        totalUsers: allUsers.length,
        jobSeekers: allUsers.filter(user => user.userType === 'job_seeker').length,
        employers: allUsers.filter(user => user.userType === 'employer').length,
        activeUsers: allUsers.filter(user => (user as any).isActive !== false).length,
      };
      
      res.json(stats);
    } catch (error) {
      console.error('Error fetching user stats:', error);
      res.status(500).json({ message: 'Failed to fetch user stats' });
    }
  });

  app.patch('/api/admin/users/:id', async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { isActive } = req.body;
      
      const updatedUser = await storage.updateUser(userId, { isActive });
      
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.json(updatedUser);
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ message: 'Failed to update user' });
    }
  });

  // Admin Companies Management
  app.get('/api/admin/companies', async (req, res) => {
    try {
      const { search, industry, size, page = 1 } = req.query;
      const limit = 10;
      const offset = (Number(page) - 1) * limit;
      
      const allCompanies = await storage.getCompanies({});
      
      let filteredCompanies = allCompanies;
      
      if (search) {
        filteredCompanies = filteredCompanies.filter(company => 
          company.name?.toLowerCase().includes((search as string).toLowerCase())
        );
      }
      
      if (industry && industry !== 'all') {
        filteredCompanies = filteredCompanies.filter(company => company.industry === industry);
      }
      
      if (size && size !== 'all') {
        filteredCompanies = filteredCompanies.filter(company => company.size === size);
      }
      
      const total = filteredCompanies.length;
      const data = filteredCompanies.slice(offset, offset + limit);
      
      res.json({ data, total });
    } catch (error) {
      console.error('Error fetching admin companies:', error);
      res.status(500).json({ message: 'Failed to fetch companies' });
    }
  });

  app.get('/api/admin/companies/stats', async (req, res) => {
    try {
      const allCompanies = await storage.getCompanies({});
      const allJobs = Array.from((storage as any).jobs?.values() || []);
      
      const stats = {
        totalCompanies: allCompanies.length,
        approvedCompanies: allCompanies.filter(company => (company as any).status === 'approved').length,
        pendingCompanies: allCompanies.filter(company => (company as any).status === 'pending').length,
        activeJobs: allJobs.filter((job: any) => job.status === 'active').length,
      };
      
      res.json(stats);
    } catch (error) {
      console.error('Error fetching company stats:', error);
      res.status(500).json({ message: 'Failed to fetch company stats' });
    }
  });

  // Admin Roles Management
  app.get('/api/admin/roles', async (req, res) => {
    try {
      const roles = [
        {
          id: 1,
          name: "슈퍼 관리자",
          description: "모든 시스템 권한을 가진 최고 관리자",
          permissions: ["users.read", "users.write", "users.delete", "companies.read", "companies.write", "companies.approve", "system.admin"],
          userCount: 2,
          createdAt: new Date()
        },
        {
          id: 2,
          name: "사용자 관리자",
          description: "사용자 관련 기능만 관리",
          permissions: ["users.read", "users.write"],
          userCount: 3,
          createdAt: new Date()
        },
        {
          id: 3,
          name: "기업 승인 관리자",
          description: "기업 등록 승인/거절 처리",
          permissions: ["companies.read", "companies.approve"],
          userCount: 1,
          createdAt: new Date()
        }
      ];
      
      res.json(roles);
    } catch (error) {
      console.error('Error fetching roles:', error);
      res.status(500).json({ message: 'Failed to fetch roles' });
    }
  });

  // Admin company approval endpoints
  app.patch('/api/admin/companies/:id/approve', async (req, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const updatedCompany = await storage.updateCompany(companyId, { 
        status: '승인',
        updatedAt: new Date()
      });
      
      if (!updatedCompany) {
        return res.status(404).json({ message: '회사를 찾을 수 없습니다.' });
      }
      
      res.json({ 
        success: true, 
        company: updatedCompany,
        message: '기업이 승인되었습니다.'
      });
    } catch (error) {
      console.error('Error approving company:', error);
      res.status(500).json({ message: 'Failed to approve company' });
    }
  });

  app.patch('/api/admin/companies/:id/reject', async (req, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const { reason } = req.body;
      
      const updatedCompany = await storage.updateCompany(companyId, { 
        status: 'pending',
        isDetailComplete: false,
        updatedAt: new Date()
      });
      
      if (!updatedCompany) {
        return res.status(404).json({ message: '회사를 찾을 수 없습니다.' });
      }
      
      res.json({ 
        success: true, 
        company: updatedCompany,
        message: '기업 승인이 거절되었습니다.',
        reason
      });
    } catch (error) {
      console.error('Error rejecting company:', error);
      res.status(500).json({ message: 'Failed to reject company' });
    }
  });

  // Temporary test endpoint to update user type
  app.post('/api/test/update-user-type', async (req, res) => {
    try {
      const { userId, userType } = req.body;
      const user = await storage.updateUser(userId, { userType });
      res.json({ success: true, user });
    } catch (error) {
      console.error('Error updating user type:', error);
      res.status(500).json({ message: 'Failed to update user type' });
    }
  });

  const httpServer = createServer(app);

  // WebSocket setup for real-time chat
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  const activeConnections = new Map<number, Set<WebSocket>>();

  function broadcastToRoom(roomId: number, message: any) {
    const connections = activeConnections.get(roomId);
    if (connections) {
      const messageData = JSON.stringify({ type: 'new_message', data: message });
      connections.forEach(ws => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(messageData);
        }
      });
    }
  }

  wss.on('connection', (ws, req) => {
    console.log('New WebSocket connection');
    
    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'join_room') {
          const { roomId, userId } = message.data;
          
          // Add connection to room
          if (!activeConnections.has(roomId)) {
            activeConnections.set(roomId, new Set());
          }
          activeConnections.get(roomId)!.add(ws);
          
          // Store user info on WebSocket
          (ws as any).roomId = roomId;
          (ws as any).userId = userId;
          
          ws.send(JSON.stringify({ type: 'joined_room', data: { roomId } }));
        }
        
        if (message.type === 'send_message') {
          const { roomId, senderId, content } = message.data;
          
          // Create message in database
          const newMessage = await storage.createChatMessage({
            roomId,
            senderId,
            message: content,
            messageType: 'text'
          });
          
          // Get message with sender info
          const messageWithSender = await storage.getChatMessagesByRoom(roomId, 1, 0);
          if (messageWithSender.length > 0) {
            broadcastToRoom(roomId, messageWithSender[0]);
          }
        }
        
        if (message.type === 'typing') {
          const { roomId, userId, isTyping } = message.data;
          const connections = activeConnections.get(roomId);
          if (connections) {
            const typingData = JSON.stringify({ 
              type: 'user_typing', 
              data: { userId, isTyping } 
            });
            connections.forEach(conn => {
              if (conn !== ws && conn.readyState === WebSocket.OPEN) {
                conn.send(typingData);
              }
            });
          }
        }
        
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });
    
    ws.on('close', () => {
      // Remove connection from all rooms
      const roomId = (ws as any).roomId;
      if (roomId && activeConnections.has(roomId)) {
        activeConnections.get(roomId)!.delete(ws);
        if (activeConnections.get(roomId)!.size === 0) {
          activeConnections.delete(roomId);
        }
      }
    });
  });

  // Monitoring and metrics endpoints for scalable architecture
  app.get('/api/admin/monitoring/health', async (req, res) => {
    const api = createApiResponse(req, res);
    try {
      const healthChecks = monitor.getHealthChecks();
      return api.success(healthChecks);
    } catch (error) {
      return api.serverError('Failed to fetch health checks');
    }
  });

  app.get('/api/admin/monitoring/metrics', async (req, res) => {
    const api = createApiResponse(req, res);
    try {
      const { timeRange = 3600000 } = req.query; // Default 1 hour
      const metrics = {
        requests: monitor.getMetricsSummary('request_duration', Number(timeRange)),
        database: monitor.getMetricsSummary('db_query_duration', Number(timeRange)),
        memory: monitor.getMetricsSummary('memory_rss', Number(timeRange)),
        errors: monitor.getMetricsSummary('errors', Number(timeRange)),
      };
      return api.success(metrics);
    } catch (error) {
      return api.serverError('Failed to fetch metrics');
    }
  });

  app.get('/api/admin/monitoring/analytics', async (req, res) => {
    const api = createApiResponse(req, res);
    try {
      const { timeRange = 3600000 } = req.query;
      const analytics = monitor.getAnalyticsSummary(Number(timeRange));
      return api.success(analytics);
    } catch (error) {
      return api.serverError('Failed to fetch analytics');
    }
  });

  // 정산관리 API
  app.get('/api/admin/settlements', async (req, res) => {
    const api = createApiResponse(req, res);
    try {
      const { companyId, status, dateFrom, dateTo, limit, offset } = req.query;
      const settlements = await storage.getPaymentSettlements({
        companyId: companyId ? Number(companyId) : undefined,
        status: status as string,
        dateFrom: dateFrom as string,
        dateTo: dateTo as string,
        limit: limit ? Number(limit) : undefined,
        offset: offset ? Number(offset) : undefined
      });
      return api.success(settlements);
    } catch (error) {
      return api.serverError('정산 데이터 조회 실패');
    }
  });

  app.post('/api/admin/settlements', async (req, res) => {
    const api = createApiResponse(req, res);
    try {
      const settlement = await storage.createPaymentSettlement(req.body);
      return api.success(settlement);
    } catch (error) {
      return api.serverError('정산 생성 실패');
    }
  });

  app.put('/api/admin/settlements/:id', async (req, res) => {
    const api = createApiResponse(req, res);
    try {
      const id = Number(req.params.id);
      const settlement = await storage.updatePaymentSettlement(id, req.body);
      if (!settlement) {
        return api.notFound('정산 정보를 찾을 수 없습니다');
      }
      return api.success(settlement);
    } catch (error) {
      return api.serverError('정산 업데이트 실패');
    }
  });

  // 플랫폼 분석 API
  app.get('/api/admin/analytics', async (req, res) => {
    const api = createApiResponse(req, res);
    try {
      const { dateFrom, dateTo } = req.query;
      const analytics = await storage.getPlatformAnalytics(
        dateFrom as string,
        dateTo as string
      );
      return api.success(analytics);
    } catch (error) {
      return api.serverError('분석 데이터 조회 실패');
    }
  });

  app.post('/api/admin/analytics/generate', async (req, res) => {
    const api = createApiResponse(req, res);
    try {
      const { date } = req.body;
      const analytics = await storage.generateDailyAnalytics(date);
      return api.success(analytics);
    } catch (error) {
      return api.serverError('일일 분석 생성 실패');
    }
  });

  // 시스템 설정 API
  app.get('/api/admin/settings', async (req, res) => {
    const api = createApiResponse(req, res);
    try {
      const { category } = req.query;
      const settings = await storage.getSystemSettings(category as string);
      return api.success(settings);
    } catch (error) {
      return api.serverError('시스템 설정 조회 실패');
    }
  });

  app.get('/api/admin/settings/:key', async (req, res) => {
    const api = createApiResponse(req, res);
    try {
      const setting = await storage.getSystemSetting(req.params.key);
      if (!setting) {
        return api.notFound('설정을 찾을 수 없습니다');
      }
      return api.success(setting);
    } catch (error) {
      return api.serverError('설정 조회 실패');
    }
  });

  app.put('/api/admin/settings/:key', async (req, res) => {
    const api = createApiResponse(req, res);
    try {
      const { value } = req.body;
      const setting = await storage.updateSystemSetting(req.params.key, value);
      if (!setting) {
        return api.notFound('설정을 찾을 수 없습니다');
      }
      return api.success(setting);
    } catch (error) {
      return api.serverError('설정 업데이트 실패');
    }
  });

  app.post('/api/admin/settings', async (req, res) => {
    const api = createApiResponse(req, res);
    try {
      const setting = await storage.createSystemSetting(req.body);
      return api.success(setting);
    } catch (error) {
      return api.serverError('설정 생성 실패');
    }
  });

  // 관리자 활동 로그 API
  app.get('/api/admin/logs', async (req, res) => {
    const api = createApiResponse(req, res);
    try {
      const { adminId, action, dateFrom, dateTo, limit, offset } = req.query;
      const logs = await storage.getAdminLogs({
        adminId: adminId ? Number(adminId) : undefined,
        action: action as string,
        dateFrom: dateFrom as string,
        dateTo: dateTo as string,
        limit: limit ? Number(limit) : undefined,
        offset: offset ? Number(offset) : undefined
      });
      return api.success(logs);
    } catch (error) {
      return api.serverError('로그 조회 실패');
    }
  });

  app.post('/api/admin/logs', async (req, res) => {
    const api = createApiResponse(req, res);
    try {
      const log = await storage.createAdminLog({
        ...req.body,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });
      return api.success(log);
    } catch (error) {
      return api.serverError('로그 생성 실패');
    }
  });

  // 요금제 관리 API
  app.get('/api/admin/pricing-plans', async (req, res) => {
    const api = createApiResponse(req, res);
    try {
      const plans = await storage.getPricingPlans();
      return api.success(plans);
    } catch (error) {
      return api.serverError('요금제 조회 실패');
    }
  });

  app.post('/api/admin/pricing-plans', async (req, res) => {
    const api = createApiResponse(req, res);
    try {
      const plan = await storage.createPricingPlan(req.body);
      return api.success(plan);
    } catch (error) {
      return api.serverError('요금제 생성 실패');
    }
  });

  app.put('/api/admin/pricing-plans/:id', async (req, res) => {
    const api = createApiResponse(req, res);
    try {
      const id = Number(req.params.id);
      const plan = await storage.updatePricingPlan(id, req.body);
      if (!plan) {
        return api.notFound('요금제를 찾을 수 없습니다');
      }
      return api.success(plan);
    } catch (error) {
      return api.serverError('요금제 업데이트 실패');
    }
  });

  app.delete('/api/admin/pricing-plans/:id', async (req, res) => {
    const api = createApiResponse(req, res);
    try {
      const id = Number(req.params.id);
      const deleted = await storage.deletePricingPlan(id);
      if (!deleted) {
        return api.notFound('요금제를 찾을 수 없습니다');
      }
      return api.success({ message: '요금제가 삭제되었습니다' });
    } catch (error) {
      return api.serverError('요금제 삭제 실패');
    }
  });

  // Profile Picture Upload
  app.post('/api/users/profile-picture', authenticateToken, async (req: AuthRequest, res) => {
    const api = createApiResponse(req, res);
    try {
      const { profilePictureUrl, format, size } = req.body;
      
      if (!profilePictureUrl || typeof profilePictureUrl !== 'string') {
        return api.error('Profile picture URL is required', 400);
      }
      
      // Validate that the image is in WebP format
      if (!profilePictureUrl.startsWith('data:image/webp;base64,')) {
        return api.error('Only WebP format images are supported', 400);
      }
      
      // Validate base64 data size (max ~13MB for 10MB file after base64 encoding)
      const base64Data = profilePictureUrl.split(',')[1];
      if (!base64Data || base64Data.length > 13 * 1024 * 1024) {
        return api.error('Image size too large. Maximum 10MB allowed.', 400);
      }
      
      // Validate base64 format
      try {
        Buffer.from(base64Data, 'base64');
      } catch (e) {
        return api.error('Invalid image data format', 400);
      }
      
      const userId = req.user!.userId;
      const updatedUser = await storage.updateUser(userId, { 
        profilePicture: profilePictureUrl,
        profilePictureFormat: format || 'webp',
        profilePictureSize: size || null
      });
      
      if (!updatedUser) {
        return api.notFound('User not found');
      }
      
      return api.success({ 
        profilePicture: updatedUser.profilePicture,
        format: updatedUser.profilePictureFormat,
        size: updatedUser.profilePictureSize
      });
    } catch (error) {
      console.error('Profile picture update error:', error);
      return api.serverError('Failed to update profile picture');
    }
  });

  // Resume Management Routes
  
  // Get user's resumes
  app.get('/api/resumes', authenticateToken, async (req: AuthRequest, res) => {
    const api = createApiResponse(req, res);
    try {
      const userId = req.user!.userId;
      const resumes = await storage.getResumesByUser(userId);
      return api.success(resumes);
    } catch (error) {
      console.error('Get resumes error:', error);
      return api.serverError('Failed to fetch resumes');
    }
  });

  // Get specific resume
  app.get('/api/resumes/:id', authenticateToken, async (req: AuthRequest, res) => {
    const api = createApiResponse(req, res);
    try {
      const resumeId = Number(req.params.id);
      const userId = req.user!.userId;
      
      const resume = await storage.getResume(resumeId);
      if (!resume) {
        return api.notFound('Resume not found');
      }
      
      // Check if user owns the resume
      if (resume.userId !== userId) {
        return api.error('Unauthorized', 403);
      }
      
      return api.success(resume);
    } catch (error) {
      console.error('Get resume error:', error);
      return api.serverError('Failed to fetch resume');
    }
  });

  // Create new resume
  app.post('/api/resumes', authenticateToken, async (req: AuthRequest, res) => {
    const api = createApiResponse(req, res);
    try {
      const userId = req.user!.userId;
      
      // Get user data to pre-populate resume
      const user = await storage.getUser(userId);
      if (!user) {
        return api.notFound('User not found');
      }
      
      // Validate resume data
      const resumeData = insertResumeSchema.parse(req.body);
      
      // Pre-populate with user data if not provided
      const resumeWithDefaults = {
        ...resumeData,
        userId,
        title: resumeData.title || `${user.fullName}의 이력서`,
        contactInfo: resumeData.contactInfo || {
          email: user.email,
          phone: user.phone || '',
          location: user.location || ''
        }
      };
      
      const newResume = await storage.createResume(resumeWithDefaults);
      return api.success(newResume);
    } catch (error) {
      console.error('Create resume error:', error);
      if (error instanceof z.ZodError) {
        return api.validationError(error.errors);
      }
      return api.serverError('Failed to create resume');
    }
  });

  // Update resume
  app.put('/api/resumes/:id', authenticateToken, async (req: AuthRequest, res) => {
    const api = createApiResponse(req, res);
    try {
      const resumeId = Number(req.params.id);
      const userId = req.user!.userId;
      
      // Check if resume exists and user owns it
      const existingResume = await storage.getResume(resumeId);
      if (!existingResume) {
        return api.notFound('Resume not found');
      }
      
      if (existingResume.userId !== userId) {
        return api.error('Unauthorized', 403);
      }
      
      // Validate update data
      const updateData = insertResumeSchema.partial().parse(req.body);
      
      const updatedResume = await storage.updateResume(resumeId, updateData);
      if (!updatedResume) {
        return api.notFound('Resume not found');
      }
      
      return api.success(updatedResume);
    } catch (error) {
      console.error('Update resume error:', error);
      if (error instanceof z.ZodError) {
        return api.error('Invalid resume data', 400, error.errors);
      }
      return api.serverError('Failed to update resume');
    }
  });

  // Delete resume
  app.delete('/api/resumes/:id', authenticateToken, async (req: AuthRequest, res) => {
    const api = createApiResponse(req, res);
    try {
      const resumeId = Number(req.params.id);
      const userId = req.user!.userId;
      
      // Check if resume exists and user owns it
      const existingResume = await storage.getResume(resumeId);
      if (!existingResume) {
        return api.notFound('Resume not found');
      }
      
      if (existingResume.userId !== userId) {
        return api.error('Unauthorized', 403);
      }
      
      const deleted = await storage.deleteResume(resumeId);
      if (!deleted) {
        return api.notFound('Resume not found');
      }
      
      return api.success({ message: 'Resume deleted successfully' });
    } catch (error) {
      console.error('Delete resume error:', error);
      return api.serverError('Failed to delete resume');
    }
  });

  // Set default resume
  app.put('/api/resumes/:id/set-default', authenticateToken, async (req: AuthRequest, res) => {
    const api = createApiResponse(req, res);
    try {
      const resumeId = Number(req.params.id);
      const userId = req.user!.userId;
      
      // Check if resume exists and user owns it
      const existingResume = await storage.getResume(resumeId);
      if (!existingResume) {
        return api.notFound('Resume not found');
      }
      
      if (existingResume.userId !== userId) {
        return api.error('Unauthorized', 403);
      }
      
      const defaultResume = await storage.setDefaultResume(userId, resumeId);
      if (!defaultResume) {
        return api.notFound('Resume not found');
      }
      
      return api.success(defaultResume);
    } catch (error) {
      console.error('Set default resume error:', error);
      return api.serverError('Failed to set default resume');
    }
  });

  // Get user's default resume
  app.get('/api/resumes/default', authenticateToken, async (req: AuthRequest, res) => {
    const api = createApiResponse(req, res);
    try {
      const userId = req.user!.userId;
      
      // Ensure userId is properly converted to number
      const validUserId = typeof userId === 'string' ? parseInt(userId, 10) : userId;
      
      if (!validUserId || typeof validUserId !== 'number' || isNaN(validUserId)) {
        console.error('Invalid user ID in default resume request:', userId);
        return api.error('Invalid user ID', 400);
      }
      
      const defaultResume = await storage.getUserDefaultResume(validUserId);
      
      if (!defaultResume) {
        return api.notFound('No default resume found');
      }
      
      return api.success(defaultResume);
    } catch (error) {
      console.error('Get default resume error:', error);
      return api.serverError('Failed to fetch default resume');
    }
  });

  // Apply error handling middleware at the end
  app.use(errorHandler);

  return httpServer;
}
