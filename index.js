const express = require('express')
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express()
const cors = require('cors')

const dotenv = require('dotenv')
dotenv.config()
const port = process.env.PORT || 5001;

// middlewar
app.use(cors())
app.use(express.json())



// mazharulislam3569
// kFXUW2zYOblz9t28



const uri = "mongodb+srv://mazharulislam3569:kFXUW2zYOblz9t28@cluster0.2amgiws.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir);





app.get('/',(req,res)=>{
    res.send('useer port is running')
})

app.listen(port,()=>{
    console.log(`this port is running: ${port}`)
})