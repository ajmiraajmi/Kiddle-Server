const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;
require("dotenv").config();

app.use(express.json());
app.use(cors());

// Replace <db_username> and <db_password> with your actual MongoDB credentials
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.t0p010p.mongodb.net/kiddle?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    const userCollection = client.db("kiddle").collection("user");
    const toyCollection = client.db("kiddle").collection("alltoys");
    const categoryCollection = client.db("kiddle").collection("category");
    const addToyCollection = client.db("kiddle").collection("toy");

    app.get("/alltoys", async (req, res) => {
      const cursor = toyCollection.find();
      const alltoys = await cursor.toArray();
      res.send(alltoys);
    });

    app.get("/category", async (req, res) => {
      const cursor = categoryCollection.find();
      const category = await cursor.toArray();
      res.send(category);
    });

    app.get("/toy", async (req, res) => {
      const cursor = addToyCollection.find();
      const category = await cursor.toArray();
      res.send(category);
    });

    app.get("/toy/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await addToyCollection.findOne(query);
      res.send(result);
    });

    //  search toyCollection

    app.get("/search", async (req, res) => {
      const toyName = req.query.name;
      console.log(toyName);
      const query = { $or: [{ name: { $regex: toyName, $options: "i" } }] };
      const result = await addToyCollection.find(query).toArray();
      res.send(result);
    });

    // deelete
    app.delete("/toy/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }; // Use _id here
      const result = await addToyCollection.deleteOne(query);
      res.send(result);
    });

    // Update toy information
    app.patch("/toy/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const data = req.body;

      const updateToy = {
        $set: {
          price: data.price,
          quantity: data.quantity,
          description: data.description,
        },
      };
      const result = await addToyCollection.updateOne(
        filter,
        updateToy,
        options
      );
      res.send(result);
    });

    //user related apis
    app.post("/user", async (req, res) => {
      const user = req.body;
      console.log(user);
      const result = await userCollection.insertOne(user);
      res.send(result);
    });

    app.post("/toy", async (req, res) => {
      const newToy = req.body;
      console.log(newToy);
      const result = await addToyCollection.insertOne(newToy);
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });

    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    app.get("/", (req, res) => {
      res.send("App is Running Successfully");
    });

    app.listen(port, () => {
      console.log(`Application is running on port ${port}`);
    });
  } catch (error) {
    console.error("Error connecting to the database:", error);
  }
}

run().catch(console.dir);
