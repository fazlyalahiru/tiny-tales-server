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
    },
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: 10
});

async function run() {
    try {
        client.connect((err) => {
            if (err) {
                console.error(err);
                return;
            }
        })
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();
        const toyCollection = client.db("tiny-tales").collection("toys")

        // Creating index 
        const indexKey = { toyName: 1 };
        const indexOption = { name: "searchToy" };
        const result = await toyCollection.createIndex(indexKey, indexOption);

        app.get('/all-toys/:search', async (req, res) => {
            const searchText = req.params.search;
            const result = await toyCollection.find({
                 
                     toyName: { $regex: searchText, $options: "i" } 
                    // { subCategory: { $regex: searchText, $options: "i" } }
                
            }).toArray();
            res.send(result);
        });


        // get all toys
        app.get('/all-toys', async (req, res) => {
            const allToys = toyCollection.find();
            const result = await allToys.limit(20).toArray();
            res.send(result)
        })

        //get filtered toys
        app.get('/all-toys/:Category', async (req, res) => {
            if (req.params.Category == "LEGO City" || req.params.Category == "LEGO Star Wars" || req.params.Category == "LEGO Ninjago") {
                const result = await toyCollection.find({ subCategory: req.params.Category }).limit(3).toArray();
                return res.send(result)
            }
        })

        // get specific data from db
        app.get('/toy/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await toyCollection.findOne(query)
            res.send(result)
        })

        // get user specific toys
        app.get('/my-toys/:email', async (req, res) => {
            const result = await toyCollection.find({ sellerEmail: req.params.email }).toArray();
            res.send(result)
        })
        app.get('/my-toy-asc/:email', async (req, res) => {
            const result = await toyCollection.find({ sellerEmail: req.params.email }).sort({price: 1}).toArray();
            res.send(result)
        })
        app.get('/my-toy-des/:email', async (req, res) => {
            const result = await toyCollection.find({ sellerEmail: req.params.email }).sort({price: -1}).toArray();
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
            const updatedToyData = req.body;
            console.log(updatedToyData);
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