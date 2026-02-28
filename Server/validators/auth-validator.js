const { z } = require("zod");

const signup = z.object({
  fullName: z
    .string({ required_error: "Full name is required" })
    .trim()
    .min(3, { message: "Full name must be at least 3 characters long" })
    .max(50, { message: "Full name must be at most 50 characters long" }),

  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .email({ message: "Invalid email format" }),

  password: z
    .string({ required_error: "Password is required" })
    .trim()
    .min(8, { message: "Password must be at least 8 characters long" })
    .max(20, { message: "Password must be at most 20 characters long" }),
});

const Login = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .email({ message: "Invalid email format" }),

  password: z
    .string({ required_error: "Password is required" })
    .trim()
    .min(8, { message: "Password must be at least 8 characters long" })
    .max(20, { message: "Password must be at most 20 characters long" }),
});

module.exports = { signup, Login };
