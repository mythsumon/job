import "dotenv/config";
import { faker } from "@faker-js/faker";
import { Pool } from "pg";

const DATABASE_URL = process.env.DATABASE_URL || "postgresql://jobmongolia_user:JobMongolia2025R5@192.168.0.171:5432/jobmongolia";

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: false,
});

// 몽골어 이름 샘플
const mongolianNames = [
  "Батбаяр", "Энхбаяр", "Төмөрбаатар", "Ганбаатар", "Мөнхбаяр",
  "Алтанцэцэг", "Цэцэгмаа", "Ундрамаа", "Оюунцэцэг", "Сарангэрэл",
  "Болдбаатар", "Жавхлан", "Мөнхтөгс", "Амарсайхан", "Баярсайхан"
];

const mongolianCompanies = [
  "Монгол Банк", "Говь Корпораци", "Эрдэнэт Үйлдвэр", "Тавантолгой ХХК",
  "Оюу Толгой", "Мобиком Корпораци", "Юнител ХХК", "Скайтел ХХК",
  "Монгол Пост", "Хаан Банк", "Голомт Банк", "Капитрон Банк",
  "Нэмэгт Шахмал", "Монгол Алт", "Петровис ХХК", "МАК ХХК"
];

const skills = [
  "JavaScript", "TypeScript", "React", "Vue.js", "Angular", "Node.js",
  "Python", "Java", "C#", "Go", "Rust", "PHP", "Ruby",
  "SQL", "MongoDB", "PostgreSQL", "MySQL", "Redis",
  "Docker", "Kubernetes", "AWS", "Azure", "GCP",
  "Machine Learning", "Data Science", "DevOps", "UI/UX Design",
  "Project Management", "Agile", "Scrum", "Git", "Linux"
];

const industries = [
  "Technology", "Finance", "Healthcare", "Education", "Manufacturing",
  "Retail", "Construction", "Mining", "Agriculture", "Tourism",
  "Telecommunications", "Energy", "Transportation", "Media", "Government"
];

const benefits = [
  "원격 근무", "유연한 근무시간", "유급 휴가", "건강 보험", "스톡옵션",
  "헬스장 멤버십", "교육비 지원", "무료 간식", "팀 워크샵", "성과급",
  "교통비 지원", "식비 지원", "야근 수당", "연차 보상", "의료비 지원"
];

async function seedUsers(count: number = 100) {
  console.log(`🧑‍💼 사용자 ${count}명 생성 중...`);
  
  const users = [];
  for (let i = 0; i < count; i++) {
    const userType = faker.helpers.arrayElement(['candidate', 'employer', 'admin']);
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    users.push([
      faker.internet.userName() + i,
      hashedPassword,
      `user${i}@example.com`,
      faker.helpers.arrayElement(mongolianNames),
      userType,
      userType === 'admin' ? 'admin' : 'user',
      faker.image.avatar(),
      faker.location.city(),
      faker.phone.number(),
      faker.lorem.paragraph(),
      JSON.stringify(faker.helpers.arrayElements(skills, { min: 3, max: 8 })),
      `${faker.number.int({ min: 1, max: 15 })}년`,
      faker.company.name() + " 대학교",
      true,
      faker.date.recent(),
      faker.date.past(),
      faker.date.recent()
    ]);
  }

  const placeholders = users.map((_, i) => {
    const start = i * 17 + 1;
    return `($${start}, $${start+1}, $${start+2}, $${start+3}, $${start+4}, $${start+5}, $${start+6}, $${start+7}, $${start+8}, $${start+9}, $${start+10}, $${start+11}, $${start+12}, $${start+13}, $${start+14}, $${start+15}, $${start+16})`;
  }).join(', ');

  const insertQuery = `
    INSERT INTO users (username, password, email, full_name, user_type, role, profile_picture, 
                       location, phone, bio, skills, experience, education, is_active, 
                       last_login, created_at, updated_at)
    VALUES ${placeholders}
    ON CONFLICT (email) DO NOTHING
  `;

  const values = users.flat();
  await pool.query(insertQuery, values);
  console.log(`✅ 사용자 ${count}명 생성 완료`);
}

