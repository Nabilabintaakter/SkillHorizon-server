require("dotenv").config();
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.5f9uk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    // await client.connect();

    const db = client.db('skillHorizonDB')
    const teachersCollection = db.collection('teachers')
    const classesCollection = db.collection('classes')
    const usersCollection = db.collection('users')

    // POST teacher request by user
    app.post('/teacher-requests', async (req, res) => {
      const teacherInfo = req.body;
      const result = await teachersCollection.insertOne(teacherInfo);
      res.send(result);
    })
    // (Teacher) POST class request by teacher
    app.post('/classes', async (req, res) => {
      const classInfo = req.body;
      const result = await classesCollection.insertOne(classInfo);
      res.send(result);
    })
    // POST users data in db
    app.post('/users', async (req, res) => {
      const user = req.body;
      // insert email if user doesn't exist
      const query = { email: user.email }
      const existingUser = await usersCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: 'User already exists!', insertedId: null })
      }
      const result = await usersCollection.insertOne(user);
      res.send(result);
    })
    // (Teacher) GET all class requests added by a specific teacher
    app.get('/classes/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email }
      const result = await classesCollection.find(query).toArray();
      res.send(result);
    })
    // (Admin) GET all teacher requests from users
    app.get('/teachers', async (req, res) => {
      const result = await teachersCollection.find().toArray();
      res.send(result);
    })
    // (Admin) GET all class requests from teachers
    app.get('/classes', async (req, res) => {
      const result = await classesCollection.find().toArray();
      res.send(result);
    })
    // (Admin) GET all users info
    app.get('/users', async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    })
    // GET a user his/her info by email
    app.get('/users/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email }
      const result = await usersCollection.find(query).toArray();
      res.send(result);
    })

    // (Admin) PATCH make a user admin
    app.patch('/users/admin/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const updatedDoc = {
        $set: {
          role: "Admin"
        }
      }
      const result = await usersCollection.updateOne(filter, updatedDoc)
      res.send(result)
    })

    // (Admin) PATCH approve a teacher
    app.patch('/users/teacher-approve/:email', async (req, res) => {
      const email = req.params.email;
      if (!email) {
        return res.status(400).send({ error: "Email is required" });
      }
      const filter = { email: email };
      const updatedDoc1 = {
        $set: {
          status: "Accepted",
        },
      };
      const updatedDoc2 = {
        $set: {
          role: "Teacher",
        },
      };
      try {
        const result1 = await teachersCollection.updateOne(filter, updatedDoc1);
        const result2 = await usersCollection.updateOne(filter, updatedDoc2);
        if (result2.matchedCount === 0) {
          return res.status(404).send({ error: "User not found" });
        }
        res.send({ result1, result2 });
      } catch (error) {
        console.error(error);
        res.status(500).send({ error: "Failed to update user role" });
      }
    });
    // (Admin) PATCH approve a teacher
    app.patch('/users/teacher-reject/:email', async (req, res) => {
      const email = req.params.email;
      if (!email) {
        return res.status(400).send({ error: "Email is required" });
      }
      const filter = { email: email };
      const updatedDoc1 = {
        $set: {
          status: "Rejected",
        },
      };
      const updatedDoc2 = {
        $set: {
          role: "Student",
        },
      };
      try {
        const result1 = await teachersCollection.updateOne(filter, updatedDoc1);
        const result2 = await usersCollection.updateOne(filter, updatedDoc2);
        if (result2.matchedCount === 0) {
          return res.status(404).send({ error: "User not found" });
        }
        res.send({ result1, result2 });
      } catch (error) {
        console.error(error);
        res.status(500).send({ error: "Failed to update user role" });
      }
    });

    // (Admin) PATCH approve a class
    app.patch('/admin/approve-class/:id', async (req, res) => {
      const id = req.params.id;
      if (!id) {
        return res.status(400).send({ error: "Something went wrong." });
      }
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          status: "Accepted",
        },
      };
      try {
        const result = await classesCollection.updateOne(filter, updatedDoc);
        res.send(result);
      } catch (error) {
        console.error(error);
        res.status(500).send({ error: "Failed to update class status" });
      }
    });
    // (Admin) PATCH reject a class
    app.patch('/admin/reject-class/:id', async (req, res) => {
      const id = req.params.id;
      if (!id) {
        return res.status(400).send({ error: "Something went wrong." });
      }
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          status: "Rejected",
        },
      };
      try {
        const result = await classesCollection.updateOne(filter, updatedDoc);
        res.send(result);
      } catch (error) {
        console.error(error);
        res.status(500).send({ error: "Failed to update class status" });
      }
    });



    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('SkillHorizon is going to blast! Are you ready?')
})

app.listen(port, () => {
  console.log(`SkillHorizon server is running on port: ${port}`);
})