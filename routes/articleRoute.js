const express = require("express")
const router = express.Router()
const articleSchema = require("../models/articleSchema")
const cloudinary = require("../utils/cloudinary")
const upload = require("../middleware/multer")
const mongoose = require("mongoose")
const userSchema = require("../models/userSchema")

// add an article
router.post("/create", upload.single("photo"), async (req, res) => {
  try {
    // creds
    const {
      title,
      desc,
      url,
      center_id,
      trainer_id,
      isApproved,
      creator_type,
    } = req.body

    if (!req.file) {
      return res.status(400).json({ msg: "photo  is require" })
    }

    // const photo = (await cloudinary.uploader.upload(req.file.path)).secure_url;

    const photo = req.file.filename

    // new article
    const newArticle = new articleSchema({
      photo,
      title,
      desc,
      url,
      center_id,
      trainer_id,
      isApproved,
      creator_type,
    })

    // query
    const addArticle = await newArticle.save()

    if (addArticle) {
      res.json({ msg: "article added successfully", article: addArticle })
    } else {
      res.json({ msg: "failed to add article" })
    }
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: "internal server error" })
  }
})

// get all articles
router.get("/all", async (req, res) => {
  try {
    // query
    const allArticles = await articleSchema.find()

    if (allArticles) {
      res.json({
        msg: "success",
        article_count: allArticles.length,
        articles: allArticles,
      })
    }
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: "internal server error" })
  }
})

// delete an article
router.delete("/delete/:id", async (req, res) => {
  try {
    // creds
    const articleId = req.params.id

    // query
    const deleteArticle = await articleSchema.findByIdAndDelete(articleId)

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

// update article
router.put("/update/:id", upload.single("photo"), async (req, res) => {
  try {
    // creds
    const articleId = req.params.id
    const { title, desc, url } = req.body

    const article = await articleSchema.findOne({ _id: articleId })
    const currentPhoto = article.photo

    let updatedPhoto
    let finalPhoto
    if (req.file) {
      updatedPhoto = req.file.filename
      finalPhoto = req.file ? updatedPhoto : currentPhoto
    }
    // query
    const updateArticle = await articleSchema.updateOne(
      { _id: articleId },
      { photo: finalPhoto, title, desc, url }
    )

    if (updateArticle.modifiedCount === 1) {
      res.json({ msg: "article updated successfully" })
    } else {
      res.status(500).json({ msg: "article not found" })
    }
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: "internal server error" })
  }
})

// router.get("/user/:id", async (req, res) => {
//   try {
//     const userId = req.params.id

//     if (!mongoose.Types.ObjectId.isValid(userId)) {
//       res.status(404).json({ msg: "invalid user id" })
//     }

//     const user = await userSchema.findOne({ _id: userId })

//     const centerId = user.center_id

//     // const user_articles = await articleSchema.find({
//     //   center_id: centerId,
//     //   isApproved: true,
//     // })

//     const articles = await articleSchema.aggregate([
//       {
//         $match: {
//           center_id: centerId,
//           isApproved: true,
//         },
//       },
//     ])

//     res.status(200).json({ msg: "success", articles })
//     // res.status(200).json({ msg: "success", user_articles })
//   } catch (err) {
//     console.log(err)
//     res.status(500).json({ msg: "Internal server error" })
//   }
// })

// all articels by trainer id
router.get("/trainer/:id", async (req, res) => {
  try {
    const trainerId = req.params.id

    if (!mongoose.Types.ObjectId.isValid(trainerId)) {
      return res.status(400).json({ msg: "invalid trainer id" })
    }

    // query
    const trainer_articles = await articleSchema.aggregate([
      {
        $match: {
          trainer_id: new mongoose.Types.ObjectId(trainerId),
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

    return trainer_articles
      ? res.status(200).json({ msg: "success", trainer_articles })
      : res.status(404).json({ msg: "failed to get trainer articles" })
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: "Internal server error" })
  }
})

// get approved articles by trainerid
router.get("/trainer/approved/:id", async (req, res) => {
  try {
    // creds
    const trainerId = req.params.id

    if (!mongoose.Types.ObjectId.isValid(trainerId)) {
      return res.status(404).json({ msg: "tainer id not valid" })
    }

    // get trainer id and approved sessions
    const approved_articles = await articleSchema.aggregate([
      {
        $match: {
          trainer_id: new mongoose.Types.ObjectId(trainerId),
          isApproved: true,
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

    return approved_articles
      ? res.status(200).json({ msg: "success", approved_articles })
      : res.status(404).json({ msg: "failed to get trainer approved session" })
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: "internal server error" })
  }
})

// pending tranier articles
router.get("/trainer/pending/:id", async (req, res) => {
  try {
    // creds
    const trainerId = req.params.id

    if (!mongoose.Types.ObjectId.isValid(trainerId)) {
      return res.status.json({ msg: "tainer id not valid" })
    }

    // get trainer id and approved sessions
    const pending_articles = await articleSchema.aggregate([
      {
        $match: {
          trainer_id: new mongoose.Types.ObjectId(trainerId),
          isApproved: false,
        },
      },
    ])

    return pending_articles
      ? res.status(200).json({ msg: "success", pending_articles })
      : res.status(404).json({ msg: "failed to get trainer approved session" })
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: "internal server error" })
  }
})

// approve article
router.put("/approve/:id", async (req, res) => {
  try {
    const articleId = req.params.id

    if (!mongoose.Types.ObjectId.isValid(articleId)) {
      return res.status.json({ msg: "tainer id not valid" })
    }

    const approve_article = await articleSchema.updateOne(
      { _id: articleId },
      {
        $set: {
          isApproved: true,
        },
      }
    )

    if (approve_article.modifiedCount === 1) {
      res
        .status(200)
        .json({ msg: "artcle approved successfully", approve_article })
    } else {
      res.status(404).json({ msg: "article already approved" })
    }
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: "Internal server error" })
  }
})

// disapprove article
router.put("/disapprove/:id", async (req, res) => {
  try {
    const articleId = req.params.id

    if (!mongoose.Types.ObjectId.isValid(articleId)) {
      return res.status.json({ msg: "tainer id not valid" })
    }

    const disapprove_article = await articleSchema.updateOne(
      { _id: articleId },
      {
        $set: {
          isApproved: false,
        },
      }
    )

    if (disapprove_article.modifiedCount === 1) {
      res
        .status(200)
        .json({ msg: "artcle disapproved successfully", disapprove_article })
    } else {
      res.status(404).json({ msg: "article already disapproved" })
    }
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: "Internal server error" })
  }
})

// artcles based on centerid
router.get("/center-articles/:id", async (req, res) => {
  try {
    const centerId = req.params.id

    if (!mongoose.Types.ObjectId.isValid(centerId)) {
      return res.status(400).json({ msg: "center id not valid" })
    }

    const all_centers = await articleSchema.find({ center_id: centerId })

    const center = all_centers.filter(
      (center) => center.creator_type === "center"
    )

    res.status(200).json({ msg: "success", center })
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: "Internal server error" })
  }
})

// affiliate trainer articles
router.get("/trainer-articles/:id", async (req, res) => {
  try {
    const centerId = req.params.id

    if (!mongoose.Types.ObjectId.isValid(centerId)) {
      return res.status(400).json({ msg: "center id not valid" })
    }

    const trainer = await articleSchema.aggregate([
      {
        $match: {
          center_id: centerId,
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

    res.status(200).json({ msg: "success", trainer })
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: "Internal server error" })
  }
})
module.exports = router
