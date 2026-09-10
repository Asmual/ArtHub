const { MongoClient, ObjectId } = require("mongodb");
const fs = require("fs");
const path = require("path");

const envPath = path.resolve(__dirname, "../.env.local");
const envContent = fs.readFileSync(envPath, "utf8");
const uriMatch = envContent.match(/MONGODB_URI=(.+)/);
const uri = uriMatch ? uriMatch[1].trim() : "";

if (!uri) {
  console.error("MONGODB_URI not found in .env.local");
  process.exit(1);
}

async function run() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db("artHub");
    console.log("Connected to MongoDB artHub database successfully.");

    const artists = await db.collection("user").find({ role: "artist" }).toArray();
    console.log(`Found ${artists.length} artists.`);

    let totalUpdated = 0;
    for (const artist of artists) {
      if (!artist.name) continue;
      const cleanName = artist.name.trim();
      const regex = new RegExp(`^${cleanName}$`, "i");

      const updateResult = await db.collection("artworks").updateMany(
        { artistName: { $regex: regex } },
        {
          $set: {
            artistId: artist._id.toString(),
            artistEmail: artist.email,
            userId: artist._id.toString(),
          },
        }
      );

      console.log(`- ${artist.name} (${artist.email}): matched ${updateResult.matchedCount}, modified ${updateResult.modifiedCount}`);
      totalUpdated += updateResult.modifiedCount;
    }

    console.log(`Total artworks updated with artistId & artistEmail: ${totalUpdated}`);

    // Remove mock/dummy totalSold field from user collection
    const unsetResult = await db.collection("user").updateMany(
      {},
      { $unset: { totalSold: "" } }
    );
    console.log(`Unset hardcoded totalSold on ${unsetResult.modifiedCount} users.`);

    // Check artworks distribution
    for (const artist of artists) {
      const count = await db.collection("artworks").countDocuments({
        $or: [
          { artistId: artist._id.toString() },
          { artistEmail: artist.email },
          { artistName: { $regex: new RegExp(`^${artist.name.trim()}$`, "i") } }
        ]
      });
      console.log(`Verified artworks count for ${artist.name}: ${count}`);
    }

    // Backfill orders with artist info
    const orders = await db.collection("orders").find({}).toArray();
    let ordersUpdated = 0;
    for (const ord of orders) {
      if (ord.artworkId) {
        let art = null;
        if (ObjectId.isValid(ord.artworkId)) {
          art = await db.collection("artworks").findOne({ _id: new ObjectId(ord.artworkId) });
        }
        if (!art) {
          art = await db.collection("artworks").findOne({ _id: ord.artworkId });
        }
        if (art) {
          await db.collection("orders").updateOne(
            { _id: ord._id },
            {
              $set: {
                artistId: art.artistId || ord.artistId,
                artistEmail: art.artistEmail || ord.artistEmail,
                artworkTitle: art.title || ord.artworkTitle,
              },
            }
          );
          ordersUpdated++;
          console.log(`Updated order ${ord._id.toString()} with artwork '${art.title}' and artist '${art.artistName}'`);
        }
      }
    }
    console.log(`Total orders updated with artist metadata: ${ordersUpdated}`);

  } finally {
    await client.close();
    console.log("MongoDB connection closed.");
  }
}

run().catch((err) => {
  console.error("Sync error:", err);
  process.exit(1);
});
