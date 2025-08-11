const { MongoClient, ServerApiVersion } = require("mongodb");
require('dotenv').config();
// Replace the placeholder with your Atlas connection string
const uri = process.env.MONGO_URI;
const dbname = 'sample'
const state={
    db:null
}
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri,  {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
        }
    }
);

module.exports.connect=async function run() {
  try {
    // Connect the client to the server (optional starting in v4.7)
    await client.connect();

    // Send a ping to confirm a successful connection
    //await client.db("admin").command({ ping: 1 });
     state.db = await client.db(dbname);
    console.log("You successfully connected to MongoDB!");
  }
  finally {

    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
module.exports.get= function(){
    return state.db
}