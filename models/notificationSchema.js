const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
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
  message: {
    type: String,
    require: true,
    default: null,
  },
  dateUpdated: {
    type: Date,
    require: true,
    default: new Date(),
  },
  dateCreated: {
    type: Date,
    require: true,
    default: new Date(),
  },
});
module.exports = mongoose.model(
  "notificationSchema",
  notificationSchema,
  "notification"
);
