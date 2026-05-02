const express = require("express");
const router = express.Router();
const roomController = require("../controllers/roomController");
const upload = require("../middleware/upload");

// Test route
router.get("/test", (req, res) => {
  res.json({ message: "ROOM ROUTE WORKING" });
});

// CRUD routes
router.post("/", upload.single("image"), roomController.createRoom);
router.get("/", roomController.getAllRooms);
router.get("/:id", roomController.getSingleRoom);
router.put("/:id", upload.single("image"), roomController.updateRoom);
router.delete("/:id", roomController.deleteRoom);

module.exports = router;