
const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const Appointment = require("../models/Appointment");
const authMiddleware = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");

const {
  createAppointmentSchema,
  updateAppointmentSchema,
} = require("../validators/appointmentValidator");

// CREATE APPOINTMENT
router.post( "/", authMiddleware, validateRequest(createAppointmentSchema), async (req, res) => {
  try {
    const {
      patientName,
      doctorName,
      appointmentDate,
      reason,
    } = req.body;

    const appointment = new Appointment({
      patientName,
      doctorName,
      appointmentDate,
      reason,
      authorId: req.user.userId,
    });

    await appointment.save();

    res.status(201).json({
      success: true,
      message: "Appointment created successfully",
      appointment,
    });
  } catch (error) {
    console.error("Appointment creation error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create appointment",
    });
  }
});


// READ ALL APPOINTMENTS OF LOGGED-IN USER
router.get("/", authMiddleware, async (req, res) => {
  try {
    const appointments = await Appointment.find({
      authorId: req.user.userId,
    }).sort({ appointmentDate: 1 });

    res.status(200).json({
      message: "Appointments fetched successfully",
      success: true,
      appointments,
    });
  } catch (error) {
    console.error("Fetch appointments error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch appointments",
    });
  }
});


// READ ONE APPOINTMENT
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment ID",
      });
    }

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    if (
      String(appointment.authorId) !== String(req.user.userId)
    ) {
      return res.status(403).json({
        success: false,
        message: "Forbidden. You do not own this appointment.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Appointment fetched successfully",
      appointment,
    });
  } catch (error) {
    console.error("Fetch appointment error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch appointment",
    });
  }
});


// UPDATE APPOINTMENT
router.put("/:id", authMiddleware, validateRequest(updateAppointmentSchema), async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment ID",
      });
    }

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    if (
      String(appointment.authorId) !== String(req.user.userId)
    ) {
      return res.status(403).json({
        success: false,
        message: "Forbidden. You do not own this appointment.",
      });
    }

    const { patientName, doctorName, appointmentDate, reason, status } = req.body;

    const updates = req.body;

    Object.assign(appointment, updates);

    await appointment.save();

    res.status(200).json({
      success: true,
      message: "Appointment updated successfully",
      appointment,
    });
  } catch (error) {
    console.error("Update appointment error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update appointment",
    });
  }
});


// DELETE APPOINTMENT
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment ID",
      });
    }

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    if (
      String(appointment.authorId) !== String(req.user.userId)
    ) {
      return res.status(403).json({
        success: false,
        message: "Forbidden. You do not own this appointment.",
      });
    }

    await appointment.deleteOne();

    res.status(200).json({
      success: true,
      message: "Appointment deleted successfully",
    });
  } catch (error) {
    console.error("Delete appointment error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete appointment",
    });
  }
});

module.exports = router;
