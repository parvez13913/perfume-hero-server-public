const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId, } = require('mongodb');
require('dotenv').config();
const app = express();


// middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.pptkl.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {
    try {
        await client.connect();
        const inventoryCollection = client.db("perfumeHero").collection("service");
        const myInventoryCollection = client.db("perfumeHero").collection("myInventory");
        app.get('/inventory', async (req, res) => {
            const query = {}
            const cursor = inventoryCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);
        });

        app.get('/inventory/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const inventory = await inventoryCollection.findOne(query);
            res.send(inventory);
        });

        // POST
        app.post('/inventory', async (req, res) => {
            const newInventory = req.body;
            const result = inventoryCollection.insertOne(newInventory);
            res.send(result);
        });

        // DELETE

        app.delete('/inventory/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await inventoryCollection.deleteOne(query);
            res.send(result);
        });




        // update inventory
        app.put('/inventory/:id', async (req, res) => {
            const updateInventory = req.body;
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: updateInventory
            };
            const result = await inventoryCollection.updateOne(query, updateDoc, options);
            console.log(result);
            res.send(result);
        });

        // my Inventory
        app.post('/myInventory', async (req, res) => {
            const myInventory = req.body;
            const result = await myInventoryCollection.insertOne(myInventory);
            res.send(result);
        });

        app.get('/myInventory', async (req, res) => {
            const email = req.query.email
            const query = { email: email };
            const cursor = myInventoryCollection.find(query);
            const myInventory = await cursor.toArray(cursor);
            res.send(myInventory);
        });
        app.delete('/myInventory/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await myInventoryCollection.deleteOne(query);
            res.send(result);
        });
    }

    finally {

    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Server Running');
});

app.listen(port, () => {
    console.log("server is running ha ha ha");
})