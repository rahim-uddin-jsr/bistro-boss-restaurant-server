const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ztr719a.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const userCollection = client.db("bistroBoss").collection("userCollection");
const menusCollection = client.db("bistroBoss").collection("menusCollection");
const reviewCollection = client.db("bistroBoss").collection("reviewCollection");
const cartCollection = client.db("bistroBoss").collection("cartCollection");
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
    // user related apis
    app.get("/users", async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });

    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const isUserExist = await userCollection.findOne(query);
      console.log(isUserExist);
      if (isUserExist) {
        return res.send({ isUserExist });
      }
      const result = await userCollection.insertOne(user);
      res.send(result);
    });
    app.patch("/users/admin/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          role: `admin`,
        },
      };
      const result = await userCollection.updateOne(filter, updateDoc);
      console.log(result);
      res.send(result);
    });
    // reviews related apis
    app.get("/reviews", async (req, res) => {
      const result = await reviewCollection.find().toArray();
      res.send(result);
    });
    // menu related apis
    app.get("/menus", async (req, res) => {
      const result = await menusCollection.find().toArray();
      res.send(result);
    });
    app.get("/carts", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      if (!email) {
        res.send([]);
      }
      const result = await cartCollection.find(query).toArray();
      console.log(result);
      res.send(result);
    });
    app.post("/carts", async (req, res) => {
      const cart = req.body;
      console.log(cart);
      const result = await cartCollection.insertOne(cart);
      console.log(result);
      res.send(result);
    });
    app.delete("/carts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };

      const result = await cartCollection.deleteOne(query);
      console.log(result);
      res.send(result);
    });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("bistro server running");
});

app.listen(port, () => {
  console.log("bistro server run on port=", port);
});
