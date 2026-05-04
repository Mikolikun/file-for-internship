const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    username:{type: String, require: true, unique:true}
})