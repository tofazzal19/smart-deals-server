 const express = require('express');
 const cors = require('cors');
 const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
 const app = express();
 const port = process.env.PORT || 4000;

//  Middleware 

app.use(cors());
app.use(express.json());

//  Database Auth: User# smartDBUser pass# DaDVU2nyUWpUg9Ye
const uri = "mongodb+srv://smartDBUser:DaDVU2nyUWpUg9Ye@cluster0.jflpcdt.mongodb.net/?appName=Cluster0";


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,  
    deprecationErrors: true,
  }
});

app.get('/', (req, res) =>{
    res.send('Smart Server is Running');

})

 async function run (){

    try{
   await client.connect();


   const db = client.db('smart_db');
   const productsCollection = db.collection('products');
   const bidsCollection = db.collection('bids');
   const usersCollection = db.collection('users');

// USERS API
   app.post('/users', async(req, res) =>{
     const newUser =req.body;
     const email = req.body.email;
     const query = {email: email}
     const existingUser = await usersCollection.insertOne(query)
     if(existingUser){
        res.send({message: 'user already exits. do not need to insert agin'})
     }
     else{
          const result = await usersCollection.insertOne(newUser);
     res.send(result);
     }
     
     
   })

// PRODUCTS API
   app.get('/products', async(req, res) =>{
    //  const projectFileds = { title: 1, price_min: 1, price_max: 1, image: 1 }
    //  const cursor = productsCollection.find().sort({price_min: -1}).skip(2).limit(3).project(projectFileds);
     
     const email = req.query.email;
     const query = {}
     if(email){
      query.email= email;
     }
     const cursor = productsCollection.find(query);
     const result = await cursor.toArray();
     res.send(result);
   });

   app.get('/latest-products', async(req, res) => {
      const cursor = productsCollection.find().limit(6);
      const result = await cursor.toArray()
      res.send(result);
   })

   app.get('/products/:id', async(req, res) =>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await productsCollection.findOne(query);
      res.send(result);
   })


   app.post('/products', async (req, res) => {
      const newProduct = req.body;
      const result = await productsCollection.insertOne(newProduct);
      res.send(result);
   })

   app.patch('/products/:id', async(req, send) =>{
    const id =req.params.id;
    const updatedProduct = req.body;
    const query = {_id: new ObjectId(id)}
    const update = {
         $set:{
            name: updatedProduct.name,
            price: updatedProduct.price
         }
    }
    const result = await productsCollection.updateOne(query, update)
    res.send(result);
   })

   app.delete('/products/:id', async (req, res) =>{
     const id = req.params.id;
     const query = {_id: new ObjectId(id)}
     const result = await productsCollection.deleteOne(query);
     res.send(result);
   })


   //Bids relatd apis

   app.get('/bids', async(req, res) =>{


    const email = req.query.email;
    const query ={};
    if(email){
        query.buyer_email= email;
    }

     const cursor = bidsCollection.find(query);
     const result = await cursor.toArray();
     res.send(result);
   })


  app.post('/bids', async(req, res) => {
    const newBid =req.body;
    const result = await bidsCollection.insertOne(newBid);
    res.send(result);
  })

   await client.db("admin").command({ ping: 1 });
   console.log("Pinged your deployment. You successfully connected to MongoDB!");
}
finally{

}

}
run().catch(console.dir);

// client.connect()
// .then(() => {
//     app.listen(port, () => {
//         console.log(`Smart server is running on port: ${port}`)
//     })
// })

// .catch(console.dir)



app.listen(port,() =>{
    console.log(`Smart Server running now  On: ${port}`);
})