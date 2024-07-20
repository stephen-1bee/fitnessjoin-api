const express = require("express")
const router = express.Router()
const userSchema = require("../models/userSchema")
const trainerSchema = require("../models/trainerSchema")
const bcrypt = require("bcrypt")
const mongoose = require("mongoose")
const adminSchema = require("../models/adminSchema")
const { check, validationResult } = require("express-validator")
const activitiesSchema = require("../models/activitiesSchema")
const JWT = require("jsonwebtoken")

// add a user
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
      // Take credentials from the request body
      const {
        first_name,
        last_name,
        email,
        password,
        phone,
        membership_id,
        center_id,
        goal,
      } = req.body

      const errors = validationResult(req)

      if (!errors.isEmpty()) {
        const errorMessages = []
        errors.array().forEach((err) => {
          errorMessages.push(err.msg)
        })
        return res.status(401).json({ msg: errorMessages[0] })
      }

      // Check if the email or phone number already exists in the database
      const existingUserByEmail = await userSchema.findOne({ email })
      const existingUserByPhone = await userSchema.findOne({ phone })

      if (existingUserByEmail) {
        return res.status(400).json({ msg: "User email already exists" })
      }

      if (existingUserByPhone && existingUserByEmail) {
        return res
          .status(400)
          .json({ msg: "User this phone number already exists" })
      }

      const hashedPassword = await bcrypt.hash(password, 10)

      const newUser = new userSchema({
        first_name,
        last_name,
        email,
        password: hashedPassword,
        phone,
        goal,
        center_id,
        membership_id,
      })

      const addUser = await newUser.save()

      if (addUser) {
        // alert fitness center of new registration
        const message = `Client, ${first_name} registered to your fitness center`
        const newActivity = await activitiesSchema({
          message,
          center_id,
        })
        const saveActivity = await newActivity.save()
        res.json({ msg: "user created successfully", user: addUser })
      }
    } catch (err) {
      console.error(err)
      res.status(500).json({ msg: "Internal server error" })
    }
  }
)

// router.get("/one/:id", async (req, res) => {
//   try {
//     const userId = req.params.id

//     const user = await userSchema.aggregate([
//       {
//         $match: {
//           _id: new mongoose.Types.ObjectId(userId),
//         },
//       },
//       {
//         $lookup: {
//           from: "admins",
//           localField: "center_id",
//           foreignField: "_id",
//           as: "fitness_center",
//         },
//       },
//       {
//         $lookup: {
//           from: "memberships",
//           localField: "membership_id",
//           foreignField: "_id",
//           as: "membership",
//         },
//       },
//       {
//         $lookup: {
//           from: "sessions",
//           localField: "session_id",
//           foreignField: "_id",
//           as: "session",
//         },
//       },
//     ])
//     res.status(200).json({ msg: "success", user })
//   } catch (err) {
//     console.log(err)
//     res.status(500).json({ msg: "internal server error" })
//   }
// })
router.get("/one/:id", async (req, res) => {
  try {
    const userId = req.params.id

    // const user = await userSchema.aggregate([
    //   {
    //     $match: {
    //       _id: userId,
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "admins",
    //       localField: "center_id",
    //       foreignField: "_id",
    //       as: "fitness_center",
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "memberships",
    //       localField: "membership_id",
    //       foreignField: "_id",
    //       as: "membership",
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "sessions",
    //       localField: "session_id",
    //       foreignField: "_id",
    //       as: "session",
    //     },
    //   },
    //   {
    //     $unwind: "$session",
    //   },
    //   {
    //     $lookup: {
    //       from: "session_activiies",
    //       localField: "session._id",
    //       foreignField: "session_id",
    //       as: "session.activities",
    //     },
    //   },
    //   // {
    //   //   $group: {
    //   //     _id: "$_id",
    //   //     user: { $first: "$$ROOT" },
    //   //     session_activities: { $push: "$session.activities" },
    //   //   },
    //   // },
    //   // {
    //   //   $project: {
    //   //     user: 1,
    //   //     session_activities: 1,
    //   //   },
    //   // },
    // ])

    const user = await userSchema.find({_id: userId})

    res.status(200).json({ msg: "success", user })
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: "internal server error" })
  }
})

