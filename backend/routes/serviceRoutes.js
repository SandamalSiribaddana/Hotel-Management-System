const express = require("express");
const router = express.Router();

const uploadService = require("../middleware/uploadService");

const {
  createService,
  getAllServices,
  getSingleService,
  updateService,
  deleteService,
} = require("../controllers/serviceController");


// TEST route
router.get("/test", (req, res) => {
  res.json({ message: "SERVICE ROUTE WORKING" });
});


// CRUD routes
router.post("/", uploadService.single("image"), createService);

router.get("/", getAllServices);

router.get("/:id", getSingleService);

router.put("/:id", uploadService.single("image"), updateService);

router.delete("/:id", deleteService);


module.exports = router;