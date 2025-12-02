-- Performance indexes for large-scale deployment (10,000+ companies, 1,000,000+ users)
-- These indexes are optimized for the most common query patterns

-- Core user indexes for authentication and profile lookups
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_user_type ON users(user_type);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_active_type ON users(is_active, user_type);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_location ON users(location) WHERE location IS NOT NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_skills ON users USING GIN(skills) WHERE skills IS NOT NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_created_at ON users(created_at DESC);

-- Company indexes for search and filtering
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_companies_name ON companies(name);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_companies_status ON companies(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_companies_industry ON companies(industry) WHERE industry IS NOT NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_companies_location ON companies(location) WHERE location IS NOT NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_companies_size ON companies(size) WHERE size IS NOT NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_companies_active_industry ON companies(status, industry) WHERE status = 'active';
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_companies_created_at ON companies(created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_companies_name_search ON companies USING GIN(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- Job indexes for search performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_jobs_company_id ON jobs(company_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_jobs_active_company ON jobs(status, company_id) WHERE status = 'active';
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_jobs_industry ON jobs(industry) WHERE industry IS NOT NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_jobs_location ON jobs(location) WHERE location IS NOT NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_jobs_work_type ON jobs(work_type) WHERE work_type IS NOT NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_jobs_experience ON jobs(experience) WHERE experience IS NOT NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_jobs_salary_range ON jobs(salary_min, salary_max) WHERE salary_min IS NOT NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_jobs_created_at ON jobs(created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_jobs_views ON jobs(views DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_jobs_featured ON jobs(is_featured, created_at DESC) WHERE is_featured = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_jobs_search ON jobs USING GIN(to_tsvector('english', title || ' ' || description));

-- Application indexes for tracking
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_applications_user_id ON applications(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_applications_job_id ON applications(job_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_applications_user_status ON applications(user_id, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_applications_job_status ON applications(job_id, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_applications_created_at ON applications(created_at DESC);

-- Saved jobs indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_saved_jobs_user_id ON saved_jobs(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_saved_jobs_job_id ON saved_jobs(job_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_saved_jobs_user_job ON saved_jobs(user_id, job_id);

-- Chat indexes for real-time messaging
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_chat_rooms_participants ON chat_rooms USING GIN(participants);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_chat_rooms_created_at ON chat_rooms(created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_chat_messages_room_id ON chat_messages(room_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_chat_messages_sender_id ON chat_messages(sender_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_chat_messages_room_created ON chat_messages(room_id, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_chat_messages_is_read ON chat_messages(is_read, room_id) WHERE is_read = false;

-- Company users relationship
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_company_users_user_id ON company_users(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_company_users_company_id ON company_users(company_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_company_users_role ON company_users(role);

-- Employment history for profile completeness
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_employment_history_user_id ON employment_history(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_employment_history_company_id ON employment_history(company_id) WHERE company_id IS NOT NULL;

-- Company reviews for reputation
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_company_reviews_company_id ON company_reviews(company_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_company_reviews_user_id ON company_reviews(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_company_reviews_rating ON company_reviews(rating DESC);

-- Evaluations for AI matching
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_evaluations_user_id ON evaluations(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_evaluations_created_at ON evaluations(created_at DESC);

-- Admin and system indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_admin_activity_logs_admin_id ON admin_activity_logs(admin_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_admin_activity_logs_action ON admin_activity_logs(action);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_admin_activity_logs_created_at ON admin_activity_logs(created_at DESC);

-- Subscription and payment indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subscriptions_active ON subscriptions(user_id, status) WHERE status = 'active';
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payment_settlements_subscription_id ON payment_settlements(subscription_id);

-- Composite indexes for complex queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_jobs_active_search ON jobs(status, industry, location, work_type) WHERE status = 'active';
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_candidate_profile ON users(user_type, is_active, experience, location) WHERE user_type = 'candidate';
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_companies_active_profile ON companies(status, industry, size, location) WHERE status = 'active';

-- Performance monitoring views
CREATE OR REPLACE VIEW performance_stats AS
SELECT 
    schemaname,
    tablename,
    n_tup_ins as inserts,
    n_tup_upd as updates,
    n_tup_del as deletes,
    n_live_tup as live_tuples,
    n_dead_tup as dead_tuples,
    last_vacuum,
    last_autovacuum,
    last_analyze,
    last_autoanalyze
FROM pg_stat_user_tables 
ORDER BY n_live_tup DESC;

CREATE OR REPLACE VIEW index_usage_stats AS
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch,
    CASE 
        WHEN idx_scan = 0 THEN 'Never used'
        WHEN idx_scan < 100 THEN 'Low usage'
        WHEN idx_scan < 1000 THEN 'Medium usage'
        ELSE 'High usage'
    END as usage_level
FROM pg_stat_user_indexes 
ORDER BY idx_scan DESC;

-- Auto-vacuum and analyze settings for high-traffic tables
ALTER TABLE users SET (autovacuum_vacuum_scale_factor = 0.1);
ALTER TABLE jobs SET (autovacuum_vacuum_scale_factor = 0.1);
ALTER TABLE companies SET (autovacuum_vacuum_scale_factor = 0.1);
ALTER TABLE applications SET (autovacuum_vacuum_scale_factor = 0.05);
ALTER TABLE chat_messages SET (autovacuum_vacuum_scale_factor = 0.05);

-- Statistics targets for better query planning
ALTER TABLE users ALTER COLUMN user_type SET STATISTICS 1000;
ALTER TABLE users ALTER COLUMN location SET STATISTICS 1000;
ALTER TABLE jobs ALTER COLUMN industry SET STATISTICS 1000;
ALTER TABLE jobs ALTER COLUMN location SET STATISTICS 1000;
ALTER TABLE companies ALTER COLUMN industry SET STATISTICS 1000;

-- Connection and query optimization settings
-- These should be set in postgresql.conf for production:
-- shared_buffers = 1GB (25% of RAM for dedicated DB server)
-- effective_cache_size = 3GB (75% of RAM)
-- work_mem = 16MB
-- maintenance_work_mem = 256MB
-- checkpoint_completion_target = 0.9
-- wal_buffers = 16MB
-- default_statistics_target = 1000
-- random_page_cost = 1.1 (for SSD)

COMMENT ON VIEW performance_stats IS 'Real-time table performance statistics for monitoring';
COMMENT ON VIEW index_usage_stats IS 'Index usage statistics for optimization analysis';