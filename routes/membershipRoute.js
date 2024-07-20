const express = require("express")
const router = express.Router()
const membershipSchema = require("../models/membershipSchema")

// create a membership
router.post("/create", async (req, res) => {
  try {
    // taking creds
    const { name, price, center_id } = req.body

    // new session
    const newMembership = new membershipSchema({
      name: name,
      price: price,
      center_id: center_id,
    })

    // save session
    const savedMembership = await newMembership.save()

    res.status(201).json({
      msg: "membership added successfully",
      membership: savedMembership,
    })
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: "internal server error" })
  }
})

// get all memberships
router.get("/all", async (req, res) => {
  try {
    // query
    const allMemberships = await membershipSchema.find()

    res.status(200).json({
      msg: "success",
      membership_count: allMemberships.length,
      memberships: allMemberships,
    })
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: "internal server error" })
  }
})

// get memberships per fitness center
router.get("/all/center/:id", async (req, res) => {
  try {
    // center id
    const centerId = req.params.id

    // query
    const allCenterMemberships = await membershipSchema.find({
      center_id: centerId,
    })

    if (allCenterMemberships) {
      res.json({
        msg: "success",
        center_membership_count: allCenterMemberships.length,
        center_memberships: allCenterMemberships,
      })
    }
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: "internal server error" })
  }
})

// delete a membership
router.delete("/delete/:id", async (req, res) => {
  try {
    // query
    const deletedMembership = await membershipSchema.findByIdAndDelete(
      req.params.id
    )

    res.status(200).json({
      msg: "membership deleted successfully",
      membership: deletedMembership,
    })
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: "internal server error" })
  }
})

// update membership by updating the name and price fields
router.put("/update/:id", async (req, res) => {
  try {
    // taking creds
    const membershipID = req.params.id
    const { name, price } = req.body

    // query
    const updatedMembership = await membershipSchema.updateOne(
      { _id: membershipID },
      { $set: { name, price, dateUpdated: new Date() } }
    )

    const membership = await membershipSchema.find({ _id: membershipID })

    if (updatedMembership.modifiedCount === 1) {
      res.json({
        msg: "membership updated successfully",
        memberships: membership,
      })
    } else {
      res.json({ msg: "failed to updated membership" })
    }
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: "internal server error" })
  }
})



// get a single membership
router.get("/one/:id", async (req, res) => {
  try {
    // creds
    const membershipId = req.params.id

    //query
    const oneMembership = await membershipSchema.findById(membershipId)

    if (oneMembership) {
      res.json({ msg: "success", membership: oneMembership })
    } else {
      res.status(404).json("membership not found")
    }
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: "internal server error" })
  }
})

router.get("/user/:user_id", async (req, res) => {
  try {
    // creds
    const membershipId = req.params.user_id

    //query
    const userMembership = await membershipSchema.findOne({
      user_id: membershipId,
    })

    res.status(200).json({ msg: "success", userMembership })
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: "internal server error" })
  }
})

module.exports = router
