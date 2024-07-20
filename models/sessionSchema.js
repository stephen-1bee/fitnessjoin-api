const mongoose = require("mongoose")

const sessionSchema = new mongoose.Schema({
  title: {
    require: true,
    type: String,
    default: null,
  },
  description: {
    require: true,
    type: String,
    default: null,
  },
  isApproved: {
    type: Boolean,
    require: true,
    default: false,
  },
  start_date: {
    require: true,
    type: Date,
    default: new Date(),
  },
  end_date: {
    require: true,
    type: Date,
    default: new Date(),
  },
  start_time: {
    require: true,
    type: String,
    default: null,
  },
  end_time: {
    require: true,
    type: String,
    default: null,
  },
  center_id: {
    type: mongoose.Types.ObjectId,
    require: true,
    default: null,
  },
  trainer_id: {
    type: mongoose.Types.ObjectId,
    require: true,
    default: null,
  },
  creator_type: {
    require: true,
    type: String,
    default: null,
  },
  dateUpdated: {
    require: true,
    type: Date,
    default: new Date(),
  },
  dateCreated: {
    require: true,
    type: Date,
    default: new Date(),
  },
})

module.exports = mongoose.model("sessionSchema", sessionSchema, "sessions")
