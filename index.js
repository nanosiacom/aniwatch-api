const axios = require('axios')
const cors = require('cors')
const express = require('express')

const app = express()
const port = process.env.PORT || 3000

const corsOptions = {
    origin: '*',
    credentials: true,
    optionSuccessStatus: 200,
    port: port,
};

app.use(cors(corsOptions));
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello World!')
})