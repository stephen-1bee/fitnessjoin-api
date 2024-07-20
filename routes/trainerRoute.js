const express = require("express")
const router = express.Router()
const trainerSchema = require("../models/trainerSchema")
const bcrypt = require("bcrypt")
const moment = require("moment")
const mongoose = require("mongoose")
const { check, validationResult } = require("express-validator")
const activitiesSchema = require("../models/activitiesSchema")
const JWT = require("jsonwebtoken")

// Add a trainer
router.post(
  "/create",
  [
    check("email").isEmail().withMessage("provide a valid email format"),
    check("password")
      .isLength({ min: 8 })
      .withMessage("Password should be at least 8 characters long.")
      .matches(/[a-zA-Z]/)
      .withMessage("Password should contain at least one letter.")
      .matches(/\d/)
      .withMessage("Password should contain at least one numeric digit."),
    check("phone").custom((value, { req }) => {
      // Check if the phone number starts with 0 and has 10 digits
      if (!value.match(/^0\d{9}$/)) {
        throw new Error(
          "Invalid phone number. Phone number should be 10 digits"
        )
      }
      return true
    }),
  ],
  async (req, res) => {
    try {
      // Taking creds
      const {
        name,
        email,
        location,
        phone,
        password,
        center_id,
        membership_id,
      } = req.body

      // Check if user exists
      const existingUser = await trainerSchema.findOne({ email })

      const errors = validationResult(req)

      if (!errors.isEmpty()) {
        const errorMessages = []
        errors.array().forEach((err) => {
          errorMessages.push(err.msg)
        })
        return res.status(401).json({ msg: errorMessages[0] })
      }

      if (existingUser) {
        return res.status(400).json({ msg: "trainer already exits" })
      }

      const hashedPassword = await bcrypt.hash(password, 10)

      // Creating a new user
      const newUser = new trainerSchema({
        name,
        email,
        location,
        phone,
        password: hashedPassword,
        center_id,
        membership_id,
      })

      // Saving user
      const savedUser = await newUser.save()

      if (savedUser) {
        // alert fitness center of new registration
        const message = `Trainer, ${name} registered to your fitness center`
        const newActivity = await activitiesSchema({
          message,
          center_id,
        })
        const saveActivity = await newActivity.save()
        res.status(201).json({ msg: "Trainer added successfully", savedUser })
      } else {
        res.status(404).json({ msg: "an error occured, please try again " })
      }
    } catch (err) {
      console.error(err)
      res.status(500).json({ msg: "Internal server error" })
    }
  }
)

// trainer login with checks with bcrypt
router.post("/login", async (req, res) => {
  try {
    // taking creds
    const { email, password } = req.body

    // checking if user exists
    const user = await trainerSchema.findOne({ email })
    if (!user) {
      return res.status(400).json({ msg: "trainer does not exist" })
    }

    // checking if password is correct
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ msg: "Incorrect password" })
    }

    const token = await JWT.sign({ email, password }, process.env.JWT_SECRET, {
      expiresIn: 3600,
    })

    user.accessToken = token

    if (token) {
      // returning user
      res.json({ msg: "login successful", user })
    } else {
      res.sendStatus(401).json({ msg: "an error occured, Login in again" })
    }
  } catch (err) {
    console.log(err)
    res.status(500).json({
      msg: "Internal server error",
    })
  }
})

// get all trainers
router.get("/all", async (req, res) => {
  try {
    const trainers = await trainerSchema.find()
    res.json({
      msg: "success",
      trainer_count: trainers.length,
      trainers: trainers,
    })
  } catch (err) {
    console.log(err)
    res.status(500).json({
      message: "Internal server error",
    })
  }
})

// block a trainer by passing true to the isBlocked property
router.put("/block/:id", async (req, res) => {
  try {
    // get trainerId
    const trainerId = req.params.id

    // get trainer
    const trainer = await trainerSchema.findById(trainerId)

    // set isBlocked to true
    trainer.isBlocked = true

    // save trainer
    const savedTrainer = await trainer.save()
    res.json({ msg: "trainer blocked successfully", savedTrainer })
  } catch (err) {
    console.log(err)
    res.status(500).json({
      message: "Internal server error",
    })
  }
})

// unblock a trainer by passing false to the isBlocked property
router.put("/unblock/:id", async (req, res) => {
  try {
    // get trainerId
    const trainerId = req.params.id

    // get trainer
    const trainer = await trainerSchema.findById(trainerId)

    // set isBlocked to true
    trainer.isBlocked = false

    // save trainer
    const savedTrainer = await trainer.save()
    res.json({ msg: "trainer blocked successfully", savedTrainer })
  } catch (err) {
    console.log(err)
    res.status(500).json({
      message: "Internal server error",
    })
  }
})

// accept trainer's application
router.put("/accept/:id", async (req, res) => {
  try {
    // get trainerId
    const trainerId = req.params.id

    // get trainer
    const trainer = await trainerSchema.findById(trainerId)

    // set isBlocked to false
    trainer.isAccepted = true

    // save trainer
    const savedTrainer = await trainer.save()
    res.json({ msg: "trainer accepted successfully", savedTrainer })
  } catch (err) {
    console.log(err)
    res.status(500).json({
      message: "Internal server error",
    })
  }
})

