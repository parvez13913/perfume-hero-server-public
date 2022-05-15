const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId, } = require('mongodb');
const { status } = require('express/lib/response');
require('dotenv').config();
const app = express();


// middleware
app.use(cors());
app.use(express.json());

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    next();
    if (!authHeader) {
        return res.status(401).send({ message: 'Unauthorized Access' });
    }

    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, decoded) => {
        if (error) {
            return res.status(403).send({ massage: 'Forbidden Access' });
        }

        req.decoded = decoded;
    })
}

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

        app.get('/myInventory', verifyJWT, async (req, res) => {
            const decodedEmail = req.decoded.email;
            const email = req.query.email
            if (email === decodedEmail) {
                const query = { email: email };
                const cursor = myInventoryCollection.find(query);
                const myInventory = await cursor.toArray(cursor);
                res.send(myInventory);
            }

            else {
                res.status(403).send({ massage: 'Forbidden Access' });
            }
        });
        app.delete('/myInventory/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await myInventoryCollection.deleteOne(query);
            res.send(result);
        });

        app.post('/login', async (req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '1d'
            });
            res.send({ accessToken });
        })
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