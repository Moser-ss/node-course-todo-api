
const jwt = require('jsonwebtoken');
let token = 'banana'
const bcrypt = require('bcryptjs');
const password = 'password1!'

const salt = bcrypt.genSaltSync(10)
console.log('Salt :',salt);
const hash = bcrypt.hashSync(password, salt)
console.log('Hash : ', hash);
const hash2 = '$2a$10$hXv6fFKJjztdoxA/yrtSrecz5g94oRu0gcmsEzdoYVxQDv9Ys.C6W'
if( bcrypt.compareSync(password, hash2)){
    console.log('Password is the hash');
} else{
    console.log('The hash is not the password');
}
