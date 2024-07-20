const mongoose = require("mongoose");

const contactUsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    default: null,
  },
  message: {
    type: String,
    required: true,
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
});

module.exports = mongoose.model(
  "contactUsSchema",
  contactUsSchema,
  "contactUs"
);
