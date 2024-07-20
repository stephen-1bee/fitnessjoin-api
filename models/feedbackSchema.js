const mongoose = require("mongoose")

const feedbackSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Types.ObjectId,
    // required: true,
    default: null,
  },
  center_id: {
    type: mongoose.Types.ObjectId,
    require: true,
    default: null,
  },
  message: {
    type: String,
    required: true,
    default: null,
  },
  creator_type: {
    type: String,
    required: true,
    default: null,
  },
  trainer_id: {
    type: mongoose.Types.ObjectId,
    require: true,
    default: null,
  },
  dateUpdated: {
    type: Date,
    required: true,
    default: new Date(),
  },

  dateCreated: {
    type: Date,
    required: true,
    default: new Date(),
  },
})

module.exports = mongoose.model("feedbackSchema", feedbackSchema, "feedbacks")
