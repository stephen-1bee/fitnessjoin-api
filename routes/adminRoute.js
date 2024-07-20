const express = require("express")
const router = express.Router()
const bcrypt = require("bcrypt")
const upload = require("../middleware/multer")
const cloudinary = require("../utils/cloudinary")
const mongoose = require("mongoose")
const membershipSchema = require("../models/membershipSchema")
const fitnessGoalsSchema = require("../models/fitnessGoalsSchema")
const { check, validationResult } = require("express-validator")
const JTW = require("jsonwebtoken")

// admin schema import
const adminSchema = require("../models/adminSchema")

// welcoming
router.get("/", (req, res) => {
  res.json({ message: "welcome to fitness center api" })
})

// add admin
router.post(
  "/create",
  upload.single("photo"),
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
      // taking creds
      const {
        name,
        desc,
        email,
        type,
        phone,
        password,
        opening_time,
        closing_time,
        location,
      } = req.body

      const hashedPassword = await bcrypt.hash(password, 10)

      const errors = validationResult(req)

      if (!errors.isEmpty()) {
        const errorMessages = []
        errors.array().forEach((err) => {
          errorMessages.push(err.msg)
        })
        return res.status(401).json({ msg: errorMessages[0] })
      }

      // Check if a file was uploaded
      if (!req.file) {
        return res.status(400).json({ message: "Please upload a photo" })
      }

      const photo = req.file.filename

      // checking if user exists
      const alreadyAdminEmail = await adminSchema.findOne({ email })
      const alreadyAdminName = await adminSchema.findOne({ name })

      if (alreadyAdminEmail) {
        return res
          .status(400)
          .json({ message: "Fitness Admin with this email already exist" })
      }

      // // File details
      // const photo = (await cloudinary.uploader.upload(req.file.path))
      //   .secure_url;

      if (alreadyAdminName) {
        return res
          .status(404)
          .json({ msg: "Fitness Admin with this name already exist" })
      }

      // creating new user
      const newAdmin = new adminSchema({
        photo,
        name,
        desc,
        email,
        type,
        phone,
        password: hashedPassword,
        opening_time,
        location,
        closing_time,
      })

      // saving user
      const addAdmin = await newAdmin.save()
      return addAdmin
        ? res.json({
            msg: "Fitness center created successfully",
            admin: addAdmin,
          })
        : res.status(400).json({ msg: "failed to add fitness center" })
    } catch (err) {
      console.log(err)
      res.status(500).json({
        message: "Internal server error",
      })
    }
  }
)

// admin login with email and password with password checked with bcrypt
router.post("/login", async (req, res) => {
  try {
    // taking creds
    const { email, password } = req.body

    // checking if user exists
    const admin = await adminSchema.findOne({ email })
    if (!admin) {
      return res.status(400).json({ message: "Admin email does not exist" })
    }

    // checking if password is correct
    const isMatch = await bcrypt.compare(password, admin.password)
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password" })
    }

    const token = await JTW.sign({ email, password }, process.env.JWT_SECRET, {
      expiresIn: 3600,
    })

    admin.accessToken = token

    if (token) {
      // returning user
      res.json({ msg: "login successful", admin })
    } else {
      res.status(401).json({ msg: "an error occurred, try again later" })
    }
  } catch (err) {
    console.log(err)
    res.status(500).json({
      message: "Internal server error",
    })
  }
})

// get all admins
// router.get("/all", async (req, res) => {
//   try {
//     // query
//     const allAdmins = await adminSchema.aggregate([
//       {
//         $lookup: {
//           from: "ratings",
//           localField: "_id",
//           foreignField: "center_id",
//           as: "ratings",
//         },
//       },
//       {
//         $sort: {
//           dateCreated: -1,
//         },
//       },
//     ])

//     if (allAdmins) {
//       res.json({
//         msg: "success",
//         center_count: allAdmins.length,
//         fitness_centers: allAdmins,
//       })
//     }
//   } catch (err) {
//     console.log(err)
//     res.status(500).json({
//       message: "Internal server error",
//     })
//   }
// })

router.get("/all", async (req, res) => {
  try {
    // Aggregate to get all admins with their associated ratings
    const allAdmins = await adminSchema.aggregate([
      {
        $lookup: {
          from: "ratings",
          localField: "_id",
          foreignField: "center_id",
          as: "ratings",
        },
      },
      {
        $sort: {
          dateCreated: -1,
        },
      },
    ])

    // Calculate average rating for each fitness center
    allAdmins.forEach((admin) => {
      let totalRatings = admin.ratings.length
      let sumOfRatings = admin.ratings.reduce(
        (acc, rating) => acc + rating.number,
        0
      )
      // Convert average rating to a 5-star scale and round to nearest whole number
      admin.averageRating = Math.round((sumOfRatings / (totalRatings * 20)) * 5)
    })

    res.json({
      msg: "success",
      center_count: allAdmins.length,
      fitness_centers: allAdmins,
    })
  } catch (err) {
    console.log(err)
    res.status(500).json({
      message: "Internal server error",
    })
  }
})

