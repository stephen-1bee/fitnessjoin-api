const mongoose = require("mongoose");

const articleSchema = new mongoose.Schema({
  photo: {
    type: String,
    require: true,
    default: null,
  },
  title: {
    require: true,
    type: String,
    default: null,
  },
  desc: {
    require: true,
    type: String,
    default: null,
  },
  url: {
    require: true,
    type: String,
    default: null,
  },
  isApproved: {
    type: Boolean,
    require: true,
    default: false,
  },
  trainer_id: {
    type: mongoose.Types.ObjectId,
    require: true,
    default: null,
  },
  center_id: {
    type: mongoose.Types.ObjectId,
    type: String,
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
});

module.exports = mongoose.model("articleSchema", articleSchema, "articles");
