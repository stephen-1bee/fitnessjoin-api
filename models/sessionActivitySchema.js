const mongoose = require("mongoose")

const sessionActivity = new mongoose.Schema({
  title: {
    type: String,
    require: true,
    default: null,
  },
  desc: {
    type: String,
    require: true,
    default: null,
  },
  creator_type: {
    type: String,
    require: true,
    default: null,
  },
  session_id: {
    type: mongoose.Types.ObjectId,
    require: true,
    default: null,
  },
  center_id: {
    require: true,
    type: mongoose.Types.ObjectId,
    default: null,
  },
  trainer_id: {
    require: true,
    type: mongoose.Types.ObjectId,
    default: null,
  },
  status: {
    type: Boolean,
    require: true,
    default: false
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

module.exports = mongoose.model(
  "sessionActivity",
  sessionActivity,
  "session_activiies"
)
