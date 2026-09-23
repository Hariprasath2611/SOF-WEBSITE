const { MongoClient } = require('mongodb');

async function check() {
  const uri = "mongodb+srv://hariprasathd26112006_db_user:CZBd3QyENrJAagrJ@ccms.b6dmes8.mongodb.net/?appName=CCMS";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db("test"); // wait, the DB name might not be test. Let's see what DB name the service uses.
    // In mongodbService.js it just says:
    // export async function connectToDatabase() { return client.db(); } 
    // which defaults to the one in the URI. In the URI there is no DB specified before the ?. 
    // So it defaults to "test". Let's check all databases if needed, but let's try getting the default one.
    const database = client.db();
    const count = await database.collection("registrations").countDocuments();
    console.log("Total registrations in MongoDB:", count);
    
    // Check for cancelled
    const cancelled = await database.collection("registrations").countDocuments({ status: "CANCELLED" });
    console.log("Cancelled registrations in MongoDB:", cancelled);

  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

check();
