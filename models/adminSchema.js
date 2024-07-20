const mongoose = require("mongoose")

const AdminSchema = new mongoose.Schema({
  photo: {
    type: String,
    require: true,
    default: null,
  },
  name: {
    type: String,
    require: true,
  },
  accessToken: {
    type: String,
    require: true,
    default: null,
  },
  desc: {
    type: String,
    require: true,
    default: null,
  },
  email: {
    type: String,
    require: true,
  },
  location: {
    type: String,
    require: true,
    default: null,
  },
  phone: {
    type: String,
    require: true,
    default: null,
  },
  password: {
    type: String,
    require: true,
    default: null,
  },
  isOpened: {
    type: Boolean,
    require: true,
    default: true,
  },
  isNotification: {
    type: Boolean,
    require: true,
    default: true,
  },
  opening_time: {
    type: String,
    require: true,
    default: null,
  },
  location: {
    type: String,
    require: true,
    default: null,
  },
  closing_time: {
    type: String,
    require: true,
    default: null,
  },
  dateCreated: {
    type: Date,
    default: new Date(),
  },
  dateUpdated: {
    type: Date,
    default: new Date(),
  },
})

module.exports = mongoose.model("AdminSchema", AdminSchema, "admins")
