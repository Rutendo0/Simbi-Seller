import { Pool } from 'pg';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

// Production-ready connection pool with optimized settings
export const dbPool = new Pool({
  connectionString: DATABASE_URL,
  max: 20, // Allow more connections for production
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 15000, // Increased timeout for Neon
  ssl: {
    rejectUnauthorized: false, // Required for Neon PostgreSQL
  },
  // Neon-specific optimizations
  keepAlive: true,
  keepAliveInitialDelayMillis: 0,
});

// Test database connection with retry logic
export async function testDatabaseConnection(retries = 3): Promise<{ success: boolean; message: string }> {
  let client;
  let attempt = 0;

  while (attempt < retries) {
    try {
      client = await dbPool.connect();
      console.log(`✅ Database connection successful (attempt ${attempt + 1})`);

      // Test with a simple query
      await client.query('SELECT 1');
      console.log('✅ Database query test passed');

      // Ensure users table exists with production schema
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          uid TEXT PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          display_name TEXT,
          store_name TEXT,
          phone_number TEXT,
          national_id TEXT,
          business_owner_name TEXT,
          business_owner_email TEXT,
          business_owner_phone TEXT,
          store_country TEXT,
          store_city TEXT,
          store_address1 TEXT,
          store_address2 TEXT,
          postal_code TEXT,
          vat_number TEXT,
          profile_json JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);

      // Create indexes for better performance
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
        CREATE INDEX IF NOT EXISTS idx_users_store_name ON users(store_name);
        CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
      `);

      console.log('✅ Users table and indexes ready');
      return { success: true, message: 'Database connected successfully' };

    } catch (error: any) {
      attempt++;
      console.error(`❌ Database connection attempt ${attempt} failed:`, error.message);

      if (attempt >= retries) {
        return {
          success: false,
          message: `Database connection failed after ${retries} attempts: ${error.message}`
        };
      }

      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    } finally {
      if (client) client.release();
    }
  }

  return { success: false, message: 'Database connection failed' };
}

// Production-ready user operations with error handling
export const userOperations = {
  async createOrUpdateUser(userData: {
    uid: string;
    email: string;
    displayName?: string;
    storeName?: string;
    phoneNumber?: string;
    nationalId?: string;
    businessOwnerName?: string;
    businessOwnerEmail?: string;
    businessOwnerPhone?: string;
    storeCountry?: string;
    storeCity?: string;
    storeAddress1?: string;
    storeAddress2?: string;
    postalCode?: string;
    vatNumber?: string;
  }) {
    const client = await dbPool.connect();
    try {
      const query = `
        INSERT INTO users (
          uid, email, display_name, store_name, phone_number, national_id,
          business_owner_name, business_owner_email, business_owner_phone,
          store_country, store_city, store_address1, store_address2,
          postal_code, vat_number, profile_json, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW()
        )
        ON CONFLICT (uid) DO UPDATE SET
          email = EXCLUDED.email,
          display_name = EXCLUDED.display_name,
          store_name = EXCLUDED.store_name,
          phone_number = EXCLUDED.phone_number,
          national_id = EXCLUDED.national_id,
          business_owner_name = EXCLUDED.business_owner_name,
          business_owner_email = EXCLUDED.business_owner_email,
          business_owner_phone = EXCLUDED.business_owner_phone,
          store_country = EXCLUDED.store_country,
          store_city = EXCLUDED.store_city,
          store_address1 = EXCLUDED.store_address1,
          store_address2 = EXCLUDED.store_address2,
          postal_code = EXCLUDED.postal_code,
          vat_number = EXCLUDED.vat_number,
          profile_json = EXCLUDED.profile_json,
          updated_at = NOW()
        RETURNING *;
      `;

      const values = [
        userData.uid,
        userData.email,
        userData.displayName || null,
        userData.storeName || null,
        userData.phoneNumber || null,
        userData.nationalId || null,
        userData.businessOwnerName || null,
        userData.businessOwnerEmail || null,
        userData.businessOwnerPhone || null,
        userData.storeCountry || null,
        userData.storeCity || null,
        userData.storeAddress1 || null,
        userData.storeAddress2 || null,
        userData.postalCode || null,
        userData.vatNumber || null,
        JSON.stringify(userData)
      ];

      const result = await client.query(query, values);
      console.log('✅ User data saved to database:', userData.uid);
      return result.rows[0];

    } catch (error: any) {
      console.error('❌ Database operation failed:', error);
      throw new Error(`Failed to save user data: ${error.message}`);
    } finally {
      client.release();
    }
  },

  async getUser(uid: string) {
    const client = await dbPool.connect();
    try {
      const result = await client.query('SELECT * FROM users WHERE uid = $1', [uid]);
      const user = result.rows[0] || null;

      if (user) {
        console.log('✅ User data retrieved from database:', uid);
      } else {
        console.log('ℹ️ No user found in database:', uid);
      }

      return user;
    } catch (error: any) {
      console.error('❌ Database query failed:', error);
      throw new Error(`Failed to retrieve user data: ${error.message}`);
    } finally {
      client.release();
    }
  },

  async getUserByEmail(email: string) {
    const client = await dbPool.connect();
    try {
      const result = await client.query('SELECT * FROM users WHERE email = $1', [email]);
      return result.rows[0] || null;
    } catch (error: any) {
      console.error('❌ Database query failed:', error);
      throw new Error(`Failed to retrieve user by email: ${error.message}`);
    } finally {
      client.release();
    }
  },

  async deleteUser(uid: string) {
    const client = await dbPool.connect();
    try {
      const result = await client.query('DELETE FROM users WHERE uid = $1 RETURNING *', [uid]);
      console.log('✅ User deleted from database:', uid);
      return result.rows[0] || null;
    } catch (error: any) {
      console.error('❌ Database delete failed:', error);
      throw new Error(`Failed to delete user: ${error.message}`);
    } finally {
      client.release();
    }
  }
};

// Health check function for monitoring
export async function healthCheck() {
  try {
    const connectionTest = await testDatabaseConnection(1);
    return {
      database: connectionTest.success ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      message: connectionTest.message
    };
  } catch (error: any) {
    return {
      database: 'unhealthy',
      timestamp: new Date().toISOString(),
      message: error.message
    };
  }
}

// Migration function to sync existing Firebase users with database
export const userMigration = {
  async syncExistingUsersWithDatabase() {
    const client = await dbPool.connect();
    try {
      console.log('🔄 Starting user migration to sync existing Firebase users...');

      // Get all users from database
      const dbUsers = await client.query('SELECT uid, email, created_at FROM users');
      const dbUserMap = new Map(dbUsers.rows.map(user => [user.uid, user]));

      console.log(`📊 Found ${dbUsers.rows.length} users in database`);

      // For now, we'll create a placeholder function that can be called
      // when we have access to Firebase Admin SDK or user list
      // This is a starting point for the migration

      return {
        success: true,
        message: `Database ready for migration. Found ${dbUsers.rows.length} existing users.`,
        dbUserCount: dbUsers.rows.length
      };

    } catch (error: any) {
      console.error('❌ Migration error:', error);
      throw new Error(`Migration failed: ${error.message}`);
    } finally {
      client.release();
    }
  },

  async createUserFromFirebaseData(userData: {
    uid: string;
    email: string;
    displayName?: string;
  }) {
    const client = await dbPool.connect();
    try {
      console.log('📝 Creating user from Firebase data:', userData.uid);

      const query = `
        INSERT INTO users (
          uid, email, display_name, profile_json, updated_at
        ) VALUES (
          $1, $2, $3, $4, NOW()
        )
        ON CONFLICT (uid) DO UPDATE SET
          email = EXCLUDED.email,
          display_name = EXCLUDED.display_name,
          profile_json = EXCLUDED.profile_json,
          updated_at = NOW()
        RETURNING *;
      `;

      const values = [
        userData.uid,
        userData.email,
        userData.displayName || null,
        JSON.stringify(userData)
      ];

      const result = await client.query(query, values);
      console.log('✅ User created/updated from Firebase data:', userData.uid);
      return result.rows[0];

    } catch (error: any) {
      console.error('❌ Error creating user from Firebase data:', error);
      throw new Error(`Failed to create user: ${error.message}`);
    } finally {
      client.release();
    }
  }
};