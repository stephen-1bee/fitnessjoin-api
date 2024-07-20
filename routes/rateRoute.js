const mongoose = require("mongoose")
const rateSchema = require("../models/rateSchema")
const express = require("express")
const router = express.Router()
const admin = require("../models/adminSchema")
const { check, validationResult } = require("express-validator")

// rate an admin
router.post(
  "/create",
  [
    check("rating")
      .isLength({ max: 5 })
      .withMessage("Rating must be at least 5 characters long"),
  ],
  async (req, res) => {
    try {
      const { center_id, rating, trainer_id, user_id, number } = req.body

      const errors = validationResult(req)

      if (!errors.isEmpty()) {
        const error = errors.array().map((err) => err.msg)
        return res.status(402).json({ msg: error[0] })
      }

      const newRating = new rateSchema({
        center_id,
        rating,
        trainer_id,
        user_id,
        number,
      })

      // save
      const saveRate = await newRating.save()

      if (saveRate) {
        res.status(200).json({ msg: "Take you for your feedback", saveRate })
      } else {
        res.status(404).json({ msg: "" })
      }
    } catch (err) {
      console.log(err)
      res.status(500).json({ msg: " internal server error" })
    }
  }
)

// all rating
router.get("/all", async (req, res) => {
  try {
    const ratings = await rateSchema.find()

    res.status(404).json({ msg: "success", ratings })
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: " internal server error" })
  }
})

// rating by fitness center
router.get("/center/:id", async (req, res) => {
  try {
    const centerId = req.params.id

    const center_rating = await rateSchema.aggregate([
      {
        $match: {
          center_id: new mongoose.Types.ObjectId(centerId),
        },
      },
      {
        $lookup: {
          from: "admins",
          localField: "center_id",
          foreignField: "_id",
          as: "center",
        },
      },
    ])

    if (center_rating.length === 0) {
      // Check if any rating is found
      return res.status(404).json({ msg: "No ratings found for this center" })
    }

    res.status(200).json({ msg: "success", center_rating })
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: "internal server error" })
  }
})

router.delete("/delete", async (req, res) => {
  try {
    // creds
    const articleId = req.params.id

    // query
    const deleteArticle = await rateSchema.deleteMany({})

    if (deleteArticle) {
      res.json({
        msg: "article deleted successfully",
        deleted_article: deleteArticle,
      })
    } else {
      res.json({ msg: "article not found" })
    }
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: "internal server error" })
  }
})
module.exports = router
