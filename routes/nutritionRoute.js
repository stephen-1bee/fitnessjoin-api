const express = require("express")
const router = express.Router()
const nutritionSchema = require("../models/nutritionSchema")
const mongoose = require("mongoose")

// create nutrition
// Arrays of possible values
const foods = [
  "Salad",
  "Grilled Chicken",
  "Steamed Vegetables",
  "Quinoa Salad",
  "Brown Rice",
  "Lean Fish",
  "Tofu",
  "Greek Yogurt",
  "Oatmeal",
  "Hummus",
  "Avocado",
  "Mixed Nuts",
  "Egg Whites",
  "Sweet Potato",
  "Cauliflower Rice",
  "Spinach",
  "Cottage Cheese",
  "Lean Turkey",
  "Broccoli",
  "Kale",
  "Chia Seeds",
  "Berries",
  "Green Tea",
  "Almond Butter",
  "Whole Wheat Bread",
  "Beans",
  "Lean Beef",
  "Mushrooms",
  "Salmon",
  "Watermelon",
  "Pineapple",
  "Papaya",
  "Oranges",
  "Apples",
  "Grapes",
]

const timesOfDay = ["Morning", "Afternoon", "Evening"]
const categories = [
  "Weight Loss",
  "Weight Gain",
  "Big Muscle",
  "Vegan",
  "Keto",
  "Paleo",
  "Low-Carb",
  "Gluten-Free",
  "Vegetarian",
  "Pescatarian",
  "Dairy-Free",
  "Low-Sugar",
  "High-Protein",
  "Heart-Healthy",
  "Low-Fat",
  "Low-Sodium",
]

router.post("/create", async (req, res) => {
  try {
    // Randomly select values from the arrays
    const food = getRandomValue(foods)
    const time_of_day = getRandomValue(timesOfDay)
    const category = getRandomValue(categories)
    const { center_id, trainer_id, isApproved, creator_type } = req.body

    // Create a new nutrition instance with random values
    const newNutrition = new nutritionSchema({
      food,
      time_of_day,
      category,
      center_id,
      isApproved,
      trainer_id,
      creator_type,
    })

    // Query
    const addNutrition = await newNutrition.save()

    if (addNutrition) {
      res.json({ msg: "Nutrition added successfully", nutrition: addNutrition })
    } else {
      res.json({ msg: "Failed to add nutrition" })
    }
  } catch (err) {
    console.error(err)
    res.status(500).json({ msg: "Internal server error" })
  }
})

// Function to get a random value from an array
function getRandomValue(array) {
  const randomIndex = Math.floor(Math.random() * array.length)
  return array[randomIndex]
}

// get all nutritions
router.get("/all", async (req, res) => {
  try {
    // query
    const allNutritions = await nutritionSchema.find()

    if (allNutritions) {
      res.json({
        msg: "success",
        nutrition_count: allNutritions.length,
        nutritions: allNutritions,
      })
    }
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: "internal server error" })
  }
})

// delete nutritions
router.delete("/delete/:id", async (req, res) => {
  try {
    // get nutrition id
    const nutritionId = req.params.id

    // query
    const deleteNutrition = await nutritionSchema.findByIdAndDelete(nutritionId)

    if (deleteNutrition) {
      res.json({
        msg: "nutrition deleted successfully",
        deleted_nutrition: deleteNutrition,
      })
    }
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: "internal server error" })
  }
})

// update nutritions
router.put("/update/:id", async (req, res) => {
  try {
    // get nutrition id
    const nutritionId = req.params.id

    // taking creds
    const { food, time_of_day, category } = req.body

    // query
    const updateNutrition = await nutritionSchema.updateOne(
      { _id: nutritionId },
      { $set: { food, time_of_day, category, dateUpdated: new Date() } }
    )

    const nutrition = await nutritionSchema.find({ _id: nutritionId })

    if (updateNutrition) {
      res.json({
        msg: "nutrition updated successfully",
        updated_nutrition: nutrition,
      })
    }
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: "internal server error" })
  }
})

