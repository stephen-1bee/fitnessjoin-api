const router = require("express").Router()
const mongoose = require("mongoose")
const sessionActivity = require("../models/sessionActivitySchema")

// create
router.post("/create", async (req, res) => {
  try {
    const { title, session_id, center_id, trainer_id, desc, creator_type } =
      req.body

    const session_activity = new sessionActivity({
      title,
      desc,
      session_id,
      center_id,
      trainer_id,
      creator_type,
    })

    if (session_activity) {
      const save = session_activity.save()
      res.json({ msg: "session activity created successfully" })
    } else {
      res
        .status(404)
        .json({ msg: "failed to create session activity", session_activity })
    }
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: "internal server error" })
  }
})

router.get("/all", async (req, res) => {
  try {
    const all_session_activity = await sessionActivity.find()
    res.json({ all_session_activity })
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: "internal server error" })
  }
})

// sesison activity by session id
router.get("/:id", async (req, res) => {
  try {
    const session_activity = await sessionActivity.find({
      session_id: req.params.id,
    })

    res.status(200).json({
      msg: "success",
      session_activity,
    })
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: "internal server error" })
  }
})

// session activiy by center id
router.get("/center/:id", async (req, res) => {
  try {
    const center_session_activity = await sessionActivity.find({
      center_id: req.params.id,
      creator_type: "center",
    })

    res.json({ msg: "success", center_session_activity })
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: "Internal server error" })
  }
})

// get all afiliate trainer session activity
router.get("/affiliate-trainer/:id", async (req, res) => {
  try {
    const centerId = req.params.id

    if (!mongoose.Types.ObjectId.isValid(centerId)) {
      return res.status(400).json({ msg: "center id not valid" })
    }

    const trainer = await sessionActivity.aggregate([
      {
        $match: {
          center_id: new mongoose.Types.ObjectId(centerId),
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

// session activity by trainer id
router.get("/trainer/:id", async (req, res) => {
  try {
    const trainer_session_activity = await sessionActivity.find({
      trainer_id: req.params.id,
      creator_type: "trainer",
    })

    res.json({ msg: "success", trainer_session_activity })
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: "Internal server error" })
  }
})

router.put("/update/:id", async (req, res) => {
  try {
    const session_activity_id = req.params.id

    const { title, desc, session_id } = req.body

    if (!mongoose.Types.ObjectId.isValid(session_activity_id)) {
      return res.status(404).json({ msg: "invalid session activity id" })
    }

    const update_session = await sessionActivity.updateOne(
      { _id: session_activity_id },
      {
        $set: {
          title,
          desc,
          session_id,
          dateUpdated: new Date(),
        },
      }
    )

    if (update_session.modifiedCount === 1) {
      res.status(200).json({ msg: "Activity updated successfully" })
    } else {
      res.status(404).json({ msg: "failed to updated session activity" })
    }
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: "internal server error" })
  }
})

// delete activity
router.delete("/delete/:id", async (req, res) => {
  try {
    const activityId = req.params.id

    const del_activity = await sessionActivity.findByIdAndDelete(activityId)

    if (del_activity) {
      res
        .status(200)
        .json({ msg: "session activity deleted successfully", del_activity })
    } else {
      res.status(404).json({ msg: "failed to delete session activity" })
    }
  } catch (err) {
    res.status(500).json({ msg: "internal server error" })
  }
})

// complete activitity
router.put("/complete/:id", async (req, res) => {
  try {
    const sessionActivityId = req.params.id

    if (!mongoose.Types.ObjectId.isValid(sessionActivityId)) {
      return res.status(400).json({ msg: "Session activity ID is not valid" })
    }

    const complete = await sessionActivity.updateOne(
      { _id: sessionActivityId },
      { $set: { status: true } }
    )

    if (complete.modifiedCount === 1) {
      return res
        .status(200)
        .json({ msg: "Activity completed successfully", complete })
    } else {
      return res.status(404).json({ msg: "session has been marked complete" })
    }
  } catch (err) {
    console.error(err)
    return res.status(500).json({ msg: "Internal server error" })
  }
})

// complete activitity
router.put("/incomplete/:id", async (req, res) => {
  try {
    // creds
    const sessionActivityId = req.params.id

    if (!mongoose.Types.ObjectId.isValid(sessionActivityId)) {
      return res.status(404).json({ msg: "session activity id not valid" })
    }

    const complete = await sessionActivity.updateOne(
      { _id: sessionActivityId },
      { $set: { status: false } }
    )

    return complete.modifiedCount === 1
      ? res.status(200).json({ msg: "Activity marked as incomplete", complete })
      : res.status(404).json({ msg: "failed to incomplete Activity" })
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: "internal server error" })
  }
})

module.exports = router
