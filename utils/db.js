const mongoose = require("mongoose");

const conn = async (req, res) => {
  try {
    await mongoose.connect(
      process.env.ROOM === "dev"
        ? process.env.DEV_DB
        : process.env.ROOM === "prod"
        ? process.env.PROD_DB
        : null,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );

    if (process.env.ROOM === "dev") {
      console.log("Local DB connection established");
    } else if (process.env.ROOM === "prod") {
      console.log("Remote DB connection established");
    } else {
      console.log("invalid db connected");
    }
  } catch (err) {
    console.error(err);
  }
};

module.exports = conn;
