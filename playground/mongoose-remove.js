const {
    ObjectID
} = require('mongodb');

const {
    mongoose
} = require('./../src/db/mongoose');
const {
    Todo
} = require('./../src/models/todo');
const {
    User
} = require('./../src/models/user');

// Todo.remove({}).then((result) => {
//   console.log(result);
// });

// Todo.findOneAndRemove
// Todo.findByIdAndRemove

// Todo.findOneAndRemove({_id: '57c4610dbb35fcbf6fda1154'}).then((todo) => {
//
// });

Todo.findByIdAndRemove('57c4610dbb35fcbf6fda1154').then((todo) => {
    console.log(todo);
});
