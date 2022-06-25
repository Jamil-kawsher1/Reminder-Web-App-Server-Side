const express = require('express');
const app = express();

const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;
const ObjectId = require('mongodb').ObjectId;
app.use(cors());
app.use(express.json());
// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.l9s2s.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
// const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.81hzp.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {
    try {
        // Connect the client to the server
        await client.connect();
        const database = client.db("ReminderApp");
        const ReminderCollection = database.collection("reminders");
        // console.log("Connected successfully to server");







        //getting user Specific reminder reminders
        app.get('/myreminders/:email', async (req, res) => {
            const query = ReminderCollection.find({
                userEmail: req.params.email,
            });
            const result = await query.toArray();
            res.send(result)
        })

        //adding(posting) reminders
        app.post('/addreminder', async (req, res) => {
            const reminderAdd = req.body;
            // const isReminded = false;
            // const newReminder = { whatsAppNumber, reminderDateTime, reminderMsg, isReminded }
            const inputresult = ReminderCollection.insertOne(reminderAdd);
            res.send(inputresult);
        })

        // delete a single order
        app.delete("/deletereminder/:id", async (req, res) => {
            // console.log(req.params.id);
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await ReminderCollection.deleteOne(query);
            // console.log(result);
            res.json(result);
        });








        setInterval(async () => {
            const reminders = ReminderCollection.find({});
            const result = await reminders.toArray();

            if (result) {

                result.forEach(async reminder => {
                    // console.log(reminder.isReminded)
                    if (reminder.isReminded == false) {
                        // console.log(reminder.reminderMsg)
                        const now = new Date();
                        // console.log(now)

                        if ((new Date(reminder.reminderDateTime) - now) < 0) {
                            // console.log("test")
                            const query = { _id: ObjectId(reminder._id) };
                            // const resultR = await query.toArray();
                            // console.log(query)
                            const updateDoc = {
                                $set: {
                                    isReminded: true
                                },
                            };
                            const update = await ReminderCollection.updateOne(query, updateDoc);
                            const messagebody = reminder.reminderMsg;
                            const whatsAppNumber = reminder.whatsAppNumber;
                            // const accountSid = 'ACbe5bff58464aae82291a3f58f05f2d58';
                            // const authToken = '9aa5c0c9e5d56b6520bca7714448c018';
                            // const client = require('twilio')(accountSid, authToken);

                            // client.messages
                            //     .create({
                            //         body: reminder.reminderMsg,
                            //         from: 'whatsapp:+8801682953579',
                            //         to: `whatsapp:+8801778778081`,
                            //     })
                            //     .then(message => console.log(message.sid))
                            //     .done();





                            var request = require('request');
                            var options = {
                                'method': 'POST',

                                'url': `http://66.45.237.70/api.php?username=${process.env.SMS_USER_NAME}&password=${process.env.SMS_PASSWORD}&number=88${whatsAppNumber}&message=${messagebody}`,

                                'headers': {
                                    'Content-Type': 'application/x-www-form-urlencoded'
                                }
                            };
                            request(options, function (error, response) {
                                if (error) throw new Error(error);
                                // console.log(response.body);
                            });
                        }


                    }
                })
            }

        }, 1000)
            ;


    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Hello From Reminder Web App')
})


app.listen(port, () => {
    console.log(`listening at : ${port}`)
})

