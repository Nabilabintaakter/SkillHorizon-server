require("dotenv").config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const app = express();
const port = process.env.PORT || 5000;
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

// middleware
app.use(cors());
app.use(express.json());

const verifyToken = (req, res, next) => {
  // console.log('inside verify token', req.headers.authorization);
  if (!req.headers.authorization) {
    return res.status(401).send({ message: 'unauthorized access' });
  }
  const token = req.headers.authorization.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: 'unauthorized access' })
    }
    req.decoded = decoded;
    next();
  })
}


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
    const assignmentsCollection = db.collection('assignments')
    const paymentsCollection = db.collection('payments')
    const usersCollection = db.collection('users')

    // jwt related api
    app.post('/jwt', async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
      res.send({ token })
    })
    // ***************Middlewares******************
    // verify admin after verifyToken
    const verifyAdmin = async (req, res, next) => {
      const email = req.decoded.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      const isAdmin = user?.role === 'Admin';
      if (!isAdmin) {
        return res.status(403).send({ message: 'forbidden access' });
      }
      next();
    }
    // verify teacher after verifyToken
    const verifyTeacher = async (req, res, next) => {
      const email = req.decoded.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      const isTeacher = user?.role === 'Teacher';
      if (!isTeacher) {
        return res.status(403).send({ message: 'forbidden access' });
      }
      next();
    }


    // **************USERS related api****************

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
    // get user role (for all users either logged in or not)
    app.get('/users/role/:email', async (req, res) => {
      const email = req.params.email
      const result = await usersCollection.findOne({ email })
      res.send({ role: result?.role })
    })

    // (Admin) GET all users info
    app.get('/users', verifyToken, verifyAdmin, async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    })
    // GET a user his/her info by email 
    app.get('/users/:email', verifyToken, async (req, res) => {
      const email = req.params.email;
      const query = { email }
      const result = await usersCollection.find(query).toArray();
      res.send(result);
    })

    // (Admin) PATCH make a user admin
    app.patch('/users/admin/:id', verifyToken, verifyAdmin, async (req, res) => {
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


    // **************TEACHER , CLASS & ASSIGNMENTS related api***************

    // POST a teacher request by user
    app.post('/teacher-requests', verifyToken, async (req, res) => {
      const teacherInfo = req.body;
      const result = await teachersCollection.insertOne(teacherInfo);
      res.send(result);
    })
    // PATCH a teacher request again by user
    app.patch('/teacher-requests/:email', verifyToken, async (req, res) => {
      const email = req.decoded.email;
      if (!email) {
        return res.status(400).send({ error: "Email is required" });
      }
      const filter = { email: email };
      const updatedDoc = {
        $set: {
          status: "Pending",
        },
      };
      try {
        const result = await teachersCollection.updateOne(filter, updatedDoc);
        res.send(result);
      } catch (error) {
        res.status(500).send({ error: "Failed to update teacher status" });
      }
    })
    // (Teacher) POST a class request by teacher
    app.post('/classes', verifyToken, verifyTeacher, async (req, res) => {
      const classInfo = req.body;
      const result = await classesCollection.insertOne(classInfo);
      res.send(result);
    })
    // (Teacher) POST an assignment by teacher
    app.post('/assignments', verifyToken, verifyTeacher, async (req, res) => {
      const assignmentInfo = req.body;
      const result = await assignmentsCollection.insertOne(assignmentInfo);
      res.send(result);
    })
    // (Teacher) GET assignments of a class by specific teacher
    app.get('/assignments', verifyToken, verifyTeacher, async (req, res) => {
      const { teacherEmail, classId } = req.query;
      const result = await assignmentsCollection.find({
        teacherEmail: teacherEmail,
        classId: classId
      }).toArray();
      res.send(result);
    });
    // (Teacher) GET all classes added by a specific teacher
    app.get('/classes/:email', verifyToken, verifyTeacher, async (req, res) => {
      const email = req.params.email;
      const query = { email }
      const result = await classesCollection.find(query).toArray();
      res.send(result);
    })
    // (Teacher) PATCH update a class by its teacher
    app.patch('/update-class/:id', verifyToken, verifyTeacher, async (req, res) => {
      const id = req.params.id;
      const { title, price, image, description } = req.body;
      if (!title || !price || !image || !description) {
        return res.status(400).send({ error: "All fields (title, price, image, description) are required" });
      }
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          title,
          price,
          image,
          description,
        },
      };

      try {
        const result = await classesCollection.updateOne(filter, updatedDoc);
        if (result.matchedCount === 0) {
          return res.status(404).send({ error: "Class not found" });
        }
        res.send(result);
      } catch (error) {
        console.error("Error updating class:", error);
        res.status(500).send({ error: "Failed to update class" });
      }
    });
    // (Teacher) DELETE a class by its teacher
    app.delete('/my-class/:id', verifyToken, verifyTeacher, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await classesCollection.deleteOne(query);
      res.send(result)
    })
    // (Teacher) GET a class details by id
    app.get('/my-class-assignment/:id', verifyToken, verifyTeacher, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await classesCollection.findOne(query);
      res.send(result);
    })

    // (Admin) PATCH approve a teacher
    app.patch('/users/teacher-approve/:email', verifyToken, verifyAdmin, async (req, res) => {
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
        res.status(500).send({ error: "Failed to update user role" });
      }
    });
    // (Admin) PATCH reject a teacher
    app.patch('/users/teacher-reject/:email', verifyToken, verifyAdmin, async (req, res) => {
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
    app.patch('/admin/approve-class/:id', verifyToken, verifyAdmin, async (req, res) => {
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
        res.status(500).send({ error: "Failed to update class status" });
      }
    });
    // (Admin) PATCH reject a class
    app.patch('/admin/reject-class/:id', verifyToken, verifyAdmin, async (req, res) => {
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
    // (Admin) GET all teacher requests from users
    app.get('/teachers', verifyToken, verifyAdmin, async (req, res) => {
      const result = await teachersCollection.find().toArray();
      res.send(result);
    })
    // GET a specific teacher data by his/her email
    app.get('/teachers/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await teachersCollection.findOne(query);
      res.send(result)
    })
    // (Admin) GET all class requests from teachers
    app.get('/classes', verifyToken, verifyAdmin, async (req, res) => {
      const result = await classesCollection.find().toArray();
      res.send(result);
    })
    //  GET all class approved by admin (for all users either logged in or not)
    app.get('/all-classes', async (req, res) => {
      const query = { status: 'Accepted' }
      const result = await classesCollection.find(query).toArray();
      res.send(result);
    })
    //  GET a class details by id for a student
    app.get('/class/:id', verifyToken, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await classesCollection.findOne(query);
      res.send(result);
    })
    // GET all enrolled classes of a specific student
    app.get('/my-enroll-class/:email', verifyToken, async (req, res) => {
      try {
        const studentEmail = req.params.email;
        const enrolledClasses = await paymentsCollection.find({ studentEmail }).toArray();
        const classDetails = await Promise.all(
          enrolledClasses.map(async (payment) => {
            const classData = await classesCollection.findOne({ _id: new ObjectId(payment.classId) });
            return {
              title: classData?.title,
              image: classData?.image,
              email: classData?.email
            };
          })
        );
        res.send(classDetails);
      } catch (error) {
        console.error('Error fetching enrolled classes:', error);
        res.status(500).send({ message: 'Internal server error.' });
      }
    });

    // -------------------PAYMENT INTENT--------------------
    // create payment intent
    app.post('/create-payment-intent', async (req, res) => {
      const { price } = req.body;
      const amount = parseInt(price * 100);
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: "usd",
        payment_method_types: [
          "card"
        ]
      });
      res.send({
        clientSecret: paymentIntent.client_secret
      })
    })
    // POST payment info by student
    app.post('/payments', verifyToken, async (req, res) => {
      const paymentInfo = req.body;
      const result = await paymentsCollection.insertOne(paymentInfo);
      res.send(result);
    })


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