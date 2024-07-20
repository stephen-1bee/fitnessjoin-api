const mongoose = require('mongoose')

const superAdminSchema = new mongoose.Schema({
    first_name: {
        require: true,
        type: String,
        default: null
    },
    last_name: {
        require: true,
        type: String,
        default: null
    },
    email: {
        require: true,
        type: String,
        default: null
    },
    phone: {
        require: true,
        type: String,
        default: null
    },
    password: {
        require: true,
        type: String,
        default: null
    },
    dateCreated: {
        require: true,
        type: Date,
        default: new Date()
    }
})

module.exports = mongoose.model('superAdminSchema', superAdminSchema, 'superadmins')