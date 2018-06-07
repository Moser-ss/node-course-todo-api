const {
    MongoClient,
    ObjectId
} = require('mongodb');



MongoClient.connect('mongodb://localhost:27017/TodoApp', (error, client) => {
    if (error) {
        return console.log('Unable to connecto MongoDB server');
    }
    console.log('Connected to MongoDB server');
    const db = client.db('TodoApp')

    db.collection('Users').findOneAndUpdate({
            _id: new ObjectId("5b193fe73889842439bb7a10")
        }, {
            $set: {
                name: 'Stephane Moser'
            },
            $inc: {
                age: 2
            }
        }, {
            returnOriginal: false
        })
        .then((result) => {
            console.log(JSON.stringify(result, undefined, 2));
        })

    //client.close();
})