async function seedCompanies(count: number = 30) {
  console.log(`🏢 회사 ${count}개 생성 중...`);
  
  const companies = [];
  for (let i = 0; i < count; i++) {
    companies.push([
      faker.helpers.arrayElement(mongolianCompanies) + ` ${i}`,
      faker.image.url(),
      faker.helpers.arrayElement(['1-10', '11-50', '51-200', '201-500', '500+']),
      'approved',
      faker.company.catchPhrase() + '. ' + faker.lorem.paragraphs(2),
      faker.helpers.arrayElement(industries),
      faker.location.city(),
      faker.lorem.paragraph(),
      JSON.stringify(faker.helpers.arrayElements(benefits, { min: 3, max: 5 })),
      faker.internet.url(),
      faker.number.int({ min: 1990, max: 2020 }),
      faker.number.int({ min: 10, max: 5000 }),
      true,
      faker.date.past(),
      faker.date.recent()
    ]);
  }

  const placeholders = companies.map((_, i) => {
    const start = i * 15 + 1;
    return `($${start}, $${start+1}, $${start+2}, $${start+3}, $${start+4}, $${start+5}, $${start+6}, $${start+7}, $${start+8}, $${start+9}, $${start+10}, $${start+11}, $${start+12}, $${start+13}, $${start+14})`;
  }).join(', ');

  const insertQuery = `
    INSERT INTO companies (name, logo, size, status, description, industry, location, 
                          culture, benefits, website, founded, employee_count, 
                          is_detail_complete, created_at, updated_at)
    VALUES ${placeholders}
  `;

  const values = companies.flat();
  await pool.query(insertQuery, values);
  console.log(`✅ 회사 ${count}개 생성 완료`);
}

async function seedCompanyUsers() {
  console.log(`👥 회사-사용자 관계 생성 중...`);
  
  // 기존 사용자와 회사 ID 가져오기
  const usersResult = await pool.query("SELECT id FROM users WHERE user_type = 'employer' LIMIT 50");
  const companiesResult = await pool.query("SELECT id FROM companies LIMIT 30");
  
  const users = usersResult.rows;
  const companies = companiesResult.rows;
  
  const companyUsers = [];
  
  // 각 회사에 최소 1명의 owner 배정
  companies.forEach((company, index) => {
    if (users[index]) {
      companyUsers.push({
        userId: users[index].id,
        companyId: company.id,
        role: 'owner',
        isPrimary: true,
        createdAt: faker.date.past(),
        isActive: true,
        joinedAt: faker.date.past()
      });
    }
  });
  
  // 추가 직원들 배정
  for (let i = 0; i < 100; i++) {
    const user = faker.helpers.arrayElement(users);
    const company = faker.helpers.arrayElement(companies);
    const role = faker.helpers.arrayElement(['admin', 'hr', 'member']);
    
    companyUsers.push({
      userId: user.id,
      companyId: company.id,
      role,
      isPrimary: false,
      createdAt: faker.date.past(),
      isActive: true,
      joinedAt: faker.date.past()
    });
  }

  const insertQuery = `
    INSERT INTO company_users (user_id, company_id, role, is_primary, created_at, is_active, joined_at)
    VALUES ${companyUsers.map((_, i) => `($${i * 7 + 1}, $${i * 7 + 2}, $${i * 7 + 3}, $${i * 7 + 4}, 
                                         $${i * 7 + 5}, $${i * 7 + 6}, $${i * 7 + 7})`).join(', ')}
    ON CONFLICT (user_id, company_id) DO NOTHING
  `;

  const values = companyUsers.flatMap(cu => [
    cu.userId, cu.companyId, cu.role, cu.isPrimary, cu.createdAt, cu.isActive, cu.joinedAt
  ]);

  await pool.query(insertQuery, values);
  console.log(`✅ 회사-사용자 관계 ${companyUsers.length}개 생성 완료`);
}

