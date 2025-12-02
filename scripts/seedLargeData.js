import 'dotenv/config';
import { Pool } from 'pg';
import { faker } from '@faker-js/faker';

const DATABASE_URL = process.env.DATABASE_URL || "postgresql://jobmongolia_user:JobMongolia2025R5@192.168.0.171:5432/jobmongolia";

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: false,
});

// 몽골어 데이터
const mongolianNames = [
  "Батбаяр", "Энхбаяр", "Төмөрбаатар", "Ганбаатар", "Мөнхбаяр",
  "Алтанцэцэг", "Цэцэгмаа", "Ундрамаа", "Оюунцэцэг", "Сарангэрэл",
  "Болдбаатар", "Жавхлан", "Мөнхтөгс", "Амарсайхан", "Баярсайхан"
];

const mongolianCompanies = [
  "Монгол Банк", "Говь Корпораци", "Эрдэнэт Үйлдвэр", "Тавантолгой ХХК",
  "Оюу Толгой", "Мобиком Корпораци", "Юнител ХХК", "Скайтел ХХК",
  "Монгол Пост", "Хаан Банк", "Голомт Банк", "Капитрон Банк"
];

const skills = [
  "JavaScript", "TypeScript", "React", "Vue.js", "Angular", "Node.js",
  "Python", "Java", "C#", "Go", "SQL", "MongoDB", "PostgreSQL",
  "Docker", "Kubernetes", "AWS", "Azure", "Machine Learning"
];

async function seedUsers() {
  console.log('🧑‍💼 사용자 150명 생성 중...');
  
  for (let i = 0; i < 150; i++) {
    try {
      const userType = faker.helpers.arrayElement(['candidate', 'employer', 'admin']);
      const username = `user${i}_${Math.random().toString(36).substring(7)}`;
      const email = `user${i}@jobmongol.com`;
      const fullName = faker.helpers.arrayElement(mongolianNames);
      const role = userType === 'admin' ? 'admin' : 'user';
      const bio = faker.lorem.sentence();
      const skills = JSON.stringify(faker.helpers.arrayElements(skills, { min: 3, max: 6 }));
      const experience = `${faker.number.int({ min: 1, max: 15 })}년`;
      const education = `${faker.company.name()} 대학교`;
      
      await pool.query(`
        INSERT INTO users (username, password, email, full_name, user_type, role, 
                           profile_picture, location, phone, bio, skills, experience, 
                           education, is_active, last_login, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        ON CONFLICT (email) DO NOTHING
      `, [
        username, 'password123', email, fullName, userType, role,
        faker.image.avatar(), faker.location.city(), faker.phone.number(),
        bio, skills, experience, education, true, new Date(), new Date(), new Date()
      ]);
    } catch (error) {
      console.log(`사용자 ${i} 생성 실패:`, error.message);
    }
  }
  
  console.log('✅ 사용자 150명 생성 완료');
}

async function seedCompanies() {
  console.log('🏢 회사 50개 생성 중...');
  
  for (let i = 0; i < 50; i++) {
    try {
      const name = `${faker.helpers.arrayElement(mongolianCompanies)} ${i}`;
      const size = faker.helpers.arrayElement(['1-10', '11-50', '51-200', '201-500', '500+']);
      const industry = faker.helpers.arrayElement(['Technology', 'Finance', 'Healthcare', 'Education', 'Manufacturing']);
      const benefits = JSON.stringify(['원격 근무', '유연한 근무시간', '유급 휴가', '건강 보험']);
      const description = faker.company.catchPhrase();
      const culture = faker.lorem.sentence();
      
      await pool.query(`
        INSERT INTO companies (name, logo, size, status, description, industry, location, 
                              culture, benefits, website, founded, employee_count, 
                              is_detail_complete, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      `, [
        name, faker.image.url(), size, 'approved', description, industry,
        faker.location.city(), culture, benefits, faker.internet.url(),
        faker.number.int({ min: 1990, max: 2020 }), faker.number.int({ min: 10, max: 5000 }),
        true, new Date(), new Date()
      ]);
    } catch (error) {
      console.log(`회사 ${i} 생성 실패:`, error.message);
    }
  }
  
  console.log('✅ 회사 50개 생성 완료');
}

