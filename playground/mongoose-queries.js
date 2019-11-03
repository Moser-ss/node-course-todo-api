const {mongoose} = require('./../src/db/mongoose');
const {Todo} = require('./../src/models/todo');
const {User} = require('./../src/models/user');

var id = '6b22d83c7f16fc0484664c90'

/* Todo.find({
    _id: id
}).then((todos) => {
    console.log('Todos : \n', JSON.stringify(todos, undefined, 2));
});

Todo.findOne({
    _id: id
}).then((todo) => {
    console.log('Todo : \n', JSON.stringify(todo, undefined, 2));
});

Todo.findById(id).then((todo) => {
    if (!todo) {
        return console.log('Id not found');
    }
    console.log('Todo by Id', JSON.stringify(todo, undefined, 2));
}).catch((err) => {
    console.log(err);
}) */
const userId = '5b19a191877dc7a1c597c3511'

User.findById(userId).then((user) => {
    if (!user) {
        return console.log('User not found');
    }
    console.log('User found :\n',JSON.stringify(user, undefined, 2));
}).catch((err) => {
    console.log('Unable to query by ID', err.message);
})