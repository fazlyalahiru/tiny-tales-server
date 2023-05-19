const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

// middleware section
app.use(cors())
app.use(express.json())



// MongoDB code starts here
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ywgzzs0.mongodb.net/?retryWrites=true&w=majority`;

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
        await client.connect();
        const toyCollection = client.db("tiny-tales").collection("toys")

        // get all toys
        app.get('/all-toys', async (req, res) => {
            const allToys = toyCollection.find();
            const result = await allToys.toArray();
            res.send(result)
        })

        // get specific data from db
        app.get('/toy/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await toyCollection.findOne(query)
            res.send(result)
        })

        // insert a toy: post method
        app.post('/upload-toy', async (req, res) => {
            const data = req.body;
            console.log(data);
            const result = await toyCollection.insertOne(data)
            res.send(result)
        })
        // update a toy
        app.patch('/toy/:id', async (req, res) => {
            const id = req.params.id;
            const updatedToyData = res.body;
            const filter = { _id: new ObjectId(id) }
            const updatedDoc = {
                $set: {
                    ...updatedToyData
                }
            }
            const result = toyCollection.updateOne(filter, updatedDoc)
            res.send(result)
        })

        // delete a toy
        app.delete('/toy/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const result = await toyCollection.deleteOne(filter)
            res.send(result)
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

// MongoDB code ends here

app.get('/', (req, res) => {
    res.send('server is running')
})

app.listen(port, () => {
    console.log(`tinytales server running on port ${port}`);
})