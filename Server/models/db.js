const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 20, // Increased from 10
  maxIdle: 10,
  idleTimeout: 60000,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000, // Changed from 0 to 10 seconds
  // Add these important settings
  connectTimeout: 20000, // 20 seconds timeout for initial connection
  charset: 'utf8mb4',
  timezone: '+00:00',
  // Reconnection settings
  multipleStatements: false,
});

// Handle pool-level errors
pool.on('connection', (connection) => {
  console.log('🔌 New database connection established');
  
  // Set connection timeout and charset
  connection.query('SET SESSION wait_timeout = 28800'); // 8 hours
  connection.query('SET SESSION interactive_timeout = 28800');
  
  connection.on('error', (err) => {
    console.error('❌ Database connection error:', err.code);
    if (err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'ECONNRESET') {
      console.log('🔄 Connection lost, pool will create a new one');
    }
  });
});

// Enhanced connection test on startup with retry
const testConnection = async (retries = 5) => {
  for (let i = 0; i < retries; i++) {
    try {
      const connection = await pool.getConnection();
      console.log('✅ Database connected successfully');
      await connection.query('SELECT 1');
      connection.release();
      return;
    } catch (err) {
      console.error(`❌ Database connection attempt ${i + 1}/${retries} failed:`, err.message);
      if (i < retries - 1) {
        const delay = Math.min(1000 * Math.pow(2, i), 10000); // Exponential backoff, max 10s
        console.log(`⏳ Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        console.error('❌ All database connection attempts failed');
        throw err;
      }
    }
  }
};

// Test connection on startup
testConnection().catch(err => {
  console.error('❌ Fatal: Could not establish database connection');
  // Don't exit process, let it retry on queries
});

// Enhanced wrapper function to execute queries with automatic retry
const executeQuery = async (sql, params = [], maxRetries = 3) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    let connection;
    try {
      // Get a fresh connection from the pool with timeout
      connection = await Promise.race([
        pool.getConnection(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Connection timeout')), 10000)
        )
      ]);
      
      // Ping to ensure connection is alive
      await connection.ping();
      
      // Execute the query
      const [results] = await connection.query(sql, params);
      
      // Release connection back to pool
      connection.release();
      
      return [results];
    } catch (error) {
      // Release connection if we got one
      if (connection) {
        try {
          connection.release();
        } catch (releaseError) {
          // Ignore release errors
        }
      }
      
      lastError = error;
      
      // Check if it's a connection error that we should retry
      const shouldRetry = (
        error.code === 'ECONNRESET' ||
        error.code === 'PROTOCOL_CONNECTION_LOST' ||
        error.code === 'ETIMEDOUT' ||
        error.code === 'PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR' ||
        error.code === 'PROTOCOL_ENQUEUE_AFTER_QUIT' ||
        error.errno === -4077 ||
        error.message === 'Connection timeout'
      );
      
      if (shouldRetry && attempt < maxRetries) {
        console.log(`⚠️ Connection error (${error.code || error.message}), retrying... (attempt ${attempt}/${maxRetries})`);
        // Exponential backoff with jitter: 500ms, 1000ms, 2000ms
        const delay = Math.min(500 * Math.pow(2, attempt - 1), 5000) + Math.random() * 100;
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      // If not a retry-able error or max retries reached, throw
      console.error(`❌ Query failed after ${attempt} attempts:`, error.message);
      throw error;
    }
  }
  
  throw lastError;
};

// Graceful shutdown handler
const closePool = async () => {
  try {
    await pool.end();
    console.log('✅ Database pool closed gracefully');
  } catch (err) {
    console.error('❌ Error closing database pool:', err);
  }
};

// Handle process termination
process.on('SIGINT', async () => {
  await closePool();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closePool();
  process.exit(0);
});

// Export both the pool (for backwards compatibility) and the executeQuery function
module.exports = pool;
module.exports.executeQuery = executeQuery;
module.exports.closePool = closePool;