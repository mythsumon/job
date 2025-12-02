import { Pool } from 'pg';

const pool = new Pool({
  host: '192.168.0.171',
  port: 5432,
  database: 'jobmongolia',
  user: 'jobmongolia_user',
  password: 'JobMongolia2025R5!',
});

async function monitorRegistration() {
  console.log('🔍 Starting registration monitoring...\n');
  
  // Get current counts
  const beforeStats = await pool.query(`
    SELECT 
      (SELECT COUNT(*) FROM users WHERE user_type = 'employer') as employer_count,
      (SELECT COUNT(*) FROM companies) as company_count,
      (SELECT COUNT(*) FROM company_users) as relationship_count,
      (SELECT MAX(id) FROM users) as max_user_id,
      (SELECT MAX(id) FROM companies) as max_company_id,
      (SELECT MAX(id) FROM company_users) as max_relationship_id
  `);
  
  console.log('📊 CURRENT STATUS:');
  console.table(beforeStats.rows[0]);
  
  console.log('\n👀 Monitoring for new registrations... (Press Ctrl+C to stop)');
  console.log('📧 Please register a new employer at: http://localhost:5173/register\n');
  
  let lastUserCount = parseInt(beforeStats.rows[0].employer_count);
  let lastCompanyCount = parseInt(beforeStats.rows[0].company_count);
  let lastRelationshipCount = parseInt(beforeStats.rows[0].relationship_count);
  
  setInterval(async () => {
    try {
      const currentStats = await pool.query(`
        SELECT 
          (SELECT COUNT(*) FROM users WHERE user_type = 'employer') as employer_count,
          (SELECT COUNT(*) FROM companies) as company_count,
          (SELECT COUNT(*) FROM company_users) as relationship_count
      `);
      
      const current = currentStats.rows[0];
      const userCount = parseInt(current.employer_count);
      const companyCount = parseInt(current.company_count);
      const relationshipCount = parseInt(current.relationship_count);
      
      if (userCount > lastUserCount || companyCount > lastCompanyCount || relationshipCount > lastRelationshipCount) {
        console.log(`🎉 NEW REGISTRATION DETECTED! Time: ${new Date().toISOString()}`);
        
        // Get the latest user
        const latestUser = await pool.query(`
          SELECT id, email, full_name, user_type, created_at
          FROM users 
          WHERE user_type = 'employer' 
          ORDER BY id DESC 
          LIMIT 1
        `);
        
        if (latestUser.rows.length > 0) {
          const user = latestUser.rows[0];
          console.log('\n👤 NEW USER:');
          console.table([user]);
          
          // Check company
          const userCompany = await pool.query(`
            SELECT c.*, cu.role, cu.is_primary
            FROM companies c
            JOIN company_users cu ON c.id = cu.company_id
            WHERE cu.user_id = $1
          `, [user.id]);
          
          console.log('\n🏢 USER\'S COMPANY:');
          if (userCompany.rows.length > 0) {
            console.table(userCompany.rows);
            console.log('✅ COMPLETE REGISTRATION SUCCESS! 🎉');
          } else {
            console.log('❌ MISSING COMPANY RELATIONSHIP!');
          }
        }
        
        lastUserCount = userCount;
        lastCompanyCount = companyCount;
        lastRelationshipCount = relationshipCount;
      }
    } catch (error) {
      console.error('❌ Monitoring error:', error);
    }
  }, 2000); // Check every 2 seconds
}

monitorRegistration().catch(console.error); 