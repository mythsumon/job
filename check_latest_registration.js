import { Pool } from 'pg';

const pool = new Pool({
  host: '192.168.0.171',
  port: 5432,
  database: 'jobmongolia',
  user: 'jobmongolia_user',
  password: 'JobMongolia2025R5!',
});

async function checkLatestRegistration() {
  try {
    console.log('🔍 Checking latest registration...\n');
    
    // Get latest user
    const latestUser = await pool.query(`
      SELECT * FROM users 
      WHERE user_type = 'employer' 
      ORDER BY id DESC 
      LIMIT 1
    `);
    
    if (latestUser.rows.length > 0) {
      const user = latestUser.rows[0];
      console.log('👤 Latest User:');
      console.table([{
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        user_type: user.user_type,
        created_at: user.created_at
      }]);
      
      // Check if company exists for this user
      const userCompany = await pool.query(`
        SELECT 
          c.*,
          cu.role,
          cu.is_primary,
          cu.created_at as relationship_created
        FROM companies c
        JOIN company_users cu ON c.id = cu.company_id
        WHERE cu.user_id = $1
      `, [user.id]);
      
      console.log('\n🏢 User\'s Company:');
      if (userCompany.rows.length > 0) {
        console.table(userCompany.rows);
        console.log('✅ Company relationship EXISTS!');
      } else {
        console.log('❌ NO company relationship found!');
        
        // Create missing company and relationship
        console.log('\n🔧 Creating missing company...');
        
        const newCompany = await pool.query(`
          INSERT INTO companies (name, registration_number, logo, size, status, description, industry, location, culture, benefits, website, founded, employee_count, is_detail_complete)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
          RETURNING *
        `, [
          `${user.full_name}의 회사`,
          null,
          null,
          null,
          'pending',
          '',
          null,
          user.location,
          null,
          '{}', // Empty array for PostgreSQL
          null,
          null,
          null,
          false
        ]);
        
        const company = newCompany.rows[0];
        console.log('✅ Company created:', company.id, company.name);
        
        // Create relationship
        await pool.query(`
          INSERT INTO company_users (user_id, company_id, role, is_primary, is_active, created_at, joined_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [
          user.id,
          company.id,
          'admin',
          true,
          true,
          new Date(),
          new Date()
        ]);
        
        console.log('✅ Company relationship created!');
      }
    } else {
      console.log('❌ No employer users found!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

checkLatestRegistration(); 