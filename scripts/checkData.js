import { Pool } from 'pg';

const pool = new Pool({ 
  connectionString: 'postgresql://jobmongolia_user:JobMongolia2025R5@192.168.0.171:5432/jobmongolia', 
  ssl: false 
});

async function checkData() {
  try {
    const users = await pool.query('SELECT COUNT(*) FROM users');
    const companies = await pool.query('SELECT COUNT(*) FROM companies');
    const jobs = await pool.query('SELECT COUNT(*) FROM jobs');
    const applications = await pool.query('SELECT COUNT(*) FROM applications');
    const chatRooms = await pool.query('SELECT COUNT(*) FROM chat_rooms');
    const companyReviews = await pool.query('SELECT COUNT(*) FROM company_reviews');
    
    console.log('📊 현재 데이터베이스 상태:');
    console.log('   👥 사용자:', users.rows[0].count + '명');
    console.log('   🏢 회사:', companies.rows[0].count + '개');
    console.log('   💼 채용공고:', jobs.rows[0].count + '개');
    console.log('   📄 지원서:', applications.rows[0].count + '개');
    console.log('   💬 채팅방:', chatRooms.rows[0].count + '개');
    console.log('   ⭐ 회사리뷰:', companyReviews.rows[0].count + '개');
    
    // 사용자 타입별 분포
    const userTypes = await pool.query(`
      SELECT user_type, COUNT(*) as count 
      FROM users 
      GROUP BY user_type 
      ORDER BY count DESC
    `);
    
    console.log('\n👥 사용자 타입별 분포:');
    userTypes.rows.forEach(row => {
      console.log(`   ${row.user_type}: ${row.count}명`);
    });
    
    // 채용공고 상태별 분포
    const jobStatuses = await pool.query(`
      SELECT status, COUNT(*) as count 
      FROM jobs 
      GROUP BY status 
      ORDER BY count DESC
    `);
    
    console.log('\n💼 채용공고 상태별 분포:');
    jobStatuses.rows.forEach(row => {
      console.log(`   ${row.status}: ${row.count}개`);
    });
    
    // 지원서 상태별 분포
    const appStatuses = await pool.query(`
      SELECT status, COUNT(*) as count 
      FROM applications 
      GROUP BY status 
      ORDER BY count DESC
    `);
    
    console.log('\n📄 지원서 상태별 분포:');
    appStatuses.rows.forEach(row => {
      console.log(`   ${row.status}: ${row.count}개`);
    });
    
  } catch (error) {
    console.error('❌ 데이터 확인 실패:', error);
  } finally {
    await pool.end();
  }
}

checkData(); 