async function seedJobs(count: number = 200) {
  console.log(`💼 채용공고 ${count}개 생성 중...`);
  
  const companiesResult = await pool.query("SELECT id FROM companies LIMIT 30");
  const companies = companiesResult.rows;
  
  const jobs = [];
  const employmentTypes = ["full-time", "part-time", "contract", "freelance", "internship"];
  const experienceLevels = ["entry", "mid", "senior", "lead"];
  
  for (let i = 0; i < count; i++) {
    const company = faker.helpers.arrayElement(companies);
    const salaryMin = faker.number.int({ min: 1500000, max: 4000000 });
    const salaryMax = faker.number.int({ min: salaryMin + 500000, max: salaryMin + 3000000 });
    
    jobs.push([
      company.id,
      faker.person.jobTitle(),
      faker.lorem.paragraphs(4),
      faker.lorem.paragraphs(2),
      faker.location.city(),
      faker.helpers.arrayElement(employmentTypes),
      faker.helpers.arrayElement(experienceLevels),
      salaryMin,
      salaryMax,
      JSON.stringify(faker.helpers.arrayElements(skills, { min: 3, max: 8 })),
      JSON.stringify(faker.helpers.arrayElements(benefits, { min: 3, max: 6 })),
      faker.datatype.boolean({ probability: 0.1 }),
      true,
      faker.number.int({ min: 0, max: 5000 }),
      faker.date.past(),
      faker.date.recent(),
      'active',
      faker.datatype.boolean({ probability: 0.3 }),
      faker.date.past(),
      faker.date.future(),
      faker.number.int({ min: 0, max: 150 })
    ]);
  }

  const placeholders = jobs.map((_, i) => {
    const start = i * 21 + 1;
    return `($${start}, $${start+1}, $${start+2}, $${start+3}, $${start+4}, $${start+5}, $${start+6}, $${start+7}, $${start+8}, $${start+9}, $${start+10}, $${start+11}, $${start+12}, $${start+13}, $${start+14}, $${start+15}, $${start+16}, $${start+17}, $${start+18}, $${start+19}, $${start+20})`;
  }).join(', ');

  const insertQuery = `
    INSERT INTO jobs (company_id, title, description, requirements, location, employment_type, 
                     experience_level, salary_min, salary_max, skills, benefits, is_featured, 
                     is_active, views, created_at, updated_at, status, is_remote, posted_at, 
                     expires_at, applications_count)
    VALUES ${placeholders}
  `;

  const values = jobs.flat();
  await pool.query(insertQuery, values);
  console.log(`✅ 채용공고 ${count}개 생성 완료`);
}

async function seedApplications(count: number = 500) {
  console.log(`📄 지원서 ${count}개 생성 중...`);
  
  // 기존 구직자와 채용공고 ID 가져오기
  const candidatesResult = await pool.query("SELECT id FROM users WHERE user_type = 'candidate' LIMIT 100");
  const jobsResult = await pool.query("SELECT id FROM jobs LIMIT 200");
  
  const candidates = candidatesResult.rows;
  const jobs = jobsResult.rows;
  
  const applications = [];
  const statuses = ['pending', 'reviewing', 'interview', 'accepted', 'rejected'];
  
  for (let i = 0; i < count; i++) {
    const candidate = faker.helpers.arrayElement(candidates);
    const job = faker.helpers.arrayElement(jobs);
    
    applications.push({
      jobId: job.id,
      userId: candidate.id,
      status: faker.helpers.arrayElement(statuses),
      coverLetter: faker.lorem.paragraphs(3),
      resumeUrl: faker.internet.url(),
      appliedAt: faker.date.past(),
      updatedAt: faker.date.recent()
    });
  }

  const insertQuery = `
    INSERT INTO applications (job_id, user_id, status, cover_letter, resume_url, applied_at, updated_at)
    VALUES ${applications.map((_, i) => `($${i * 7 + 1}, $${i * 7 + 2}, $${i * 7 + 3}, $${i * 7 + 4}, 
                                         $${i * 7 + 5}, $${i * 7 + 6}, $${i * 7 + 7})`).join(', ')}
    ON CONFLICT (job_id, user_id) DO NOTHING
  `;

  const values = applications.flatMap(app => [
    app.jobId, app.userId, app.status, app.coverLetter, app.resumeUrl, app.appliedAt, app.updatedAt
  ]);

  await pool.query(insertQuery, values);
  console.log(`✅ 지원서 ${count}개 생성 완료`);
}

