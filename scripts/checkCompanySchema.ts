#!/usr/bin/env tsx
import { Pool } from 'pg';

const DB_CONFIG = {
  host: '192.168.0.171',
  port: 5432,
  database: 'jobmongolia',
  user: 'jobmongolia_user',
  password: 'JobMongolia2025R5',
  ssl: false
};

const FALLBACK_CONFIG = {
  host: '203.23.49.100',
  port: 5432,
  database: 'jobmongolia',
  user: 'jobmongolia_user',
  password: 'JobMongolia2025R5',
  ssl: false
};

async function checkCompanySchema() {
  console.log('🔍 companies 테이블 스키마 확인 중...\n');
  
  let pool: Pool;
  try {
    pool = new Pool(DB_CONFIG);
    await pool.query('SELECT 1');
    console.log('✅ Primary DB 연결 성공 (192.168.0.171)');
  } catch (error) {
    console.log('Primary DB 연결 실패, Fallback 시도...');
    pool = new Pool(FALLBACK_CONFIG);
    await pool.query('SELECT 1');
    console.log('✅ Fallback DB 연결 성공 (203.23.49.100)');
  }
  
  try {
    // 모든 컬럼 조회
    const result = await pool.query(`
      SELECT 
        column_name, 
        data_type, 
        is_nullable, 
        column_default,
        character_maximum_length
      FROM information_schema.columns 
      WHERE table_name = 'companies' 
      ORDER BY ordinal_position;
    `);
    
    console.log('\n📊 companies 테이블 전체 컬럼:');
    console.log('='.repeat(100));
    console.log('컬럼명'.padEnd(25) + '타입'.padEnd(20) + 'Null허용'.padEnd(10) + '기본값');
    console.log('-'.repeat(100));
    
    result.rows.forEach(row => {
      const name = row.column_name.padEnd(25);
      const type = row.data_type.padEnd(20);
      const nullable = row.is_nullable.padEnd(10);
      const defaultVal = (row.column_default || '').substring(0, 30);
      console.log(`${name}${type}${nullable}${defaultVal}`);
    });
    
    console.log('='.repeat(100));
    console.log(`✅ 총 ${result.rows.length}개 컬럼 확인됨\n`);
    
    // 새로 추가된 컬럼들 확인
    const newColumns = [
      'logo_format', 'logo_size', 'email', 'phone', 'address',
      'linkedin', 'facebook', 'twitter', 'instagram',
      'mission', 'vision', 'values'
    ];
    
    const existingNewColumns = result.rows.filter(row => 
      newColumns.includes(row.column_name)
    );
    
    console.log('🆕 새로 추가된 컬럼들:');
    console.log('-'.repeat(60));
    
    if (existingNewColumns.length === 0) {
      console.log('❌ 새로운 컬럼이 하나도 없습니다! DB 업데이트가 필요합니다.');
    } else {
      existingNewColumns.forEach(col => {
        console.log(`✅ ${col.column_name} (${col.data_type})`);
      });
      console.log(`\n✅ ${existingNewColumns.length}/${newColumns.length}개 새 컬럼이 존재합니다.`);
      
      if (existingNewColumns.length < newColumns.length) {
        const missingColumns = newColumns.filter(col => 
          !existingNewColumns.some(existing => existing.column_name === col)
        );
        console.log('\n❌ 누락된 컬럼들:');
        missingColumns.forEach(col => console.log(`   - ${col}`));
      }
    }
    
  } catch (error: any) {
    console.error('❌ 스키마 확인 실패:', error.message);
  } finally {
    await pool.end();
    console.log('\n🔌 DB 연결 종료');
  }
}

async function testCompanyInsert() {
  console.log('\n🧪 companies 테이블 삽입/업데이트 테스트...');
  
  let pool: Pool;
  try {
    pool = new Pool(DB_CONFIG);
    await pool.query('SELECT 1');
  } catch (error) {
    pool = new Pool(FALLBACK_CONFIG);
    await pool.query('SELECT 1');
  }
  
  try {
    // 테스트 회사 존재 여부 확인
    const existingTest = await pool.query(
      "SELECT id FROM companies WHERE name = 'DB_TEST_COMPANY' LIMIT 1"
    );
    
    if (existingTest.rows.length > 0) {
      // 업데이트 테스트
      const testId = existingTest.rows[0].id;
      console.log(`📝 기존 테스트 회사 업데이트 (ID: ${testId})`);
      
      await pool.query(`
        UPDATE companies SET 
          email = 'test@dbcompany.com',
          phone = '+976-1234-5678',
          address = 'Test Address, Ulaanbaatar',
          linkedin = 'https://linkedin.com/company/test',
          mission = 'Test Mission',
          updated_at = NOW()
        WHERE id = $1
      `, [testId]);
      
      console.log('✅ 업데이트 성공');
      
      // 업데이트된 데이터 확인
      const updated = await pool.query(
        "SELECT email, phone, address, linkedin, mission FROM companies WHERE id = $1",
        [testId]
      );
      
      console.log('📊 업데이트된 데이터:');
      console.log(updated.rows[0]);
      
    } else {
      // 새 테스트 회사 생성
      console.log('📝 새 테스트 회사 생성');
      
      const result = await pool.query(`
        INSERT INTO companies (
          name, description, industry, 
          email, phone, address, linkedin, mission
        ) VALUES (
          'DB_TEST_COMPANY', 
          'Database test company', 
          'Technology',
          'test@dbcompany.com',
          '+976-1234-5678',
          'Test Address, Ulaanbaatar',
          'https://linkedin.com/company/test',
          'Test Mission for DB verification'
        ) RETURNING id, name, email
      `);
      
      console.log('✅ 생성 성공:');
      console.log(result.rows[0]);
    }
    
  } catch (error: any) {
    console.error('❌ 테스트 실패:', error.message);
    
    if (error.message.includes('column') && error.message.includes('does not exist')) {
      console.log('\n💡 해결방법: 다음 스크립트를 실행하세요:');
      console.log('   npx tsx scripts/updateCompanyTable.ts');
    }
  } finally {
    await pool.end();
  }
}

async function main() {
  try {
    await checkCompanySchema();
    await testCompanyInsert();
    
    console.log('\n🎯 결론:');
    console.log('1. 스키마 확인이 완료되었습니다.');
    console.log('2. DB 연결이 정상 작동합니다.');
    console.log('3. /company/info 페이지 테스트를 진행하세요.');
    
  } catch (error: any) {
    console.error('💥 전체 프로세스 실패:', error.message);
    process.exit(1);
  }
}

main(); 