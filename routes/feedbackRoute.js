const express = require("express")
const router = express.Router()
const feedbackSchema = require("../models/feedbackSchema")
const { default: mongoose } = require("mongoose")

// add feedback
router.post("/create", async (req, res) => {
  try {
    //   take cred
    const { user_id, center_id, message, creator_type, trainer_id } = req.body

    //   map to schema
    const newFeedback = new feedbackSchema({
      user_id,
      center_id,
      message,
      creator_type,
      trainer_id,
    })

    //   save
    const addFeedback = await newFeedback.save()

    return addFeedback
      ? res.status(200).json({ msg: "message sent successfully", addFeedback })
      : res.status(404).json({ msg: "failed to send feedback" })
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: "internal server error" })
  }
})

// get trainer feedbacks
router.get("/trainers/:id", async (req, res) => {
  try {
    const trainer_feedbacks = await feedbackSchema.aggregate([
      {
        $match: {
          center_id: new mongoose.Types.ObjectId(req.params.id),
          creator_type: "trainer",
        },
      },
      {
        $lookup: {
          from: "trainers",
          localField: "trainer_id",
          foreignField: "_id",
          as: "trainer",
        },
      },
    ])

    res.status(200).json({ msg: "success", trainer_feedbacks })
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: "intenal server error" })
  }
})

// get all feedback by user
router.get("/users/:id", async (req, res) => {
  try {
    const user_feedbacks = await feedbackSchema.aggregate([
      {
        $match: {
          center_id: new mongoose.Types.ObjectId(req.params.id),
          creator_type: "user",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "_id",
          as: "user",
        },
      },
    ])

    res.status(200).json({ msg: "success", user_feedbacks })
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: "intenal server error" })
  }
})

// get all feedback
router.get("/all", async (req, res) => {
  try {
    // query
    allFeedbacks = await feedbackSchema.find()

    return allFeedbacks
      ? res.status(200).json({
          msg: "sucess",
          feedback_count: allFeedbacks.length,
          allFeedbacks,
        })
      : res.status(404).json({ msg: "failed to get all feedbacks" })
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: "internal server error" })
  }
})

// get all feedbacks by fitness id
router.get("/center/:id", async (req, res) => {
  try {
    // user id
    centerId = req.params.id

    //   query
    const user_feedback = await feedbackSchema.find({ center_id: centerId })

    return user_feedback
      ? res.status(200).json({ msg: "sucess", user_feedback })
      : res.status(404).json("failed to get user's feedbacks")
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: "internal server error" })
  }
})

// delete feedback
router.delete("/delete/:id", async (req, res) => {
  try {
    // get id
    const feedbackId = req.params.id

    //   query
    const delFeedback = await feedbackSchema.findByIdAndDelete(feedbackId)
    return delFeedback
      ? res
          .status(200)
          .json({ msg: "feedback deleted sucessfully", delFeedback })
      : res.status(404).json("failed to delete user's feedbacks")
  } catch (err) {
    console.log(err)
  }
})

module.exports = router
