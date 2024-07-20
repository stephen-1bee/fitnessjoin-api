const mongoose = require("mongoose")

const fitnessGoalsSchema = new mongoose.Schema({
  center_id: {
    type: String,
    require: true,
    default: null,
  },
  goal: {
    type: String,
    require: true,
    default: null,
  },
  dateUpdated: {
    type: Date,
    default: new Date(),
  },
  dateCreated: {
    type: Date,
    default: new Date(),
  },
})
module.exports = mongoose.model(
  "fitnessGoalsSchema",
  fitnessGoalsSchema,
  "fitnessGoals"
)
