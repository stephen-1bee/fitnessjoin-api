const mongoose = require("mongoose")

const trainerSchema = new mongoose.Schema({
  name: {
    type: String,
    require: true,
    default: null,
  },
  email: {
    type: String,
    require: true,
    default: null,
  },
  accessToken: {
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
  // location: {
  //   type: {
  //     type: String,
  //     enum: ["Point"],
  //     require: true,
  //     default: "Point",
  //   },
  //   coordinates: {
  //     type: [Number],
  //     require: true,
  //     default: [0, 0],
  //   },
  //   address: {
  //     type: String,
  //     require: true,
  //     default: null,
  //   },
  // },
  location: {
    type: String,
    require: true,
    default: null,
  },
  center_id: {
    type: mongoose.Types.ObjectId,
    require: true,
    default: null,
  },
  membership_id: {
    type: mongoose.Types.ObjectId,
    require: true,
    default: null,
  },
  isBlocked: {
    require: true,
    type: Boolean,
    default: false,
  },
  isNotification: {
    require: true,
    type: Boolean,
    default: true,
  },
  isAccepted: {
    require: true,
    type: Boolean,
    default: false,
  },
  dateCreated: {
    type: Date,
    default: new Date(),
  },
})

module.exports = mongoose.model("trainerSchema", trainerSchema, "trainers")