// // get all users
router.get("/all", async (req, res) => {
  try {
    // query
    const allUsers = await userSchema.aggregate([
      {
        $lookup: {
          from: "trainers",
          localField: "trainer_id",
          foreignField: "_id",
          as: "trainer",
        },
      },
    ])

    if (allUsers) {
      res.json({
        msg: "success",
        user_count: allUsers.length,
        users: allUsers,
      })
    }
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: "internal server error" })
  }
})

router.get("/new/center/:id", async (req, res) => {
  try {
    const centerId = req.params.id

    if (!mongoose.Types.ObjectId.isValid(centerId)) {
      return res.status(400).json({ msg: "Center ID is required" })
    }

    // Get today's date
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const new_users = await userSchema
      .find({
        center_id: centerId,
        dateCreated: { $gte: today },
      })
      .sort({ dateCreated: -1 })

    // Check if any new user is found
    if (new_users.length > 0) {
      return res.json({
        msg: "success",
        user_count: new_users.length,
        new_users,
      })
    } else {
      return res.json({ msg: "No new user found for this center today" })
    }
  } catch (err) {
    console.error(err)
    return res.status(500).json({ msg: "Internal server error" })
  }
})

// User login
router.post("/login", async (req, res) => {
  try {
    // Take email and password from the request body
    const { email, password } = req.body

    // Check if a user with the provided email exists
    const user = await userSchema.findOne({ email })

    if (!user) {
      return res.status(401).json({ msg: "User email does not exist " })
    }

    // Compare the provided password with the hashed password in the database
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return res.status(401).json({ msg: "Incorrect password" })
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
    console.error(err)
    res.status(500).json({ msg: "Internal server error" })
  }
})

// delete a user
router.delete("/delete/:id", async (req, res) => {
  try {
    // user id
    const userId = req.params.id

    // query
    const deleteUser = await userSchema.findByIdAndDelete(userId)
    if (deleteUser) {
      res.json({ msg: "user deleted successfully", deleted_user: deleteUser })
    } else {
      res.json({ msg: "user not found" })
    }
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: "internal server error" })
  }
})

// delete all users
router.delete("/delete", async (req, res) => {
  try {
    // user id
    const userId = req.params.id

    // query
    const deleteUser = await userSchema.deleteMany({})
    if (deleteUser) {
      res.json({
        msg: "all users deleted successfully",
        deleted_user: deleteUser,
      })
    } else {
      res.json({ msg: "user not found" })
    }
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: "internal server error" })
  }
})

// update a user
router.put(
  "/update/:id",
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
      // user id
      const userId = req.params.id

      // user creds
      const { first_name, last_name, email, phone, password, goal } = req.body

      const hashedPassword = await bcrypt.hash(password, 10)

      // query
      const updateUser = await userSchema.updateOne(
        { _id: userId },
        { first_name, last_name, email, goal, phone, password: hashedPassword }
      )

      const user = await userSchema.find({ _id: userId })

      if (updateUser.modifiedCount === 1) {
        res.json({ msg: "user updated successfully", updated_user: user })
      } else {
        res.json({ msg: "user not found" })
      }
    } catch (err) {
      console.log(err)
      res.status(500).json({ msg: "internal server error" })
    }
  }
)

