const express = require("express");
const router = express.Router();
const contactUsSchema = require("../models/contactUsSchema");

// send
router.post("/create", async (req, res) => {
  try {
    //  take creds
    const { name, message } = req.body;

    //   new instance
    const newContactUs = new contactUsSchema({
      name,
      message,
    });

    //   save
    const addContactUs = await newContactUs.save();

    return addContactUs
      ? res.status(200).json({ msg: "message sent successfuly", addContactUs })
      : res.status(200).json({ msg: "failed to to send message" });
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
