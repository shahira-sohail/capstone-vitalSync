const { z } = require("zod");

// CREATE APPOINTMENT
const createAppointmentSchema = z.object({
    patientName: z.string().trim().min(1, "Patient name is required"),

    doctorName: z.string().trim().min(1, "Doctor name is required"),

    appointmentDate: z.coerce.date(),

    reason: z.string().trim().min(1, "Reason is required"),
}).strict();


// UPDATE APPOINTMENT
const updateAppointmentSchema = z.object({
    patientName: z.string().trim().min(1).optional(),

    doctorName: z.string().trim().min(1).optional(),

    appointmentDate: z.coerce.date().optional(),

    reason: z.string().trim().min(1).optional(),

    status: z.enum(["Scheduled", "Completed", "Cancelled"]).optional(),
})
.strict()
.refine(
    (data) => Object.keys(data).length > 0,
    "At least one field is required for update"
);


module.exports = {
    createAppointmentSchema,
    updateAppointmentSchema,
};