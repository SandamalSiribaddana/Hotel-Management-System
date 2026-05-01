const express = require("express");
const router = express.Router();
const roomController = require("../controllers/roomController");

// Test route
router.get("/test", (req, res) => {
  res.json({ message: "ROOM ROUTE WORKING" });
});

// CRUD routes
router.post("/", roomController.createRoom);
router.get("/", roomController.getAllRooms);
router.get("/:id", roomController.getSingleRoom);
router.put("/:id", roomController.updateRoom);
router.delete("/:id", roomController.deleteRoom);

module.exports = router;