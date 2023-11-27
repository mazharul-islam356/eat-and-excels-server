const express = require('express')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
   
    // collection name
    const allDataCollection = client.db("finalProjectDB").collection("allData");
    const usersCollection = client.db("finalProjectDB").collection("users");


    // user api

    app.get('/users', async(req,res)=>{
      const result = await usersCollection.find().toArray()
      res.send(result)
    })

    app.post('/users', async(req,res)=>{
      const user = req.body
      // insert email if user dose not exist
      const query = {email: user.email}
      const existingUser = await usersCollection.findOne(query)
      if(existingUser){
        return res.send({message:'user already existing', insertedId: null})
      }
      const result = await usersCollection.insertOne(user)
      res.send(result)
    })

    app.patch('/users/admin/:id', async(req,res)=>{
      const id = req.params.id;
      const query = { _id: new ObjectId(id)}
      const updateDocs = {
        $set: {
          role:'admin'
        }
      }
      const result = await usersCollection.updateOne(query,updateDocs)
      res.send(result);
      
    })



    // all data api
    app.get('/allData',async(req,res)=>{
      const result = await allDataCollection.find().toArray()
      res.send(result)
    })



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