const express = require("express")
const router = express.Router()
const sessionSchema = require("../models/sessionSchema")
const moment = require("moment")
const mongoose = require("mongoose")

// adding a new session
router.post("/create", async (req, res) => {
  try {
    // taking creds
    const {
      title,
      description,
      start_date,
      end_date,
      start_time,
      end_time,
      center_id,
      trainer_id,
      creator_type,
      isApproved,
    } = req.body

    // new session
    const newSession = new sessionSchema({
      title,
      description,
      start_date,
      end_date,
      start_time,
      end_time,
      center_id,
      trainer_id,
      isApproved,
      creator_type,
    })

    // query
    const addSession = await newSession.save()

    if (addSession) {
      res.json({ msg: "session added successfully", session: addSession })
    } else {
      res.json({ msg: "failed to add session" })
    }
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: "internal server error" })
  }
})

// get all sessions
router.get("/all", async (req, res) => {
  try {
    // query
    const allSessions = await sessionSchema.find()

    if (allSessions) {
      res.json({
        msg: "successs",
        session_count: allSessions.length,
        sessions: allSessions,
      })
    }
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: "internal server error" })
  }
})

// delete a session
router.delete("/delete/:id", async (req, res) => {
  try {
    // session id
    const sessionId = req.params.id

    // query
    const deleteSession = await sessionSchema.findByIdAndDelete(sessionId)

    if (deleteSession) {
      res.json({ msg: "session deleted successfully" })
    } else {
      res.json({ msg: "session not found" })
    }
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: "internal server error" })
  }
})

// approve session
router.put("/approve/:id", async (req, res) => {
  try {
    const sessionId = req.params.id

    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      return res.status.json({ msg: "session id not valid" })
    }

    const approve_session = await sessionSchema.updateOne(
      { _id: sessionId },
      {
        $set: {
          isApproved: true,
        },
      }
    )

    if (approve_session.modifiedCount === 1) {
      res.status(200).json({
        msg: "session approved successfully",
        approve_session,
      })
    } else {
      res.status(404).json({ msg: "session already approved" })
    }
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: "Internal server error" })
  }
})

// disapprove article
router.put("/disapprove/:id", async (req, res) => {
  try {
    const sessionId = req.params.id

    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      return res.status.json({ msg: "session id not valid" })
    }

    const disapprove_session = await sessionSchema.updateOne(
      { _id: sessionId },
      {
        $set: {
          isApproved: false,
        },
      }
    )

    if (disapprove_session.modifiedCount === 1) {
      res.status(200).json({
        msg: "session disapproved successfully",
        disapprove_session,
      })
    } else {
      res.status(404).json({ msg: "session already disapproved" })
    }
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: "Internal server error" })
  }
})

// get trainers sessions by associated fitness center
router.get("/trainer-sessions/:id", async (req, res) => {
  try {
    const centerId = req.params.id

    if (!mongoose.Types.ObjectId.isValid(centerId)) {
      return res.status(400).json({ msg: "session id not valid" })
    }

    const trainer = await sessionSchema.aggregate([
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
      {
        $lookup: {
          from: "session_activiies",
          localField: "_id",
          foreignField: "session_id",
          as: "activties",
        },
      },
    ])

    res.status(200).json({ msg: "success", trainer })
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: "Internal server error" })
  }
})

// get trainer session
router.get("/trainer/:id", async (req, res) => {
  try {
    const trainerId = req.params.id

    if (!mongoose.Types.ObjectId.isValid(trainerId)) {
      return res.status(400).json({ msg: "session id not valid" })
    }

    const trainer_sessions = await sessionSchema.find({
      trainer_id: trainerId,
      creator_type: "trainer",
    })

    res.status(200).json({ msg: "success", trainer_sessions })
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: "Internal server error" })
  }
})

// get approved sessions by trainerid
router.get("/approved/:id", async (req, res) => {
  try {
    // creds
    const trainerId = req.params.id

    if (!mongoose.Types.ObjectId.isValid(trainerId)) {
      return res.status.json({ msg: "tainer id not valid" })
    }

    // get trainer id and approved sessions
    const approved_sessions = await sessionSchema.aggregate([
      {
        $match: {
          trainer_id: new mongoose.Types.ObjectId(trainerId),
          isApproved: true,
        },
      },
      {
        $lookup: {
          from: "session_activiies",
          localField: "_id",
          foreignField: "session_id",
          as: "activties",
        },
      },
    ])

    return approved_sessions
      ? res.status(200).json({ msg: "success", approved_sessions })
      : res.status(404).json({ msg: "failed to get trainer approved session" })
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: "internal server error" })
  }
})

// pending sessions
router.get("/pending/:id", async (req, res) => {
  try {
    // creds
    const trainerId = req.params.id

    if (!mongoose.Types.ObjectId.isValid(trainerId)) {
      return res.status.json({ msg: "tainer id not valid" })
    }

    // get trainer id and approved sessions
    const pending_sessions = await sessionSchema.aggregate([
      {
        $match: {
          trainer_id: new mongoose.Types.ObjectId(trainerId),
          isApproved: false,
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
        $lookup: {
          from: "session_activiies",
          localField: "_id",
          foreignField: "session_id",
          as: "activties",
        },
      },
    ])

    return pending_sessions
      ? res.status(200).json({ msg: "success", pending_sessions })
      : res.status(404).json({ msg: "failed to get trainer approved session" })
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: "internal server error" })
  }
})

// get fitness sessions
router.get("/center-sessions/:id", async (req, res) => {
  try {
    const centerId = req.params.id

    if (!mongoose.Types.ObjectId.isValid(centerId)) {
      return res.status(400).json({ msg: "session id not valid" })
    }

    const center_sessions = await sessionSchema.aggregate([
      {
        $match: {
          center_id: new mongoose.Types.ObjectId(centerId),
          creator_type: "center",
        },
      },
      {
        $lookup: {
          from: "session_activiies",
          localField: "_id",
          foreignField: "session_id",
          as: "activties",
        },
      },
    ])

    res.status(200).json({ msg: "success", center_sessions })
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: "Internal server error" })
  }
})

// update session
router.put("/update/:id", async (req, res) => {
  try {
    const sessionId = req.params.id

    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      return res.status.json({ msg: "sesison id not valid" })
    }

    const { title, description, start_date, end_date, start_time, end_time } =
      req.body

    if (start_date < new Date()) {
      return res
        .status(401)
        .json({ msg: "cannot pick dates below current date" })
    }

    const updateSession = await sessionSchema.updateOne(
      { _id: sessionId },
      {
        title,
        description,
        start_date,
        end_date,
        start_time,
        end_time,
        dateUpdated: new Date(),
      }
    )

    return updateSession
      ? res.status(200).json({ msg: "session updated successfully" })
      : res.status(404).json({ msg: "failed to update session" })
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: "internal server error" })
  }
})

// assign a session to a client


module.exports = router
