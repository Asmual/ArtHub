import { MongoClient } from "mongodb";

let client;
let db;

export async function getDB() {
  if (!db) {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error("Please add your MONGODB_URI to environment variables.");
    }
    if (!client) {
      client = new MongoClient(uri, {
        family: 4, // Forces IPv4 to bypass local DNS or connection timeout issues
      });
      await client.connect();
    }
    // Accessing the artHub database explicitly
    db = client.db("artHub");
  }
  return db;
}