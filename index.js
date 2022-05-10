const express = require('express');
const cors = require('cors');
const poet = process.env.PORT || 5000;
require('dotenv').config();
const app = express();


// middleware
app.use(cors());
app.use(express.json());


app.get('/', (req, res) => {
    res.send('Server Running');
});

app.listen(port, () => {
    console.log("server is running ha ha ha");
})