const mongoose = require("mongoose")

const rateSchema = new mongoose.Schema({
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
  user_id: {
    type: mongoose.Types.ObjectId,
    require: true,
    default: null,
  },
  number: {
    type: Number,
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

module.exports = mongoose.model("rateSchema", rateSchema, "ratings")
