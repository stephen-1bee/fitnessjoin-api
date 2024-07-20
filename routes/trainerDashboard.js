const express = require("express")
const router = express.Router()
const adminSchema = require("../models/adminSchema")
const userSchema = require("../models/userSchema")
const trainerSchema = require("../models/trainerSchema")
const membership = require("../models/membershipSchema")
const sessionSchema = require("../models/sessionSchema")
const articleSchema = require("../models/articleSchema")
const nutritionSchema = require("../models/nutritionSchema")

router.get("/:centerId/:trainerId", async (req, res) => {
  try {
    const centerId = req.params.centerId
    const trainerId = req.params.trainerId

    // get trainer sessions
    const trainer_sessions = await sessionSchema.countDocuments({
      center_id: centerId,
      trainer_id: trainerId,
    })

    // get trainer articles
    const trainer_articles = await articleSchema.countDocuments({
      center_id: centerId,
      trainer_id: trainerId,
    })

    // get assigned users
    const assigned_users = await userSchema.countDocuments({
      center_id: centerId,
      trainer_id: trainerId,
    })

    // get assigned users
    const trainer_nutrition = await nutritionSchema.countDocuments({
      center_id: centerId,
      trainer_id: trainerId,
    })

    res.status(200).json({
      msg: "success",
      trainer_sessions,
      trainer_articles,
      assigned_users,
      trainer_nutrition,
    })
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: "internal server error" })
  }
})

// get assinged users
router.get("/users/byTrainer/:trainerId", async (req, res) => {
  try {
    const trainerId = req.params.trainerId

    // Check if the trainerId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(trainerId)) {
      return res.status(400).json({ msg: "Invalid trainer ID" })
    }

    // Find the trainer by ID
    const trainer = await trainerSchema.findById(trainerId)
    if (!trainer) {
      return res.status(404).json({ msg: "Trainer not found" })
    }

    // Find all users with the same center_id and trainer_id as the trainer
    const users = await userSchema.find({
      center_id: trainer.center_id,
      trainer_id: trainerId,
    })

    res.status(200).json({ msg: "success", users })
  } catch (err) {
    console.error(err)
    res.status(500).json({ msg: "Internal server error" })
  }
})

module.exports = router
