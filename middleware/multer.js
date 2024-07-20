// const multer = require("multer");

// // specify storage
// const storage = multer.diskStorage({
//   filename: function (req, file, cb) {
//     cb(null, file.originalname);
//   },
// });

// const upload = multer({
//   storage: storage,
// });

// module.exports = upload;

const multer = require("multer")

//file type
const fileType = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true)
  } else {
    cb(new Error("only images are accepted"), false)
  }
}

// storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "images")
  },

  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname)
  },
})

// upload
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2024 * 2024 * 4,
  },
  fileFilter: fileType,
})

// exports
module.exports = upload