// get a single admin
router.get("/one/:id", async (req, res) => {
  try {
    // Get admin id
    const adminId = req.params.id

    // Query to fetch admin with associated ratings
    const admin = await adminSchema.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(adminId), // Match admin ID
        },
      },
      {
        $lookup: {
          from: "ratings",
          localField: "_id",
          foreignField: "center_id",
          as: "ratings",
        },
      },
    ])

    admin.forEach((admin) => {
      let totalRatings = admin.ratings.length
      let sumOfRatings = admin.ratings.reduce(
        (acc, rating) => acc + rating.number,
        0
      )
      // Convert average rating to a 5-star scale and round to nearest whole number
      admin.averageRating = Math.round((sumOfRatings / (totalRatings * 20)) * 5)
    })

    if (admin.length > 0) {
      res.json({ msg: "success", admin: admin[0] }) // Return the first admin found
    } else {
      res.status(404).json({ msg: "Admin not found" })
    }
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: "Internal server error" })
  }
})

router.delete("/delete/:id", async (req, res) => {
  try {
    // adminId
    const adminId = req.params.id

    const delAdmin = await adminSchema.findByIdAndDelete(adminId)

    return delAdmin
      ? res.status(200).json({ msg: "admin deleted successfully", delAdmin })
      : res.status(404).json({ msg: "failed delete an admin" })
  } catch (err) {
    console.log(err)
  }
})

// update admin
router.put("/update/:id", upload.single("photo"), async (req, res) => {
  try {
    const adminId = req.params.id

    if (!mongoose.Types.ObjectId.isValid(adminId)) {
      return res.status(400).json({ msg: "admin id not found" })
    }

    // grab creds
    const { name, desc, email, location, phone, opening_time, closing_time } =
      req.body

    const admin = await adminSchema.findOne({ _id: adminId })

    const currentPhoto = admin.photo

    let updatedPhoto
    let finalPhoto
    if (req.file) {
      updatedPhoto = req.file.filename
      finalPhoto = req.file ? updatedPhoto : currentPhoto
    }

    const updateAdmin = await adminSchema.updateOne(
      { _id: adminId },
      {
        photo: finalPhoto,
        name,
        desc,
        email,
        location,
        phone,
        opening_time,
        closing_time,
        dateUpdated: new Date(),
      }
    )

    return updateAdmin.modifiedCount === 1
      ? res.status(200).json({ msg: "admin updated successfully", updateAdmin })
      : res.status(404).json({ msg: "failed to update admin" })
    res.json({ currentPhoto })
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: "internal server error" })
  }
})

// get all popular fitness center
router.get("/recomended", async (req, res) => {
  try {
    const recomended = await adminSchema.aggregate([
      {
        $match: {
          rating: { $gte: 4 },
        },
      },
    ])

    return recomended
      ? res.status(200).json({
          msg: "sucess",
          recomended_count: recomended.length,
          recomended,
        })
      : res.status(404).json({ msg: "failed to get popular fitness" })
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: "internal server error" })
  }
})

// add fitness goal
router.post("/goal/create", async (req, res) => {
  try {
    const { center_id, goal } = req.body

    const newGoal = new fitnessGoalsSchema({
      center_id,
      goal,
    })

    const savedGoal = await newGoal.save()

    return savedGoal
      ? res
          .status(200)
          .json({ msg: " fitness goal created successfully", savedGoal })
      : res.status(404).json({ msg: "failed to create fitness goal" })
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: "internal server error" })
  }
})

router.get("/goal/all", async (req, res) => {
  try {
    const allGoals = await fitnessGoalsSchema.find()

    res.status(200).json({ msg: "success", allGoals })
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: "internal server error" })
  }
})

router.delete("/goal/delete/:id", async (req, res) => {
  try {
    const goalId = req.params.id

    if (!mongoose.Types.ObjectId.isValid(goalId)) {
      return res.status(400).json({ msg: "fitness goal id not found" })
    }

    const del_goal = await fitnessGoalsSchema.findByIdAndDelete(goalId)

    return del_goal
      ? res.status(200).json({ msg: "goal deleted successfully", del_goal })
      : res.status(404).json({ msg: "failed to delete fitness goal" })
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: "internal server error" })
  }
})