// subscribe to a membership plan
router.put("/subscribe/:id", async (req, res) => {
  try {
    // creds
    const userId = req.params.id
    const { membership_id } = req.body

    // query
    const membershipSignUp = await userSchema.updateOne(
      { _id: userId },
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

// subscribe to a session
router.put("/register/:id", async (req, res) => {
  try {
    // creds
    const userId = req.params.id
    const { session_id } = req.body

    // query
    const register_session = await userSchema.updateOne(
      { _id: userId },
      { session_id: session_id }
    )

    if (register_session.modifiedCount === 1) {
      res.json({ msg: "Session registered successfully" })
    } else {
      res.json({ msg: "Already registered to this session" })
    }
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: "internal server error" })
  }
})

// remove all memberships
router.put("/remove/all/:id", async (req, res) => {
  try {
    // creds
    const userId = req.params.id

    // query
    const removeAllMemberships = await userSchema.updateOne(
      { _id: userId },
      { membership_id: null }
    )

    if (removeAllMemberships.modifiedCount === 1) {
      res.json({ msg: "all memberships removed successfully" })
    } else {
      res.status(404).json({ msg: "membership not found" })
    }
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: "internal server error" })
  }
})

// get all user's based on center id
router.get("/all/center/:id", async (req, res) => {
  try {
    // creds
    const user_center = req.params.id

    // query
    const allUsers = await userSchema.aggregate([
      {
        $match: {
          center_id: new mongoose.Types.ObjectId(user_center),
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
      {
        $sort: {
          dateCreated: -1,
        },
      },
    ])

    if (allUsers) {
      res.json({
        msg: "success",
        user_count: allUsers.length,
        users: allUsers,
      })
    } else {
      res.json({ msg: "users not found" })
    }
  } catch (err) {
    console.error(err)
    res.status(500).json({ msg: "Internal server error" })
  }
})

// open notification
router.put("/notification/on/:id", async (req, res) => {
  try {
    const userId = req.params.id

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ msg: "user id not found" })
    }

    const user = await userSchema.updateOne(
      { _id: userId },
      { $set: { isNotification: true } }
    )

    return user.modifiedCount === 1
      ? res.status(200).json({ msg: "notification has been turned on" })
      : res.status(404).json({ msg: "notification is already on" })
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: "internal server error" })
  }
})

router.put("/notification/off/:id", async (req, res) => {
  try {
    const userId = req.params.id

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ msg: "user id not found" })
    }

    const user = await userSchema.updateOne(
      { _id: userId },
      { $set: { isNotification: false } }
    )

    return user.modifiedCount === 1
      ? res.status(200).json({ msg: "notification has been turned off" })
      : res.status(404).json({ msg: "notification is already off" })
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: "internal server error" })
  }
})

// group users by fitness gaols
router.get("/goals/:center_id", async (req, res) => {
  try {
    const centerId = req.params.center_id

    const users = await userSchema.aggregate([
      {
        $match: { center_id: new mongoose.Types.ObjectId(centerId) },
      },
      {
        $group: {
          _id: "$goal",
          users: { $push: "$$ROOT" },
        },
      },
    ])

    res.json({ msg: "success", users })
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: "Internal server error" })
  }
})

// assing users to trainers
router.put("/assign/:userId/to/:trainerId", async (req, res) => {
  try {
    const userId = req.params.userId
    const trainerId = req.params.trainerId

    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(trainerId)
    ) {
      return res.status(400).json({ msg: "Invalid user or trainer ID" })
    }

    const trainer = await trainerSchema.findOne({ _id: trainerId })

    // Check if the user exists
    const user = await userSchema.findById(userId)
    if (!user) {
      return res.status(404).json({ msg: "User not found" })
    }

    const message = `${user.first_name} ${user.last_name} has been assigned to you`

    // Update the user's trainer_id field with the new trainer ID
    user.trainer_id = trainerId
    await user.save()

    const newActivity = new activitiesSchema({
      trainer_id: trainerId,
      message,
    })

    const saveActivity = await newActivity.save()

    res.status(200).json({ msg: "User assigned to trainer successfully" })
  } catch (err) {
    console.error(err)
    res.status(500).json({ msg: "Internal server error" })
  }
})

// get users assigned to trainer
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
