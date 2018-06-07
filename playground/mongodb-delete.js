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

/*     db.collection('Users').deleteMany({name: "Stephane Moser"}).then((res) => {
    console.log(JSON.stringify(res.result, undefined, 2));
    }) */
    
    db.collection('Users').findOneAndDelete({
        _id: new ObjectId("5b193fef3889842439bb7a12")
    }).then((result) => {
    console.log(JSON.stringify(result.value));
    })
    //client.close();
})