const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")
const activitiesSchema = require("../models/activitiesSchema")

router.get("/all", async (req, res) => {
  try {
    const activity = await activitiesSchema.find()

    if (activity) {
      res.status(200).json({ msg: "success", activity })
    }
  } catch (err) {
    console.log(err)
    res.status(404).json({ msg: "internal server error" })
  }
})

router.delete("/delete/:id", async (req, res) => {
  try {
    // activity id
    const activityId = req.params.id

    const delActivity = await activitiesSchema.findByIdAndDelete(activityId)

    return delActivity
      ? res
          .status(200)
          .json({ msg: "notification deleted successfully", delActivity })
      : res.status(404).json({ msg: "failed delete an notification" })
  } catch (err) {
    console.log(err)
  }
})

// fitness center activities
router.get("/center/:id", async (req, res) => {
  try {
    const centerId = req.params.id

    if (!mongoose.Types.ObjectId.isValid(centerId)) {
      return res.status(404).json({ msg: "invalid center id" })
    }

    const activity = await activitiesSchema
      .find({ center_id: centerId })
      .sort({ dateCreated: -1 })

    res.json({ msg: "success", activity })
  } catch (err) {
    console.log(err)
  }
})

// activities for trainer
router.get("/trainer/:id", async (req, res) => {
  try {
    const trainerId = req.params.id

    if (!mongoose.Types.ObjectId.isValid(trainerId)) {
      return res.status(404).json({ msg: "invalid trainer id" })
    }

    const activity = await activitiesSchema
      .find({ trainer_id: trainerId })
      .sort({ dateCreated: -1 })

    res.json({ msg: "success", activity })
  } catch (err) {
    console.log(err)
  }
})

// activities for user
router.get("/user/:id", async (req, res) => {
  try {
    const userId = req.params.id

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(404).json({ msg: "invalid user id" })
    }

    const activity = await activitiesSchema
      .find({ user_id: userId })
      .sort({ dateCreated: -1 })

    res.json({ msg: "success", activity })
  } catch (err) {
    console.log(err)
  }
})

module.exports = router
