const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
  first_name: {
    require: true,
    type: String,
    default: null,
  },
  last_name: {
    require: true,
    type: String,
    default: null,
  },
  email: {
    require: true,
    type: String,
    default: null,
  },
  phone: {
    type: String,
    require: true,
    default: null,
  },
  accessToken: {
    type: String,
    require: true,
    default: null,
  },
  isNotification: {
    require: true,
    type: Boolean,
    default: true,
  },
  password: {
    type: String,
    require: true,
    default: null,
  },
  type: {
    type: String,
    enum: ["Point"],
    require: true,
    default: "Point",
  },
  coordinates: {
    type: [Number],
    require: true,
    default: [0, 0],
  },
  trainer_id: {
    type: mongoose.Types.ObjectId,
    require: true,
    default: null,
  },
  goal: {
    type: String,
    require: true,
    default: null,
  },
  center_id: {
    require: true,
    type: mongoose.Schema.Types.ObjectId,
    default: null,
  },
  membership_id: {
    require: true,
    type: mongoose.Schema.Types.ObjectId,
    default: null,
  },
  session_id: {
    require: true,
    type: mongoose.Schema.Types.ObjectId,
    default: null,
  },
  dateUpdated: {
    require: Date,
    type: Date,
    default: new Date(),
  },
  dateCreated: {
    require: true,
    type: Date,
    default: new Date(),
  },
})

module.exports = mongoose.model("userSchema", userSchema, "users")