router.get("/goal/center/:id", async (req, res) => {
  try {
    const centerId = req.params.id

    if (!mongoose.Types.ObjectId.isValid(centerId)) {
      return res.status(400).json({ msg: "fitness center id not found" })
    }

    const center_goals = await fitnessGoalsSchema.find({ center_id: centerId })

    return center_goals
      ? res.status(200).json({
          msg: "success",
          goals_count: center_goals.length,
          center_goals,
        })
      : res.status(404).json({ msg: "failed to find fitness center goals" })
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: "internal server error" })
  }
})

router.put("/goal/update/:id", async (req, res) => {
  try {
    const goalId = req.params.id

    const { goal } = req.body

    const update_goal = await fitnessGoalsSchema.updateOne(
      { _id: goalId },
      { $set: { goal } }
    )

    if (update_goal.modifiedCount === 1) {
      res.status(200).json({ msg: "goal updated successfully" })
    } else {
      res.status(404).json({ msg: "failed to update goal" })
    }
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: "internal server error" })
  }
})

// open profile
router.put("/open/:id", async (req, res) => {
  try {
    const centerId = req.params.id

    if (!mongoose.Types.ObjectId.isValid(centerId)) {
      return res.status(400).json({ msg: "fitness center id not found" })
    }

    const admin = await adminSchema.updateOne(
      { _id: centerId },
      { $set: { isOpened: true } }
    )

    if (admin.modifiedCount === 1) {
      res.status(200).json({ msg: "Profile opended successfully" })
    } else {
      res.status(404).json({ msg: "Profile is already opened" })
    }
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: "internal server error" })
  }
})

// close profile
router.put("/close/:id", async (req, res) => {
  try {
    const centerId = req.params.id

    if (!mongoose.Types.ObjectId.isValid(centerId)) {
      return res.status(400).json({ msg: "fitness center id not found" })
    }

    const admin = await adminSchema.updateOne(
      { _id: centerId },
      { $set: { isOpened: false } }
    )

    if (admin.modifiedCount === 1) {
      res.status(200).json({ msg: "Profile closed successfully" })
    } else {
      res.status(404).json({ msg: "Profile is already closed" })
    }
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: "internal server error" })
  }
})

// open registration
router.put("/register/on/:id", async (req, res) => {
  try {
    const centerId = req.params.id

    if (!mongoose.Types.ObjectId.isValid(centerId)) {
      return res.status(400).json({ msg: "fitness center id not found" })
    }

    const admin = await adminSchema.updateOne(
      { _id: centerId },
      { $set: { allowRegistration: true } }
    )

    return admin.modifiedCount === 1
      ? res.status(200).json({ msg: "registration opended successfully" })
      : res.status(404).json({ msg: "registration already opened" })
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: "internal server error" })
  }
})

// close registration
router.put("/register/off/:id", async (req, res) => {
  try {
    const centerId = req.params.id

    if (!mongoose.Types.ObjectId.isValid(centerId)) {
      return res.status(400).json({ msg: "fitness center id not found" })
    }

    const admin = await adminSchema.updateOne(
      { _id: centerId },
      { $set: { allowRegistration: false } }
    )

    return admin.modifiedCount === 1
      ? res.status(200).json({ msg: "registration closed successfully" })
      : res.status(404).json({ msg: "registration already closed" })
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: "internal server error" })
  }
})

// open notification
router.put("/notification/on/:id", async (req, res) => {
  try {
    const centerId = req.params.id

    if (!mongoose.Types.ObjectId.isValid(centerId)) {
      return res.status(400).json({ msg: "fitness center id not found" })
    }

    const admin = await adminSchema.updateOne(
      { _id: centerId },
      { $set: { isNotification: true } }
    )

    return admin.modifiedCount === 1
      ? res.status(200).json({ msg: "notification has been turned on" })
      : res.status(404).json({ msg: "notification is already on" })
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: "internal server error" })
  }
})

// close notification
router.put("/notification/off/:id", async (req, res) => {
  try {
    const centerId = req.params.id

    if (!mongoose.Types.ObjectId.isValid(centerId)) {
      return res.status(400).json({ msg: "fitness center id not found" })
    }

    const admin = await adminSchema.updateOne(
      { _id: centerId },
      { $set: { isNotification: false } }
    )

    return admin.modifiedCount === 1
      ? res.status(200).json({ msg: "notification has been turned off" })
      : res.status(404).json({ msg: "notification is already off" })
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: "internal server error" })
  }
})

module.exports = router
