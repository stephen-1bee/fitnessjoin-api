const mongoose = require("mongoose");

const membershipSchema = new mongoose.Schema({
  name: {
    require: true,
    type: String,
    default: null,
  },
  price: {
    require: Number,
    type: Number,
    default: 0,
  },
  center_id: {
    require: true,
    type: String,
    default: null,
  },
  // user_id: {
  //   require: true,
  //   type: String,
  //   default: null,
  // },
  // trainer_id: {
  //   require: true,
  //   type: String,
  //   default: null,
  // },
  dateCreated: {
    require: true,
    type: Date,
    default: new Date(),
  },
});

module.exports = mongoose.model(
  "membershipSchema",
  membershipSchema,
  "memberships"
);