// Delete a nutrition entry by ID
router.delete("/delete/:id", async (req, res) => {
  try {
    // Nutrition ID from request parameters
    const nutritionId = req.params.id

    if (!nutritionId) {
      res.status(404).json({ msg: "nutrition not found" })
    }

    // Find and delete the nutrition entry by ID
    const deletedNutrition = await nutritionSchema.findByIdAndDelete(
      nutritionId
    )

    if (deletedNutrition) {
      res.json({
        msg: "nutrition deleted successfully",
        deleted_nutrition: deletedNutrition,
      })
    } else {
      res.status(404).json({ msg: "nutrition not found" })
    }
  } catch (err) {
    console.error(err)
    res.status(500).json({ msg: "Internal server error" })
  }
})

// get all nutritions based on  center id
router.get("/all/center/:id", async (req, res) => {
  try {
    // creds
    const centerId = req.params.id

    // query
    const admin = await nutritionSchema.find({
      center_id: centerId,
      creator_type: "center",
    })

    if (admin) {
      res.json({
        msg: "success",
        nutrition_count: admin.length,
        admin,
      })
    } else {
      res.json({ msg: "nutritions not found" })
    }
  } catch (err) {
    console.error(err)
    res.status(500).json({ msg: "Internal server error" })
  }
})

// afilliate trainer nutritions
router.get("/trainer-nutritions/:id", async (req, res) => {
  try {
    const centerId = req.params.id

    if (!mongoose.Types.ObjectId.isValid(centerId)) {
      return res.status(400).json({ msg: "center id not valid" })
    }

    const trainer = await nutritionSchema.aggregate([
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

// get all approved nutritions based on trainer center id
router.get("/trainer/approved/:id", async (req, res) => {
  try {
    // creds
    const trainerId = req.params.id

    if (!mongoose.Types.ObjectId.isValid(trainerId)) {
      return res.status.json({ msg: "tainer id not valid" })
    }

    // get trainer id and approved sessions
    const approved_nutrition = await nutritionSchema.find({
      trainer_id: trainerId,
      isApproved: true,
    })

    return approved_nutrition
      ? res.status(200).json({ msg: "success", approved_nutrition })
      : res
          .status(404)
          .json({ msg: "failed to get trainer approved nutrition" })
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: "internal server error" })
  }
})

// get all pending nutritions based on trainer center id
router.get("/trainer/pending/:id", async (req, res) => {
  try {
    // creds
    const trainerId = req.params.id

    // query
    const pending_nutrition = await nutritionSchema.find({
      trainer_id: trainerId,
      isApproved: false,
    })

    if (pending_nutrition) {
      res.json({
        msg: "success",
        nutrition_count: pending_nutrition.length,
        pending_nutrition,
      })
    } else {
      res.json({ msg: "nutritions not found" })
    }
  } catch (err) {
    console.error(err)
    res.status(500).json({ msg: "Internal server error" })
  }
})

// approve nutrition
router.put("/approve/:id", async (req, res) => {
  try {
    const nutritionId = req.params.id

    if (!mongoose.Types.ObjectId.isValid(nutritionId)) {
      return res.status.json({ msg: "tainer id not valid" })
    }

    const approve_nutrition = await nutritionSchema.updateOne(
      { _id: nutritionId },
      {
        $set: {
          isApproved: true,
        },
      }
    )

    if (approve_nutrition.modifiedCount === 1) {
      res
        .status(200)
        .json({ msg: "nutrition approved successfully", approve_nutrition })
    } else {
      res.status(404).json({ msg: "nutrition already approved" })
    }
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: "Internal server error" })
  }
})

// disapprove article
router.put("/disapprove/:id", async (req, res) => {
  try {
    const nutritionId = req.params.id

    if (!mongoose.Types.ObjectId.isValid(nutritionId)) {
      return res.status.json({ msg: "tainer id not valid" })
    }

    const disapprove_nutrition = await nutritionSchema.updateOne(
      { _id: nutritionId },
      {
        $set: {
          isApproved: false,
        },
      }
    )

    if (disapprove_nutrition.modifiedCount === 1) {
      res.status(200).json({
        msg: "nutrition disapproved successfully",
        disapprove_nutrition,
      })
    } else {
      res.status(404).json({ msg: "nutrition already disapproved" })
    }
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: "Internal server error" })
  }
})

module.exports = router