// withdraw trainer's application
router.put("/withdraw/:id", async (req, res) => {
  try {
    // get trainerId
    const trainerId = req.params.id

    // get trainer
    const trainer = await trainerSchema.findById(trainerId)

    // set isBlocked to false
    trainer.isAccepted = false

    // save trainer
    const savedTrainer = await trainer.save()
    res.json({ msg: "trainer accepted successfully", savedTrainer })
  } catch (err) {
    console.log(err)
    res.status(500).json({
      message: "Internal server error",
    })
  }
})

// delete a trainer
router.delete("/delete/:id", async (req, res) => {
  try {
    // Get trainer id
    const trainerId = req.params.id

    // Query to delete the trainer
    const deletedTrainer = await trainerSchema.findByIdAndDelete(trainerId)

    if (deletedTrainer) {
      res.status(200).json({
        msg: "Trainer deleted successfully",
        deleted_trainer: deletedTrainer,
      })
    } else {
      res.status(404).json({ msg: "Trainer not found" })
    }
  } catch (err) {
    console.error(err)
    res.status(500).json({ msg: "Internal server error" })
  }
})

// update trainer
router.put("/update/:id", async (req, res) => {
  try {
    // taking credentials
    const trainerId = req.params.id
    const { name, email, location, phone, password } = req.body

    // query
    const updateTrainer = await trainerSchema.updateOne(
      { _id: trainerId },
      { name, email, location, phone }
    )

    const trainer = await trainerSchema.find({ _id: trainerId })

    if (!trainerId) {
      res.status(400).json({ msg: "trainer not found" })
    }

    if (updateTrainer.modifiedCount === 1) {
      res.json({
        msg: "trainer updated successfully",
        updated_trainer: trainer,
      })
    } else {
      res.json({ msg: "failed to updated trainer" })
    }
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: "internal server error" })
  }
})

// get all trainers based on center id
router.get("/all/center/:id", async (req, res) => {
  try {
    // creds
    const center_id = req.params.id

    // query
    const allTrainers = await trainerSchema
      .find({ center_id: center_id })
      .sort({ dateCreated: -1 })

    if (allTrainers) {
      res.json({
        msg: "success",
        trainer_count: allTrainers.length,
        trainers: allTrainers,
      })
    } else {
      res.json({ msg: "trainers not found" })
    }
  } catch (err) {
    console.error(err)
    res.status(500).json({ msg: "Internal server error" })
  }
})

// new trainers within a day
router.get("/new/center/:id", async (req, res) => {
  try {
    const centerId = req.params.id

    if (!mongoose.Types.ObjectId.isValid(centerId)) {
      return res.status(400).json({ msg: "Center ID is required" })
    }

    // Get today's date
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const new_trainers = await trainerSchema.find({
      center_id: centerId,
      dateCreated: { $gte: today },
    })

    // Check if any new user is found
    if (new_trainers.length > 0) {
      return res.json({
        msg: "success",
        trainer_count: new_trainers.length,
        new_trainers,
      })
    } else {
      return res.json({ msg: "No new user found for this center today" })
    }
  } catch (err) {
    console.error(err)
    return res.status(500).json({ msg: "Internal server error" })
  }
})

router.get("/one/:id", async (req, res) => {
  try {
    const trainerId = req.params.id

    if (!mongoose.Types.ObjectId.isValid(trainerId)) {
      return res.status(200).json({ msg: "trainer id not found" })
    }

    const trainer = await trainerSchema.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(trainerId),
        },
      },
      {
        $lookup: {
          from: "memberships",
          localField: "membership_id",
          foreignField: "_id",
          as: "membership",
        },
      },
      {
        $lookup: {
          from: "admins",
          localField: "center_id",
          foreignField: "_id",
          as: "fitness_center",
        },
      },
    ])

    return trainer
      ? res.status(200).json({ msg: "success", trainer })
      : res.status(404).json({ msg: "trainer not found" })
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: "internal server error" })
  }
})

// open notification
router.put("/notification/on/:id", async (req, res) => {
  try {
    const trainerId = req.params.id

    if (!mongoose.Types.ObjectId.isValid(trainerId)) {
      return res.status(400).json({ msg: "trainer id not found" })
    }

    const trainer = await trainerSchema.updateOne(
      { _id: trainerId },
      { $set: { isNotification: true } }
    )

    return trainer.modifiedCount === 1
      ? res.status(200).json({ msg: "notification has been turned on" })
      : res.status(404).json({ msg: "notification is already on" })
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: "internal server error" })
  }
})

// subscribe to a membership plan
router.put("/subscribe/:id", async (req, res) => {
  try {
    // creds
    const trainerId = req.params.id
    const { membership_id } = req.body

    // query
    const membershipSignUp = await trainerSchema.updateOne(
      { _id: trainerId },
      { membership_id: membership_id }
    )

    if (membershipSignUp.modifiedCount === 1) {
      res.json({ msg: "membership subscribed successfully" })
    } else {
      res.json({ msg: "failed to subscribe to membership plan" })
    }
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: "internal server error" })
  }
})

router.put("/notification/off/:id", async (req, res) => {
  try {
    const trainerId = req.params.id

    if (!mongoose.Types.ObjectId.isValid(trainerId)) {
      return res.status(400).json({ msg: "trainer id not found" })
    }

    const trainer = await trainerSchema.updateOne(
      { _id: trainerId },
      { $set: { isNotification: false } }
    )

    return trainer.modifiedCount === 1
      ? res.status(200).json({ msg: "notification has been turned off" })
      : res.status(404).json({ msg: "notification is already off" })
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: "internal server error" })
  }
})

module.exports = router
