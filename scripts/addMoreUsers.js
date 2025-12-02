import 'dotenv/config';
import { Pool } from 'pg';

const DATABASE_URL = process.env.DATABASE_URL || "postgresql://jobmongolia_user:JobMongolia2025R5@192.168.0.171:5432/jobmongolia";

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: false,
});

// 몽골어 이름
const mongolianNames = [
  "Батбаяр", "Энхбаяр", "Төмөрбаатар", "Ганбаатар", "Мөнхбаяр",
  "Алтанцэцэг", "Цэцэгмаа", "Ундрамаа", "Оюунцэцэг", "Сарангэрэл",
  "Болдбаатар", "Жавхлан", "Мөнхтөгс", "Амарсайхан", "Баярсайхан",
  "Пүрэвдорж", "Оюунбилэг", "Батжаргал", "Энхтөгс", "Мөнхзул"
];

async function addMoreUsers() {
  console.log('🧑‍💼 추가 사용자 100명 생성 중...');
  
  for (let i = 100; i < 200; i++) {
    try {
      const userType = Math.random() > 0.5 ? 'candidate' : 'employer';
      const username = `jobuser_${i}_${Math.random().toString(36).substring(7)}`;
      const email = `jobuser${i}@jobmongol.mn`;
      const fullName = mongolianNames[Math.floor(Math.random() * mongolianNames.length)];
      const role = 'user';
      
      await pool.query(`
        INSERT INTO users (username, password, email, full_name, user_type, role, 
                           location, phone, bio, skills, experience, education, is_active, 
                           created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        ON CONFLICT (email) DO NOTHING
      `, [
        username, 'password123', email, fullName, userType, role,
        'Улаанбаатар', '+976 9999 0000', '몽골 구직자입니다.', 
        '["JavaScript", "React", "Node.js"]', '3년', '몽골국립대학교', 
        true, new Date(), new Date()
      ]);
      
      if (i % 20 === 0) {
        console.log(`${i}명 완료...`);
      }
    } catch (error) {
      console.log(`사용자 ${i} 생성 실패:`, error.message);
    }
  }
  
  console.log('✅ 추가 사용자 100명 생성 완료');
}

async function addCompanies() {
  console.log('🏢 회사 30개 생성 중...');
  
  const mongolianCompanies = [
    "Монгол Банк", "Говь Корпораци", "Эрдэнэт Үйлдвэр", "Тавантолгой ХХК",
    "Оюу Толгой", "Мобиком Корпораци", "Юнител ХХК", "Скайтел ХХК",
    "Монгол Пост", "Хаан Банк", "Голомт Банк", "Капитрон Банк",
    "Нэмэгт Шахмал", "Монгол Алт", "Петровис ХХК", "МАК ХХК"
  ];
  
  for (let i = 0; i < 30; i++) {
    try {
      const name = `${mongolianCompanies[i % mongolianCompanies.length]} ${i}`;
      const size = ['1-10', '11-50', '51-200', '201-500', '500+'][Math.floor(Math.random() * 5)];
      const industry = ['Technology', 'Finance', 'Healthcare', 'Education', 'Manufacturing'][Math.floor(Math.random() * 5)];
      
      await pool.query(`
        INSERT INTO companies (name, logo, size, status, description, industry, location, 
                              culture, benefits, website, founded, employee_count, 
                              is_detail_complete, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      `, [
        name, 'https://via.placeholder.com/150', size, 'approved', 
        '몽골의 선도적인 기업입니다.', industry, 'Улаанбаатар', 
        '혁신적이고 창의적인 기업문화', '{"원격 근무","유연한 근무시간","유급 휴가"}', 
        'https://example.com', 2000, 100, true, new Date(), new Date()
      ]);
      
      if (i % 10 === 0) {
        console.log(`${i}개 완료...`);
      }
    } catch (error) {
      console.log(`회사 ${i} 생성 실패:`, error.message);
    }
  }
  
  console.log('✅ 회사 30개 생성 완료');
}

async function addApplications() {
  console.log('📄 지원서 200개 생성 중...');
  
  // 기존 사용자와 채용공고 ID 가져오기
  const candidatesResult = await pool.query("SELECT id FROM users WHERE user_type = 'candidate' LIMIT 50");
  const jobsResult = await pool.query('SELECT id FROM jobs LIMIT 100');
  
  const candidateIds = candidatesResult.rows.map(row => row.id);
  const jobIds = jobsResult.rows.map(row => row.id);
  
  console.log(`구직자 ${candidateIds.length}명, 채용공고 ${jobIds.length}개 발견`);
  
  for (let i = 0; i < 200; i++) {
    try {
      if (candidateIds.length === 0 || jobIds.length === 0) {
        console.log('구직자 또는 채용공고가 없습니다.');
        break;
      }
      
      const candidateId = candidateIds[Math.floor(Math.random() * candidateIds.length)];
      const jobId = jobIds[Math.floor(Math.random() * jobIds.length)];
      const status = ['pending', 'reviewing', 'interview', 'accepted', 'rejected'][Math.floor(Math.random() * 5)];
      
      await pool.query(`
        INSERT INTO applications (job_id, user_id, status, cover_letter, resume_url, applied_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (job_id, user_id) DO NOTHING
      `, [
        jobId, candidateId, status, '지원서 커버레터입니다.', 
        'https://example.com/resume.pdf', new Date(), new Date()
      ]);
      
      if (i % 50 === 0) {
        console.log(`${i}개 완료...`);
      }
    } catch (error) {
      console.log(`지원서 ${i} 생성 실패:`, error.message);
    }
  }
  
  console.log('✅ 지원서 200개 생성 완료');
}

async function main() {
  try {
    console.log('🚀 추가 더미 데이터 생성 시작...');
    
    await pool.query('SELECT 1');
    console.log('✅ DB 연결 성공');
    
    await addMoreUsers();
    await addCompanies();
    await addApplications();
    
    console.log('🎉 모든 추가 더미 데이터 생성 완료!');
    console.log('📊 생성된 데이터:');
    console.log('   - 사용자: 100명 추가');
    console.log('   - 회사: 30개 추가');
    console.log('   - 채용공고: 500개 (이미 생성됨)');
    console.log('   - 지원서: 200개 추가');
    
  } catch (error) {
    console.error('❌ 더미 데이터 생성 실패:', error);
  } finally {
    await pool.end();
  }
}

main(); 