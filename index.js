const express = require('express')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const cors = require('cors')
const jwt = require("jsonwebtoken");
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





    // jwt api
    app.post('/jwt', async(req,res)=>{
      const user = req.body;
      const token = jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{
      expiresIn: '1h'});
      res.send({token});
    })


    // verify middlewares
    const verifyToken = (req,res,next) =>{
      // console.log('inserted in verify middlewares',req.headers.authorization);

      if(!req.headers.authorization){
        return res.status(401).send({message: 'unauthorized access'})
      }
      const token = req.headers.authorization.split(' ')[1]
      jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(error,decoded)=>{
        if(error){
          return res.status(401).send({message: 'unauthorized access'})
        }
        req.decoded = decoded;
        next()
      })

    }


    // verify admin
    const verifyAdmin = async (req,res,next) =>{
      const email = req.decoded.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query)
      const isAdmin = user?.role === 'admin'
     
      if(!isAdmin){
        return res.status(403).send({ message: 'forbidden access' })
      }
    }


    // user api
    app.get('/users', verifyToken, verifyAdmin,  async(req,res)=>{
      const result = await usersCollection.find().toArray()
      res.send(result)
    })

    


    app.get('/users/admin/:email',verifyToken, async(req,res)=>{
      const email = req.params.email
      if(email !== req.decoded.email){
        return res.status(403).send({message: 'forbidden access'})
      }

      const query = {email: email}
      const user = await usersCollection.findOne(query)
      console.log(user);
      let admin = false;
      if(user){
        admin = user?.role === 'admin'
      }
      console.log('isadmin.....',admin);
      res.send({admin})
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

    app.post('/allData', async(req, res) => {
      const user = req.body;    
      const result = await allDataCollection.insertOne(user);
      res.send(result);
      console.log(result);
    });

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