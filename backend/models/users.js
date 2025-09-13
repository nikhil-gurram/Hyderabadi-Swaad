const mongoose = require('mongoose')
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    googleId: { type: String, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String},
    role: { type: String, default: 'customer' },
    address: {type: String},
    phone: {type: String}
})

module.exports = mongoose.model('User', userSchema)