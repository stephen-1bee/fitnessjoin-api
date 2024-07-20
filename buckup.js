const express = require("express").Router
const router = express.Router()
const activitySchema = require("../models/activitiesSchema")
const mongoose = require("mongoose")

router.get("/all", async (req, res) => {
  try {
    const activity = await activitySchema.find()

    if (activity) {
      res.status(200).json({ msg: "success", activity })
    }
    ;``
  } catch (err) {
    console.log(err)
    res.status(404).json({ msg: "internal server error" })
  }
})

// fitness center activities
router.get("/center/:id", async (req, res) => {
  try {
    const centerId = req.params.id

    if (!mongoose.Types.ObjectId.isValid(centerId)) {
      return res.status(404).json({ msg: "invalid center id" })
    }

    const activity = await activitySchema
      .find({ center_id: centerId })
      .sort({ dateCreated: -1 })

    res.json({ msg: "success", activity })
  } catch (err) {
    console.log(err)
  }
})

// fitness trainer activities
router.get("/center/:id", async (req, res) => {
  try {
    const trainerId = req.params.id

    if (!mongoose.Types.ObjectId.isValid(trainerId)) {
      return res.status(404).json({ msg: "invalid trainer id" })
    }

    const activity = await activitySchema.find({ trainer_id: trainerId })

    res.json({ msg: "success", activity })
  } catch (err) {
    console.log(err)
  }
})

//
router.delete("/delete", async (req, res) => {
  try {
    // activity id
    const activityId = req.params.id

    const delActivity = await activitySchema.findByIdAndDelete(activityId)

    return delActivity
      ? res
          .status(200)
          .json({ msg: "notification deleted successfully", delActivity })
      : res.status(404).json({ msg: "failed delete an notification" })
  } catch (err) {
    console.log(err)
  }
})

module.exports = router



router.get("/all", async (req, res) => {
  try {
    const activity = await activitiesSchema.find()

    res.status(200).json({ msg: "success", activity })
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: "internal server error" })
  }
})

module.exports = router
