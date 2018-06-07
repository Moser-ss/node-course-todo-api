const {
    MongoClient,
    ObjectID
} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (error, client) => {
    if (error) {
        return console.log('Unable to connecto MongoDB server');
    }
    console.log('Connected to MongoDB server');
    const db = client.db('TodoApp')

    /*     db.collection('Todos').find().toArray().then((docs) => {
            console.log('ToDos');
            console.log(JSON.stringify(docs, undefined, 2));
        }, (err) => {
            console.log('Unable to fecth docs', err);
        }) */

    /*     db.collection('Todos').find().count().then((count) => {
            console.log('ToDos count:', count);
        }, (err) => {
            console.log('Unable to fecth docs', err);
        }) */
    db.collection('Users').find({
            name: "Stephane Moser"
        }).toArray()
        .then((docs) => {
            console.log('Users:');
            console.log(JSON.stringify(docs, undefined, 2));

        }, (err) => {
            console.log('Unable to fetch docs', err);
        })
    //client.close();
})