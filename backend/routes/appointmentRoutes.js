
const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const Appointment = require("../models/Appointment");
const authMiddleware = require("../middleware/authMiddleware");

// CREATE APPOINTMENT
router.post("/", authMiddleware, async (req, res) => {
  try {
    const {
      patientName,
      doctorName,
      appointmentDate,
      reason,
    } = req.body;

    if (
      !patientName?.trim() ||
      !doctorName?.trim() ||
      !appointmentDate ||
      !reason?.trim()
    ) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const parsedDate = new Date(appointmentDate);

    if (Number.isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        message: "Invalid appointment date",
      });
    }

    const appointment = new Appointment({
      patientName,
      doctorName,
      appointmentDate: parsedDate,
      reason,
      authorId: req.user.userId,
    });

    await appointment.save();

    res.status(201).json({
      message: "Appointment created successfully",
      appointment,
    });
  } catch (error) {
    console.error("Appointment creation error:", error);

    res.status(500).json({
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
      appointments,
    });
  } catch (error) {
    console.error("Fetch appointments error:", error);

    res.status(500).json({
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
        message: "Invalid appointment ID",
      });
    }

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found",
      });
    }

    if (
      String(appointment.authorId) !== String(req.user.userId)
    ) {
      return res.status(403).json({
        message: "Forbidden. You do not own this appointment.",
      });
    }

    res.status(200).json({
      message: "Appointment fetched successfully",
      appointment,
    });
  } catch (error) {
    console.error("Fetch appointment error:", error);

    res.status(500).json({
      message: "Failed to fetch appointment",
    });
  }
});


// UPDATE APPOINTMENT
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid appointment ID",
      });
    }

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found",
      });
    }

    if (
      String(appointment.authorId) !== String(req.user.userId)
    ) {
      return res.status(403).json({
        message: "Forbidden. You do not own this appointment.",
      });
    }

    const { patientName, doctorName, appointmentDate, reason, status } = req.body;

    const updates = {};

    if (patientName !== undefined) {
      if (typeof patientName !== "string" || !patientName.trim()) {
        return res.status(400).json({ message: "Invalid patient name" });
      }
      updates.patientName = patientName.trim();
    }

    if (doctorName !== undefined) {
      if (typeof doctorName !== "string" || !doctorName.trim()) {
        return res.status(400).json({ message: "Invalid doctor name" });
      }
      updates.doctorName = doctorName.trim();
    }

    if (appointmentDate !== undefined) {
      const parsedDate = new Date(appointmentDate);

      if (Number.isNaN(parsedDate.getTime())) {
        return res.status(400).json({
          message: "Invalid appointment date",
        });
      }

      updates.appointmentDate = parsedDate;
    }

    if (reason !== undefined) {
      if (typeof reason !== "string" || !reason.trim()) {
        return res.status(400).json({ message: "Invalid reason" });
      }
      updates.reason = reason.trim();
    }

    if (status !== undefined) {
      if (!["Scheduled", "Completed", "Cancelled"].includes(status)) {
        return res.status(400).json({
          message: "Invalid appointment status",
        });
      }
      updates.status = status;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: "No valid fields provided for update",
      });
    }

    Object.assign(appointment, updates);

    await appointment.save();

    res.status(200).json({
      message: "Appointment updated successfully",
      appointment,
    });
  } catch (error) {
    console.error("Update appointment error:", error);

    res.status(500).json({
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
        message: "Invalid appointment ID",
      });
    }

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found",
      });
    }

    if (
      String(appointment.authorId) !== String(req.user.userId)
    ) {
      return res.status(403).json({
        message: "Forbidden. You do not own this appointment.",
      });
    }

    await appointment.deleteOne();

    res.status(200).json({
      message: "Appointment deleted successfully",
    });
  } catch (error) {
    console.error("Delete appointment error:", error);

    res.status(500).json({
      message: "Failed to delete appointment",
    });
  }
});

module.exports = router;
