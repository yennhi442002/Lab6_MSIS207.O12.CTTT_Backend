import express from 'express';
import mongoose from 'mongoose';
import Cors from 'cors';
import Posts from './postModel.js';
import Pusher from 'pusher';

const app = express()
const port = process.env.PORT || 9000
const connection_url = 'mongodb+srv://nhi:CK2wH0cbdvw9Bbjl@cluster0.x8t2bt5.mongodb.net/?retryWrites=true&w=majority'
const pusher = new Pusher({
    app_id : "1731842",
    key: "653d49b3df1f03f025bb",
    secret: "0fefaa81ec33beb7238a",
    cluster: "ap1",
    useTLS: true
});

app.use(express.json())
app.use(Cors())

mongoose.connect(connection_url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

const db = mongoose.connection
mongoose.connection.once('open', () => {
    console.log('DB Connected')
    const changeStream = mongoose.connection.collection('posts').watch()
    changeStream.on('change', change => {
        console.log(change)
        if (change.operationType === "insert") {
            console.log('Trigerring Pusher')
            pusher.trigger('posts', 'inserted', {
                change: change
            })
        } else {
            console.log('Error trigerring Pusher')
        }
    })
})
app.get("/", (req, res) => res.status(200).send("Hello TheWebDev"))

app.post('/upload', (req, res) => {
    const dbPost = req.body
    Posts.create(dbPost)
        .then(data => {
            res.status(201).send(data);
        })
        .catch(err => {
            res.status(500).send(err);
        });
})
app.get('/sync', (req, res) => {
    Posts.find()
        .then(data => {
            res.status(200).send(data);
        })
        .catch(err => {
            res.status(500).send(err);
        });
})

app.listen(port, () => console.log(`Listening on localhost: ${port}`))