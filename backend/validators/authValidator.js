const { z } = require("zod");

// REGISTER VALIDATION
const registerSchema = z.object({
    name: z.string().trim().min(1, "Name is required"),

    email: z.string().trim().email("Invalid email address"),

    password: z.string().min(8, "Password must be at least 8 characters"),
}).strict();


// LOGIN VALIDATION
const loginSchema = z.object({
    email: z.string().trim().email("Invalid email address"),

    password: z.string().min(1, "Password is required"),
}).strict();


module.exports = {
    registerSchema,
    loginSchema,
};