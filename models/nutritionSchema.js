const mongoose = require("mongoose")

const nutritionSchema = new mongoose.Schema({
  food: {
    require: true,
    type: String,
    default: null,
  },
  time_of_day: {
    require: true,
    type: String,
    default: null,
  },
  category: {
    require: true,
    type: String,
    default: null,
  },
  isApproved: {
    require: true,
    type: Boolean,
    default: false,
  },
  center_id: {
    require: true,
    type: String,
    default: null,
  },
  trainer_id: {
    require: true,
    type: mongoose.Types.ObjectId,
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

module.exports = mongoose.model(
  "nutritionSchema",
  nutritionSchema,
  "nutritions"
)
