const express = require("express")
const router = express.Router()
const adminSchema = require("../models/adminSchema")
const userSchema = require("../models/userSchema")
const trainerSchema = require("../models/trainerSchema")
const membership = require("../models/membershipSchema")
const sessionSchema = require("../models/sessionSchema")

// Get all trainers by center
router.get("/allTrainers/:id", async (req, res) => {
  try {
    // Get centerId
    const centerId = req.params.id

    // Query
    const allTrainers = await trainerSchema.find({ center_id: centerId })

    res.status(200).json({
      msg: "success",
      trainer_count: allTrainers.length,
      allTrainers,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ msg: "internal server error" })
  }
})

// Get all users by center
router.get("/allUsers/:id", async (req, res) => {
  try {
    // Get centerId
    const centerId = req.params.id

    // Query
    const allUsers = await userSchema.find({ center_id: centerId })

    res.status(200).json({
      msg: "success",
      user_count: allUsers.length,
      allUsers,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ msg: "internal server error" })
  }
})

// Get all memberships by center
router.get("/allMembership/:id", async (req, res) => {
  try {
    // Get centerId
    const membershipId = req.params.id

    // Query
    const allMembership = await membership.find({ center_id: membershipId })

    res.status(200).json({
      msg: "success",
      membership_count: allMembership.length,
      allMembership,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ msg: "internal server error" })
  }
})

// Get all sessions by center
router.get("/allSessions/:id", async (req, res) => {
  try {
    // Get centerId
    const sessionId = req.params.id

    // Query
    const allSession = await sessionSchema.find({ center_id: sessionId })

    res.status(200).json({
      msg: "success",
      session_count: allSession.length,
      allSession,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ msg: "internal server error" })
  }
})

module.exports = router
