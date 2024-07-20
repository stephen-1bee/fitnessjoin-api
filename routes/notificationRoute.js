const mongoose = require("mongoose")
const express = require("express")
const router = express.Router()
const notificationSchema = require("../models/notificationSchema")

router.post("/create", async (req, res) => {
  try {
    const { center_id, message, trainer_id } = req.body

    const newNotification = new notificationSchema({
      center_id,
      trainer_id,
      message,
    })

    const saved_notification = await newNotification.save()

    return saved_notification
      ? res
          .status(200)
          .json({ msg: "notification sent successfully", saved_notification })
      : res.status(404).json({ msg: "failed to send notification" })
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: "internal server error" })
  }
})

// all
router.get("/all", async (req, res) => {
  try {
    const all_notification = await notificationSchema.aggregate([
      {
        $lookup: {
          from: "trainers",
          localField: "trainer_id",
          foreignField: "_id",
          as: "trainer",
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

    res.json({
      msg: "success",
      notification_count: all_notification.length,
      all_notification,
    })
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: "internal server error" })
  }
})

router.delete("/delete/:id", async (req, res) => {
  try {
    const notificationId = req.params.id

    if (!mongoose.Types.ObjectId.isValid(notificationId)) {
      return res.status(400).json({ msg: "notification id not  found" })
    }

    const notification = await notificationSchema.findByIdAndDelete(
      notificationId
    )

    return notification
      ? res
          .status(200)
          .json({ msg: "notification deleted successfully", notification })
      : res.status(404).json({ msg: "failed to delete notification" })
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: "internal server error" })
  }
})

router.put("/update/:id", async (req, res) => {
  try {
    const notificationId = req.params.id

    if (!mongoose.Types.ObjectId.isValid(notificationId)) {
      return res.status(400).json({ msg: "notification id not  found" })
    }

    const { message } = req.body

    const notification = await notificationSchema.updateOne(
      { _id: notificationId },
      { $set: { message, dateUpdated: new Date() } }
    )

    if (notification.modifiedCount === 1) {
      res.status(200).json({ msg: "broadcast updated successfully" })
    } else {
      res.status(500).json({ msg: "failed to update broadcast" })
    }
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: "internal server error" })
  }
})

// notificaiton by fitness id
router.get("/center/:id", async (req, res) => {
  try {
    const centerId = req.params.id

    if (!mongoose.Types.ObjectId.isValid(centerId)) {
      return res.status(400).json({ msg: "center id not found" })
    }

    const center_notification = await notificationSchema.aggregate([
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

    res.status(200).json({ msg: "success", center_notification })
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: "internal server error" })
  }
})

// notification by trainer
router.get("/trainer/:id", async (req, res) => {
  try {
    const trainerId = req.params.id

    if (!mongoose.Types.ObjectId.isValid(trainerId)) {
      return res.status(400).json({ msg: "trainer id not found" })
    }

    const tainer_notification = await notificationSchema.aggregate([
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

    res.status(200).json({ msg: "success", tainer_notification })
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: "internal server error" })
  }
})

module.exports = router
