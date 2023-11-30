
const express = require('express')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const cors = require('cors')
const jwt = require("jsonwebtoken");
const dotenv = require('dotenv')
dotenv.config()
const stripe = require('stripe')(process.env.STRYPE_SECRET_KEY);
const port = process.env.PORT || 5001;

// middlewar
app.use(cors())
app.use(express.json())



// mazharulislam3569
// kFXUW2zYOblz9t28



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.2amgiws.mongodb.net/?retryWrites=true&w=majority`;


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
    const reviewsCollection = client.db("finalProjectDB").collection("reviews");
    const upcommingCollection = client.db("finalProjectDB").collection("upcomming");
    const cardCollection = client.db("finalProjectDB").collection("card");
    const memberShipCollection = client.db("finalProjectDB").collection("memberShip");
    const PayCollection = client.db("finalProjectDB").collection("Pay");
    const sendCollection = client.db("finalProjectDB").collection("send");


    // jwt api
    app.post('/jwt', async(req,res)=>{
      const user = req.body;
      const token = jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{
      expiresIn: '2h'});
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
      const verifyAdmin = async (req, res, next) => {
        const email = req.decoded.email;
        const query = { email: email };
        const user = await usersCollection.findOne(query);
        const isAdmin = user?.role === 'admin';
        if (!isAdmin) {
          return res.status(403).send({ message: 'forbidden access' });
        }
        next();
      }


    // verify admin
    // const verifyAdmin = async (req,res,next) =>{
    //   const email = req.decoded.email;
    //   const query = { email: email };
    //   const user = await usersCollection.findOne(query)
    //   const isAdmin = user?.role === 'admin'
     
    //   if(!isAdmin){
    //     return res.status(403).send({ message: 'forbidden access' })
    //   }
    // }


    // user api
    app.get('/users', verifyToken,   async(req,res)=>{
      const result = await usersCollection.find().toArray()
      res.send(result)
    })


    // delete
    app.delete("/allData/:id", async (req, res) => {
      const id = req.params.id;
      console.log("id", id);
      const query = {
        _id: new ObjectId(id),
      };
      const result = await allDataCollection.deleteOne(query);
      console.log(result);
      res.send(result);
    });

   




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




    app.post('/users',verifyToken, async(req,res)=>{
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

    app.patch('/users/admin/:id',verifyToken, async(req,res)=>{
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

    app.post('/allData', async(req, res) => {
      const user = req.body;    
      const result = await allDataCollection.insertOne(user);
      res.send(result);
      console.log(result);
    });

    app.get('/allData',async(req,res)=>{
      const result = await allDataCollection.find().toArray()
      res.send(result)
    })
    
    app.get('/allData',async(req,res)=>{
      const email = req.query.email
      const query = { email: email }
      const result = await allDataCollection.find(query).toArray()
      res.send(result)
    })


    app.post('/upcoming', async(req, res) => {
      const user = req.body;    
      const result = await upcommingCollection.insertOne(user);
      res.send(result);
      console.log(result);
    });


    app.get('/upcoming',async(req,res)=>{
      const result = await upcommingCollection.find().toArray()
      res.send(result)
    })


    
    

    app.get('/allData/:id',async(req,res)=>{
      const id=req.params.id
      const query={_id: new ObjectId(id)}
      const result= await allDataCollection.findOne(query)
      res.send(result)
    })

    // update data

    app.put('/allData/:id', async (req, res) => {
      const id = req.params.id
      const filter = { _id: new ObjectId(id) }
        const options = { upsert: true }
        const updatedData = req.body
        const data = {
          $set: {
            name:updatedData.name,
            image:updatedData.image, 
            title:updatedData.title, 
            description:updatedData.description, 
            
          }

        }

      const result = await allDataCollection.updateOne(filter,data,options)
      res.send(result)
    })


  

    // review
    app.post('/reviews', async(req,res)=>{
      const review = req.body;
      const result = await reviewsCollection.insertOne(review);
      res.send(result)
    })


    app.get('/reviews',async(req,res)=>{
      const result = await reviewsCollection.find().toArray()
      res.send(result)
    })


    // memberShip

    // app.post('/memberShipp',async(req,res)=>{
    //   const membership = req.body;
    //   const result = await memberShipCollection.insertOne(membership)
    //   res.send(result)

    // })



    app.get('/memberShipp', async (req, res) => {
      try {
        const result = await memberShipCollection.find().toArray();
        console.log(result);
        res.send(result);
      } catch (error) {
        console.error('Error retrieving member data:', error);
        res.status(500).send('Error retrieving member data');
      }
    });
    

    // payment
    app.post('/create-payment-intent', async (req, res) => {
      const { price } = req.body;
      console.log(price);
      const amount = parseInt(price * 100);
      console.log(amount, 'amount inside the intent')

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: 'usd',
        payment_method_types: ['card']
      });

      res.send({
        clientSecret: paymentIntent.client_secret
      })
    });

    app.post('/memberShipPay', async(req,res)=>{
      const review = req.body;
      const result = await memberShipPayCollection.insertOne(review);
      res.send(result)
    })





    app.post('payments',async(req,res)=>{
      const payment = req.body;
      const paymentResult = await PayCollection.insertOne(payment)
      console.log('pay info', payment);
      res.send(paymentResult)
    })


    // send

    app.post('/send',async(req,res)=>{
      const send = req.body;
      const sendResult = await sendCollection.insertOne(send)
      res.send(sendResult)
    })

    app.get('/send',async(req,res)=>{
      const result = await sendCollection.find().toArray()
      res.send(result)
    })


    // like

    app.put('/like',async (req,res)=>{
      const id = req.body
        const query = { _id: new ObjectId(id) };
        const updateReviewLike = {
          $inc: {
            like: 1,
          },
        };
        const result = await allDataCollection.updateOne(
          query,
          updateReviewLike
        );
        res.send(result);
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