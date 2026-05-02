const express = require("express");
const router = express.Router();
const roomController = require("../controllers/roomController");
const upload = require("../middleware/upload");

// Test route
router.get("/test", (req, res) => {
  res.json({ message: "ROOM ROUTE WORKING" });
});

// CRUD routes
router.post("/", upload.array("images", 5), roomController.createRoom);
router.get("/", roomController.getAllRooms);
router.get("/:id", roomController.getSingleRoom);
router.put("/:id", upload.array("images", 5), roomController.updateRoom);
router.delete("/:id", roomController.deleteRoom);

module.exports = router;