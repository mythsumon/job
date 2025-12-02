import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../shared/schema";

// 임시로 DATABASE_URL 하드코딩
const DATABASE_URL = process.env.DATABASE_URL || "postgresql://jobmongolia_user:JobMongolia2025R5@203.23.49.100:5432/jobmongolia";

export const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: false,
});

export const db = drizzle(pool, { schema });

// DB 연결 테스트 함수
export async function testDbConnection() {
  try {
    const res = await pool.query('SELECT 1');
    console.log('✅ DB 연결 성공:', res.rows);
    
    // 자동 스키마 업데이트
    await autoUpdateCompaniesSchema();
    
    return true;
  } catch (err) {
    console.error('❌ DB 연결 실패:', err);
    return false;
  }
}

// companies 테이블 스키마 자동 업데이트
async function autoUpdateCompaniesSchema() {
  console.log('🔄 companies 테이블 스키마 업데이트 확인 중...');
  
  const updates = [
    'ALTER TABLE companies ADD COLUMN IF NOT EXISTS logo_format TEXT DEFAULT \'webp\';',
    'ALTER TABLE companies ADD COLUMN IF NOT EXISTS logo_size INTEGER;',
    'ALTER TABLE companies ADD COLUMN IF NOT EXISTS email TEXT;',
    'ALTER TABLE companies ADD COLUMN IF NOT EXISTS phone TEXT;',
    'ALTER TABLE companies ADD COLUMN IF NOT EXISTS address TEXT;',
    'ALTER TABLE companies ADD COLUMN IF NOT EXISTS linkedin TEXT;',
    'ALTER TABLE companies ADD COLUMN IF NOT EXISTS facebook TEXT;',
    'ALTER TABLE companies ADD COLUMN IF NOT EXISTS twitter TEXT;',
    'ALTER TABLE companies ADD COLUMN IF NOT EXISTS instagram TEXT;',
    'ALTER TABLE companies ADD COLUMN IF NOT EXISTS mission TEXT;',
    'ALTER TABLE companies ADD COLUMN IF NOT EXISTS vision TEXT;',
    'ALTER TABLE companies ADD COLUMN IF NOT EXISTS values JSONB;'
  ];

  try {
    for (let i = 0; i < updates.length; i++) {
      await pool.query(updates[i]);
    }
    
    console.log('✅ companies 테이블 스키마 업데이트 완료');
    
    // 업데이트 확인
    const result = await pool.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'companies' 
      AND column_name IN ('logo_format', 'email', 'phone', 'mission')
    `);
    
    console.log(`📊 확인된 새 컬럼: ${result.rows.length}개`);
    result.rows.forEach(row => console.log(`  - ${row.column_name}`));
    
  } catch (error: any) {
    console.error('⚠️ 스키마 업데이트 중 오류 (무시됨):', error.message);
  }
}