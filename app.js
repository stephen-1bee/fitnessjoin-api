// imports
const express = require("express")
const cors = require("cors")
const dotenv = require("dotenv")
const bodyParser = require("body-parser")
const morgan = require("morgan")
const multer = require("multer")
const app = express()
const conn = require("./utils/db")

// const path = require("path")

// configs
app.use(cors({ origin: "*" }))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(morgan("dev"))
dotenv.config()
app.use(express.static(`${__dirname}/images`))

// route imports
const adminRoute = require("./routes/adminRoute")
const trainerRoute = require("./routes/trainerRoute")
const sessionRoute = require("./routes/sessionRoute")
const membershipRoute = require("./routes/membershipRoute")
const nutritionRoute = require("./routes/nutritionRoute")
const superAdminRoute = require("./routes/superAdminRoute")
const userRoute = require("./routes/userRoute")
const articleRoute = require("./routes/articleRoute")
const dashboardRoute = require("./routes/dashboardRoute")
const feedbackRoute = require("./routes/feedbackRoute")
const notificationRoute = require("./routes/notificationRoute")
const contactUsRoute = require("./routes/contactUsRoute")
const activityRoute = require("./routes/activityRoute")
const ratingRoute = require("./routes/rateRoute")
const trainerDashboard = require("./routes/trainerDashboard")
const sessionActivityRoute = require("./routes/sessionActivity")

// db connction
conn()

// routes
app.use("/api/v1", adminRoute)
app.use("/api/v1/admins", adminRoute)
app.use("/api/v1/trainers", trainerRoute)
app.use("/api/v1/sessions", sessionRoute)
app.use("/api/v1/memberships", membershipRoute)
app.use("/api/v1/nutritions", nutritionRoute)
app.use("/api/v1/superadmins", superAdminRoute)
app.use("/api/v1/users", userRoute)
app.use("/api/v1/articles", articleRoute)
app.use("/api/v1/dashboard", dashboardRoute)
app.use("/api/v1/feedbacks", feedbackRoute)
app.use("/api/v1/contactUs", contactUsRoute)
app.use("/api/v1/activities", activityRoute)
app.use("/api/v1/notifications", notificationRoute)
app.use("/api/v1/trainer-dashboard", trainerDashboard)
app.use("/api/v1/session-activity", sessionActivityRoute)
app.use("/api/v1/ratings", ratingRoute)

app.all("*", (req, res) => {
  res.status(404).json({
    msg: `Endpoint: ${req.originalUrl} is not defined yet`,
  })
})

// port
const PORT = process.env.PORT || 1000

// initialization
app.listen(PORT, console.log(`Listening on port ${PORT}`))
