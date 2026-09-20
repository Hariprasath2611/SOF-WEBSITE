import { MongoClient, ServerApiVersion } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

const uri = process.env.MONGO_URI || "";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let dbConnection = null;

export async function connectToDatabase() {
  if (dbConnection) return dbConnection;

  if (!uri) {
    console.warn("MongoDB URI is not provided in environment variables.");
    return null;
  }

  try {
    await client.connect();
    dbConnection = client.db("sof_registrations");
    console.log("✅ Successfully connected to MongoDB!");
    
    // Ensure unique index on registrationId
    await dbConnection.collection("registrations").createIndex({ registrationId: 1 }, { unique: true });
    
    return dbConnection;
  } catch (error) {
    console.error("❌ Failed to connect to MongoDB:", error);
    return null;
  }
}

export function getDatabase() {
  return dbConnection;
}
