const mongoose = require("mongoose")

const activitySchema = new mongoose.Schema({
  center_id: {
    type: mongoose.Schema.Types.ObjectId,
    require: true,
    defualt: null,
  },
  trainer_id: {
    type: mongoose.Schema.Types.ObjectId,
    require: true,
    defualt: null,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    require: true,
    defualt: null,
  },
  message: {
    type: String,
    require: true,
    default: null,
  },
  dateCreated: {
    require: true,
    type: Date,
    default: new Date(),
  },
})

module.exports = mongoose.model("activitySchema", activitySchema, "activities")
