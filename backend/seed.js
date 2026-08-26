require('dotenv').config();
const { MongoClient } = require('mongodb');

async function seed() {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI not set — aborting seed.');
    process.exit(1);
  }
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db();
    
    // Upsert search content — idempotent via unique title
    await db.collection('searchContent').createIndex({ title: 1 }, { unique: true });
    const docs = [
      {
        title: "IMSET",
        description: "site IMSET",
        url: "https://www.imset.ens.tn/",
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSIkRVLdKvvwqafDckZzaZXZUNii6Dru79zTg&s",
        contentType: "image",
        tags: ["linux", "logo"]
      },
      {
        title: "MYU",
        description: "website MYU",
        url: "https://myu.universitecentrale.net/sge/login.faces",
        image: "https://myu.universitecentrale.net/sge/javax.faces.resource/img/logo.png.faces",
        contentType: "image",
        tags: ["database", "nosql"]
      }
    ];
    for (const doc of docs) {
      await db.collection('searchContent').updateOne(
        { title: doc.title },
        { $setOnInsert: doc },
        { upsert: true }
      );
    }
    
    // Seed initial search history (skip if already present)
    const count = await db.collection('searchHistory').countDocuments();
    if (count === 0) {
      await db.collection('searchHistory').insertMany([
        { query: "IMSET", count: 10 },
        { query: "MYU", count: 5 },
        { query: "Node.js", count: 8 },
        { query: "React", count: 15 },
        { query: "MongoDB", count: 12 }
      ]);
    }
    
    console.log("Database seeded successfully!");
  } finally {
    await client.close();
  }
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});