async function seedChatRoomsAndMessages(count: number = 100) {
  console.log(`💬 채팅방 및 메시지 ${count}개 생성 중...`);
  
  // 기존 사용자와 채용공고 ID 가져오기
  const employersResult = await pool.query("SELECT id FROM users WHERE user_type = 'employer' LIMIT 50");
  const candidatesResult = await pool.query("SELECT id FROM users WHERE user_type = 'candidate' LIMIT 100");
  const jobsResult = await pool.query("SELECT id FROM jobs LIMIT 200");
  
  const employers = employersResult.rows;
  const candidates = candidatesResult.rows;
  const jobs = jobsResult.rows;
  
  // 채팅방 생성
  const chatRooms = [];
  for (let i = 0; i < count; i++) {
    const employer = faker.helpers.arrayElement(employers);
    const candidate = faker.helpers.arrayElement(candidates);
    const job = faker.helpers.arrayElement(jobs);
    
    chatRooms.push({
      employerId: employer.id,
      candidateId: candidate.id,
      jobId: job.id,
      status: faker.helpers.arrayElement(['active', 'closed']),
      lastMessageAt: faker.date.recent(),
      employerDeleted: false,
      candidateDeleted: false,
      createdAt: faker.date.past()
    });
  }

  const roomInsertQuery = `
    INSERT INTO chat_rooms (employer_id, candidate_id, job_id, status, last_message_at, 
                           employer_deleted, candidate_deleted, created_at)
    VALUES ${chatRooms.map((_, i) => `($${i * 8 + 1}, $${i * 8 + 2}, $${i * 8 + 3}, $${i * 8 + 4}, 
                                      $${i * 8 + 5}, $${i * 8 + 6}, $${i * 8 + 7}, $${i * 8 + 8})`).join(', ')}
    ON CONFLICT (employer_id, candidate_id, job_id) DO NOTHING
    RETURNING id
  `;

  const roomValues = chatRooms.flatMap(room => [
    room.employerId, room.candidateId, room.jobId, room.status, room.lastMessageAt,
    room.employerDeleted, room.candidateDeleted, room.createdAt
  ]);

  const roomResult = await pool.query(roomInsertQuery, roomValues);
  const createdRooms = roomResult.rows;

  // 채팅 메시지 생성
  const messages = [];
  createdRooms.forEach(room => {
    const messageCount = faker.number.int({ min: 5, max: 30 });
    for (let i = 0; i < messageCount; i++) {
      const isFromEmployer = faker.datatype.boolean();
      messages.push({
        roomId: room.id,
        senderId: isFromEmployer ? chatRooms[0].employerId : chatRooms[0].candidateId,
        message: faker.lorem.sentence(),
        messageType: 'text',
        isRead: faker.datatype.boolean({ probability: 0.7 }),
        sentAt: faker.date.recent()
      });
    }
  });

  if (messages.length > 0) {
    const messageInsertQuery = `
      INSERT INTO chat_messages (room_id, sender_id, message, message_type, is_read, sent_at)
      VALUES ${messages.map((_, i) => `($${i * 6 + 1}, $${i * 6 + 2}, $${i * 6 + 3}, $${i * 6 + 4}, 
                                       $${i * 6 + 5}, $${i * 6 + 6})`).join(', ')}
    `;

    const messageValues = messages.flatMap(msg => [
      msg.roomId, msg.senderId, msg.message, msg.messageType, msg.isRead, msg.sentAt
    ]);

    await pool.query(messageInsertQuery, messageValues);
  }

  console.log(`✅ 채팅방 ${createdRooms.length}개 및 메시지 ${messages.length}개 생성 완료`);
}

