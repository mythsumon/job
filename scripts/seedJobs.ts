import "dotenv/config";
import { faker } from "@faker-js/faker";
import { Pool } from "pg";

const PRIMARY_DB = {
  host: process.env.DB_HOST || "192.168.0.171",
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || "jobmongolia",
  user: process.env.DB_USER || "jobmongolia_user",
  password: process.env.DB_PASSWORD || "JobMongolia2025R5",
  ssl: false,
};

const FALLBACK_DB = {
  ...PRIMARY_DB,
  host: "203.23.49.100",
};

let pool: Pool;

async function initDbPool() {
  try {
    pool = new Pool(PRIMARY_DB);
    await pool.query("SELECT 1");
    console.log(`✅ Connected to DB @ ${PRIMARY_DB.host}`);
  } catch (error) {
    console.warn(`⚠️  Primary DB connection failed, trying fallback...`);
    pool = new Pool(FALLBACK_DB);
    await pool.query("SELECT 1");
    console.log(`✅ Connected to fallback DB @ ${FALLBACK_DB.host}`);
  }

  return pool;
}

/*
 * Usage:
 *  npx tsx scripts/seedJobs.ts [count]
 *
 * If count is omitted, 200 dummy job postings will be created.
 */

async function main() {
  const countArg = process.argv[2];
  const total = countArg ? parseInt(countArg, 10) : 200;

  if (Number.isNaN(total) || total <= 0) {
    console.error("❌  Count must be a positive integer. Example: `tsx scripts/seedJobs.ts 500`" );
    process.exit(1);
  }

  console.log(`🚀  Seeding ${total} dummy jobs...`);

  const pool = await initDbPool();

  const employmentTypes = ["full-time", "part-time", "contract", "freelance", "internship"];
  const experienceLevels = ["entry", "mid", "senior", "lead"];
  const skillsPool = [
    "JavaScript",
    "TypeScript",
    "React",
    "Vue",
    "Angular",
    "Node.js",
    "Python",
    "Java",
    "C#",
    "Go",
    "SQL",
    "Docker",
    "Kubernetes",
    "AWS",
    "Azure",
    "GCP",
  ];

  const benefitsPool = [
    "Remote work",
    "Flexible hours",
    "Paid vacation",
    "Health insurance",
    "Stock options",
    "Gym membership",
    "Learning budget",
    "Free snacks",
    "Team retreats",
  ];

  const jobData = Array.from({ length: total }).map(() => {
    // Round to nearest 100,000
    const rawMin = faker.number.int({ min: 1500000, max: 6000000 });
    const salaryMin = Math.floor(rawMin / 100000) * 100000;
    const rawMax = faker.number.int({ min: salaryMin + 500000, max: salaryMin + 6000000 });
    const salaryMax = Math.floor(rawMax / 100000) * 100000;

    return {
      title: faker.person.jobTitle(),
      description: faker.lorem.paragraphs({ min: 3, max: 6 }, "\n\n"),
      companyId: null, // You can replace with existing company IDs if needed
      location: faker.location.city(),
      type: faker.helpers.arrayElement(employmentTypes),
      experience: faker.helpers.arrayElement(experienceLevels),
      salaryMin,
      salaryMax,
      skills: faker.helpers.arrayElements(skillsPool, { min: 3, max: 7 }),
      requirements: faker.helpers.arrayElements(skillsPool, { min: 3, max: 7 }).join(", "),
      benefits: faker.helpers.arrayElements(benefitsPool, { min: 2, max: 5 }),
      isRemote: faker.datatype.boolean(),
      isFeatured: faker.datatype.boolean({ probability: 0.1 }),
      isPro: faker.datatype.boolean({ probability: 0.05 }),
      status: "active" as const,
      postedAt: faker.date.recent({ days: 60 }),
      expiresAt: faker.date.future({ years: 0.5 }),
      applications: faker.number.int({ min: 0, max: 100 }),
      views: faker.number.int({ min: 0, max: 10000 }),
    };
  });

  try {
    const text = `INSERT INTO jobs (
      title, description, location, employment_type, experience_level, salary_min, salary_max,
      skills, requirements, benefits, is_remote, is_featured, status, posted_at, expires_at,
      applications_count, views
    ) VALUES `;

    const valuesClauses: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    jobData.forEach(job => {
      valuesClauses.push(`(
        $${paramIndex++}, $${paramIndex++}, $${paramIndex++},
        $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++},
        $${paramIndex++}, $${paramIndex++}, $${paramIndex++},
        $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++},
        $${paramIndex++}, $${paramIndex++}
      )`);

      values.push(
        job.title,
        job.description,
        job.location,
        job.type,
        job.experience,
        job.salaryMin,
        job.salaryMax,
        job.skills,
        job.requirements,
        job.benefits,
        job.isRemote,
        job.isFeatured,
        job.status,
        job.postedAt,
        job.expiresAt,
        job.applications,
        job.views,
      );
    });

    const insertQuery = text + valuesClauses.join(",\n");

    const result = await pool.query(insertQuery, values);
    console.log(`✅  Successfully inserted ${result.rowCount} jobs.`);
  } catch (error) {
    console.error("❌  Failed to seed jobs:", error);
  } finally {
    await pool.end();
  }
}

main(); 