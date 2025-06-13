// MongoDB connection using native MongoDB driver

import { MongoClient, Db, MongoClientOptions } from 'mongodb';

/*
MONGODB DRIVER CONCEPTS:

1. **MongoClient**: Main class for connecting to MongoDB
2. **Db**: Represents a MongoDB database
3. **Collection**: Represents a MongoDB collection (like a table)
4. **Document**: Individual record in a collection
5. **Connection Pool**: MongoDB driver manages multiple connections automatically
*/

// Global variables to store connection
let client: MongoClient;
let db: Db;

// MongoDB connection options
const options: MongoClientOptions = {
  // Connection pool options
  maxPoolSize: 10, // Maximum number of connections in pool
  minPoolSize: 2,  // Minimum number of connections in pool
  maxIdleTimeMS: 30000, // Close connection after 30 seconds of inactivity
  
  // Server selection options
  serverSelectionTimeoutMS: 5000, // How long to try selecting a server
  socketTimeoutMS: 45000, // How long a socket stays open
  
  // Connection options
  connectTimeoutMS: 10000, // How long to wait for initial connection
  heartbeatFrequencyMS: 10000, // How often to check server status
  
  // Retry options
  retryWrites: true, // Retry write operations if they fail
  retryReads: true,  // Retry read operations if they fail
};

/*
CONNECTION POOL EXPLAINED:
- **Connection Pool**: Maintains multiple database connections
- **maxPoolSize**: Prevents too many connections from overwhelming database
- **minPoolSize**: Keeps minimum connections open for faster requests
- **Connection Reuse**: Reuses existing connections instead of creating new ones
- **Automatic Management**: Driver handles opening/closing connections
*/

// Connect to MongoDB
export const connectDB = async (): Promise<void> => {
  try {
    // Get MongoDB URI from environment variables
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/devtasks';
    
    console.log('🔄 Connecting to MongoDB...');
    
    // Create new MongoDB client
    client = new MongoClient(mongoURI, options);
    
    // Connect to MongoDB server
    await client.connect();
    
    // Get database instance
    const dbName = process.env.DB_NAME || 'devtasks';
    db = client.db(dbName);
    
    // Test the connection by pinging
    await db.admin().ping();
    
    console.log(`✅ Connected to MongoDB database: ${dbName}`);
    
    // Create indexes for better performance
    await createIndexes();
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    throw error;
  }
};

// Create database indexes for better query performance
const createIndexes = async (): Promise<void> => {
  try {
    console.log('🔄 Creating database indexes...');
    
    // Users collection indexes
    const usersCollection = db.collection('users');
    await usersCollection.createIndex({ email: 1 }, { unique: true });
    await usersCollection.createIndex({ role: 1 });
    await usersCollection.createIndex({ reportsTo: 1 });
    await usersCollection.createIndex(
      { firstName: 'text', lastName: 'text' },
      { name: 'user_search_index' }
    );
    
    // Projects collection indexes
    const projectsCollection = db.collection('projects');
    await projectsCollection.createIndex({ pmId: 1 });
    await projectsCollection.createIndex({ apmId: 1 });
    await projectsCollection.createIndex({ status: 1 });
    await projectsCollection.createIndex({ teamMembers: 1 });
    await projectsCollection.createIndex(
      { name: 'text', description: 'text' },
      { name: 'project_search_index' }
    );
    
    // Tasks collection indexes
    const tasksCollection = db.collection('tasks');
    await tasksCollection.createIndex({ projectId: 1 });
    await tasksCollection.createIndex({ assignedTo: 1 });
    await tasksCollection.createIndex({ status: 1 });
    await tasksCollection.createIndex({ dueDate: 1 });
    
    // Time tracking collection indexes
    const timeTrackingCollection = db.collection('timeTracking');
    await timeTrackingCollection.createIndex({ userId: 1, createdAt: -1 });
    await timeTrackingCollection.createIndex({ projectId: 1, createdAt: -1 });
    await timeTrackingCollection.createIndex({ taskId: 1 });
    
    console.log('✅ Database indexes created successfully');
    
  } catch (error) {
    console.error('❌ Failed to create indexes:', error);
    // Don't throw error here, app can still work without indexes (just slower)
  }
};

/*
MONGODB INDEXES EXPLAINED:

1. **Single Field Index**: Index on one field ({ email: 1 })
2. **Compound Index**: Index on multiple fields ({ userId: 1, createdAt: -1 })
3. **Text Index**: Full-text search capability ({ name: 'text' })
4. **Unique Index**: Ensures field values are unique ({ email: 1 }, { unique: true })
5. **Ascending (1) vs Descending (-1)**: Sort order for the index

WHY INDEXES MATTER:
- **Query Performance**: Indexes make queries much faster
- **Without Index**: MongoDB scans every document (slow)
- **With Index**: MongoDB uses index to quickly find documents (fast)
- **Trade-off**: Indexes speed up reads but slow down writes slightly
*/

// Get database instance (for use in other modules)
export const getDB = (): Db => {
  if (!db) {
    throw new Error('Database not connected. Call connectDB() first.');
  }
  return db;
};

// Get MongoDB client instance
export const getClient = (): MongoClient => {
  if (!client) {
    throw new Error('MongoDB client not initialized. Call connectDB() first.');
  }
  return client;
};

// Close database connection
export const closeDB = async (): Promise<void> => {
  try {
    if (client) {
      await client.close();
      console.log('✅ MongoDB connection closed');
    }
  } catch (error) {
    console.error('❌ Error closing MongoDB connection:', error);
  }
};

// Database utility functions
export const dbUtils = {
  // Check if connection is alive
  isConnected: async (): Promise<boolean> => {
    try {
      if (!db) return false;
      await db.admin().ping();
      return true;
    } catch {
      return false;
    }
  },
  
  // Get collection with type safety
  getCollection: <T extends Document = Document>(collectionName: string) => {
    return getDB().collection<T>(collectionName);
  },
  
  // Drop collection (for testing/development)
  dropCollection: async (collectionName: string): Promise<void> => {
    try {
      await getDB().collection(collectionName).drop();
      console.log(`Collection ${collectionName} dropped`);
    } catch (error) {
      // Collection might not exist, that's OK
      console.log(`Collection ${collectionName} does not exist`);
    }
  },
  
  // Get database stats
  getStats: async () => {
    return await getDB().stats();
  }
};

/*
UTILITY FUNCTIONS EXPLAINED:

1. **isConnected()**: Health check for database connection
2. **getCollection<T>()**: Type-safe way to get collections
3. **dropCollection()**: Useful for testing and development
4. **getStats()**: Database statistics and information

BEST PRACTICES:
- **Error Handling**: Always handle connection errors gracefully
- **Connection Reuse**: Don't create new connections for each request
- **Graceful Shutdown**: Close connections when app shuts down
- **Health Checks**: Monitor connection status
- **Type Safety**: Use TypeScript for better development experience
*/

export default {
  connectDB,
  closeDB,
  getDB,
  getClient,
  dbUtils
};