async function seedCompanyReviews(count: number = 150) {
  console.log(`⭐ 회사 리뷰 ${count}개 생성 중...`);
  
  const candidatesResult = await pool.query("SELECT id FROM users WHERE user_type = 'candidate' LIMIT 100");
  const companiesResult = await pool.query("SELECT id FROM companies LIMIT 30");
  
  const candidates = candidatesResult.rows;
  const companies = companiesResult.rows;
  
  const reviews = [];
  for (let i = 0; i < count; i++) {
    const candidate = faker.helpers.arrayElement(candidates);
    const company = faker.helpers.arrayElement(companies);
    
    reviews.push({
      companyId: company.id,
      userId: candidate.id,
      rating: faker.number.int({ min: 1, max: 5 }),
      title: faker.lorem.sentence(),
      review: faker.lorem.paragraphs(2),
      pros: faker.lorem.paragraph(),
      cons: faker.lorem.paragraph(),
      isPublic: faker.datatype.boolean({ probability: 0.9 }),
      isAnonymous: faker.datatype.boolean({ probability: 0.3 }),
      createdAt: faker.date.past()
    });
  }

  const insertQuery = `
    INSERT INTO company_reviews (company_id, user_id, rating, title, review, pros, cons, 
                                is_public, is_anonymous, created_at)
    VALUES ${reviews.map((_, i) => `($${i * 10 + 1}, $${i * 10 + 2}, $${i * 10 + 3}, $${i * 10 + 4}, 
                                    $${i * 10 + 5}, $${i * 10 + 6}, $${i * 10 + 7}, $${i * 10 + 8}, 
                                    $${i * 10 + 9}, $${i * 10 + 10})`).join(', ')}
    ON CONFLICT (company_id, user_id) DO NOTHING
  `;

  const values = reviews.flatMap(review => [
    review.companyId, review.userId, review.rating, review.title, review.review,
    review.pros, review.cons, review.isPublic, review.isAnonymous, review.createdAt
  ]);

  await pool.query(insertQuery, values);
  console.log(`✅ 회사 리뷰 ${count}개 생성 완료`);
}

async function main() {
  try {
    console.log("🚀 대량 더미 데이터 생성 시작...");
    
    // DB 연결 테스트
    await pool.query('SELECT 1');
    console.log("✅ DB 연결 성공");
    
    // 순차적으로 데이터 생성 (외래키 제약 때문에)
    await seedUsers(150);           // 사용자 150명
    await seedCompanies(40);        // 회사 40개
    await seedCompanyUsers();       // 회사-사용자 관계
    await seedJobs(300);           // 채용공고 300개
    await seedApplications(800);    // 지원서 800개
    await seedChatRoomsAndMessages(150); // 채팅방 150개 + 메시지들
    await seedCompanyReviews(200);  // 회사 리뷰 200개
    
    console.log("🎉 모든 더미 데이터 생성 완료!");
    console.log("📊 생성된 데이터 요약:");
    console.log("   - 사용자: 150명");
    console.log("   - 회사: 40개");
    console.log("   - 채용공고: 300개");
    console.log("   - 지원서: 800개");
    console.log("   - 채팅방: 150개");
    console.log("   - 회사 리뷰: 200개");
    
  } catch (error) {
    console.error("❌ 더미 데이터 생성 실패:", error);
  } finally {
    await pool.end();
  }
}

main(); 