async function seedJobs() {
  console.log('💼 채용공고 400개 생성 중...');
  
  // 회사 ID들 가져오기
  const companiesResult = await pool.query('SELECT id FROM companies LIMIT 50');
  const companyIds = companiesResult.rows.map(row => row.id);
  
  const jobQueries = [];
  const employmentTypes = ['full-time', 'part-time', 'contract', 'freelance', 'internship'];
  const experienceLevels = ['entry', 'mid', 'senior', 'lead'];
  
  for (let i = 0; i < 400; i++) {
    const companyId = faker.helpers.arrayElement(companyIds);
    const title = faker.person.jobTitle();
    const description = faker.lorem.paragraphs(3).replace(/'/g, "''");
    const requirements = faker.lorem.paragraphs(2).replace(/'/g, "''");
    const location = faker.location.city();
    const employmentType = faker.helpers.arrayElement(employmentTypes);
    const experienceLevel = faker.helpers.arrayElement(experienceLevels);
    const salaryMin = faker.number.int({ min: 1500000, max: 4000000 });
    const salaryMax = faker.number.int({ min: salaryMin + 500000, max: salaryMin + 3000000 });
    const jobSkills = JSON.stringify(faker.helpers.arrayElements(skills, { min: 3, max: 8 }));
    const benefits = JSON.stringify(['원격 근무', '유연한 근무시간', '유급 휴가']);
    const isFeatured = faker.datatype.boolean({ probability: 0.1 });
    const isRemote = faker.datatype.boolean({ probability: 0.3 });
    const views = faker.number.int({ min: 0, max: 5000 });
    const applicationsCount = faker.number.int({ min: 0, max: 150 });
    
    jobQueries.push(`
      (${companyId}, '${title}', '${description}', '${requirements}', '${location}', 
       '${employmentType}', '${experienceLevel}', ${salaryMin}, ${salaryMax}, 
       '${jobSkills}', '${benefits}', ${isFeatured}, true, ${views}, 
       NOW(), NOW(), 'active', ${isRemote}, NOW(), 
       NOW() + INTERVAL '6 months', ${applicationsCount})
    `);
  }

  await pool.query(`
    INSERT INTO jobs (company_id, title, description, requirements, location, employment_type, 
                     experience_level, salary_min, salary_max, skills, benefits, is_featured, 
                     is_active, views, created_at, updated_at, status, is_remote, posted_at, 
                     expires_at, applications_count)
    VALUES ${jobQueries.join(',')}
  `);
  
  console.log('✅ 채용공고 400개 생성 완료');
}

async function seedApplications() {
  console.log('📄 지원서 800개 생성 중...');
  
  // 구직자와 채용공고 ID 가져오기
  const candidatesResult = await pool.query("SELECT id FROM users WHERE user_type = 'candidate' LIMIT 100");
  const jobsResult = await pool.query('SELECT id FROM jobs LIMIT 400');
  
  const candidateIds = candidatesResult.rows.map(row => row.id);
  const jobIds = jobsResult.rows.map(row => row.id);
  
  const applicationQueries = [];
  const statuses = ['pending', 'reviewing', 'interview', 'accepted', 'rejected'];
  
  for (let i = 0; i < 800; i++) {
    const candidateId = faker.helpers.arrayElement(candidateIds);
    const jobId = faker.helpers.arrayElement(jobIds);
    const status = faker.helpers.arrayElement(statuses);
    const coverLetter = faker.lorem.paragraphs(2).replace(/'/g, "''");
    const resumeUrl = faker.internet.url();
    
    applicationQueries.push(`
      (${jobId}, ${candidateId}, '${status}', '${coverLetter}', '${resumeUrl}', NOW(), NOW())
    `);
  }

  await pool.query(`
    INSERT INTO applications (job_id, user_id, status, cover_letter, resume_url, applied_at, updated_at)
    VALUES ${applicationQueries.join(',')}
    ON CONFLICT (job_id, user_id) DO NOTHING
  `);
  
  console.log('✅ 지원서 800개 생성 완료');
}

async function seedCompanyReviews() {
  console.log('⭐ 회사 리뷰 200개 생성 중...');
  
  const candidatesResult = await pool.query("SELECT id FROM users WHERE user_type = 'candidate' LIMIT 100");
  const companiesResult = await pool.query('SELECT id FROM companies LIMIT 50');
  
  const candidateIds = candidatesResult.rows.map(row => row.id);
  const companyIds = companiesResult.rows.map(row => row.id);
  
  const reviewQueries = [];
  
  for (let i = 0; i < 200; i++) {
    const candidateId = faker.helpers.arrayElement(candidateIds);
    const companyId = faker.helpers.arrayElement(companyIds);
    const rating = faker.number.int({ min: 1, max: 5 });
    const title = faker.lorem.sentence().replace(/'/g, "''");
    const review = faker.lorem.paragraphs(2).replace(/'/g, "''");
    const pros = faker.lorem.paragraph().replace(/'/g, "''");
    const cons = faker.lorem.paragraph().replace(/'/g, "''");
    const isPublic = faker.datatype.boolean({ probability: 0.9 });
    const isAnonymous = faker.datatype.boolean({ probability: 0.3 });
    
    reviewQueries.push(`
      (${companyId}, ${candidateId}, ${rating}, '${title}', '${review}', 
       '${pros}', '${cons}', ${isPublic}, ${isAnonymous}, NOW())
    `);
  }

  await pool.query(`
    INSERT INTO company_reviews (company_id, user_id, rating, title, review, pros, cons, 
                                is_public, is_anonymous, created_at)
    VALUES ${reviewQueries.join(',')}
    ON CONFLICT (company_id, user_id) DO NOTHING
  `);
  
  console.log('✅ 회사 리뷰 200개 생성 완료');
}

async function main() {
  try {
    console.log('🚀 대량 더미 데이터 생성 시작...');
    
    // DB 연결 테스트
    await pool.query('SELECT 1');
    console.log('✅ DB 연결 성공');
    
    // 순차적으로 데이터 생성
    await seedUsers();
    await seedCompanies();
    await seedJobs();
    await seedApplications();
    await seedCompanyReviews();
    
    console.log('🎉 모든 더미 데이터 생성 완료!');
    console.log('📊 생성된 데이터 요약:');
    console.log('   - 사용자: 150명');
    console.log('   - 회사: 50개');
    console.log('   - 채용공고: 400개');
    console.log('   - 지원서: 800개');
    console.log('   - 회사 리뷰: 200개');
    
  } catch (error) {
    console.error('❌ 더미 데이터 생성 실패:', error);
  } finally {
    await pool.end();
  }
}

main(); 