require('dotenv').config();
const { MongoClient } = require('mongodb');

async function seed() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db();
    
    // Seed search content
    await db.collection('searchContent').insertMany([
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
    ]);
    
    // Seed initial search history
    await db.collection('searchHistory').insertMany([
      { query: "IMSET", count: 10 },
      { query: "MYU", count: 5 },
      { query: "Node.js", count: 8 },
      { query: "React", count: 15 },
      { query: "MongoDB", count: 12 }
    ]);
    
    console.log("Database seeded successfully!");
  } finally {
    await client.close();
  }
}

seed();