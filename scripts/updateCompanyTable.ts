#!/usr/bin/env tsx
import { Pool } from 'pg';

// Primary DB config
const DB_CONFIG = {
  host: '192.168.0.171',
  port: 5432,
  database: 'jobmongolia',
  user: 'jobmongolia_user',
  password: 'JobMongolia2025R5',
  ssl: false
};

// Fallback DB config
const FALLBACK_CONFIG = {
  host: '203.23.49.100',
  port: 5432,
  database: 'jobmongolia',
  user: 'jobmongolia_user',
  password: 'JobMongolia2025R5',
  ssl: false
};

async function updateCompanySchema() {
  console.log('🔄 기업 정보 테이블 스키마 업데이트 시작...');
  
  const queries = [
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

  // Try primary server first
  let pool = new Pool(DB_CONFIG);
  
  try {
    await pool.query('SELECT 1');
    console.log('✅ Primary DB 연결 성공 (192.168.0.171)');
    
    for (let i = 0; i < queries.length; i++) {
      const query = queries[i];
      console.log(`📝 실행 중 (${i + 1}/${queries.length}): ${query}`);
      await pool.query(query);
      console.log(`✅ 완료`);
    }
    
    console.log('🎉 DB 스키마 업데이트 성공적으로 완료!');
    
  } catch (error: any) {
    console.log(`❌ Primary DB 실패: ${error.message}`);
    console.log('🔄 Fallback DB로 시도 중...');
    
    await pool.end();
    pool = new Pool(FALLBACK_CONFIG);
    
    try {
      await pool.query('SELECT 1');
      console.log('✅ Fallback DB 연결 성공 (203.23.49.100)');
      
      for (let i = 0; i < queries.length; i++) {
        const query = queries[i];
        console.log(`📝 실행 중 (${i + 1}/${queries.length}): ${query}`);
        await pool.query(query);
        console.log(`✅ 완료`);
      }
      
      console.log('🎉 DB 스키마 업데이트 성공적으로 완료! (Fallback 서버)');
      
    } catch (fallbackError: any) {
      console.error('❌ Fallback DB도 실패:', fallbackError.message);
      throw fallbackError;
    }
  } finally {
    await pool.end();
    console.log('🔌 DB 연결 종료');
  }
}

// 컬럼 존재 여부 확인
async function checkColumns() {
  console.log('\n📋 업데이트된 컬럼 확인 중...');
  
  let pool: Pool;
  try {
    pool = new Pool(DB_CONFIG);
    await pool.query('SELECT 1');
    console.log('✅ 확인용 DB 연결 성공');
  } catch (error) {
    console.log('Primary DB 연결 실패, Fallback 시도...');
    pool = new Pool(FALLBACK_CONFIG);
    await pool.query('SELECT 1');
    console.log('✅ Fallback DB 연결 성공');
  }
  
  try {
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'companies' 
      AND column_name IN ('logo_format', 'logo_size', 'email', 'phone', 'address', 'linkedin', 'facebook', 'twitter', 'instagram', 'mission', 'vision', 'values')
      ORDER BY column_name;
    `);
    
    console.log('\n📊 추가된 컬럼들:');
    console.log('='.repeat(80));
    result.rows.forEach(row => {
      console.log(`📌 ${row.column_name} | ${row.data_type} | Nullable: ${row.is_nullable} | Default: ${row.column_default || 'NULL'}`);
    });
    console.log('='.repeat(80));
    console.log(`✅ 총 ${result.rows.length}개 컬럼이 성공적으로 추가됨`);
    
  } catch (error: any) {
    console.error('❌ 컬럼 확인 실패:', error.message);
  } finally {
    await pool.end();
  }
}

async function main() {
  try {
    await updateCompanySchema();
    await checkColumns();
    
    console.log('\n🎯 이제 다음을 확인해보세요:');
    console.log('1. 플랫폼 재시작: npm run dev');
    console.log('2. /company/info 페이지에서 기업 정보 편집 테스트');
    console.log('3. 로고 업로드 및 정보 저장 테스트');
    
  } catch (error: any) {
    console.error('💥 스키마 업데이트 실패:', error.message);
    process.exit(1);
  }
}

main(); 