import { z } from 'zod'


export const usernameValidation = z
    .string()
    .min(2, "username must be at least 2 characters")
    .max(10, "username must be no more than 10 characters");

export const signUpSchemeValidation = z.object({
    username: usernameValidation,
    email: z.string().email({message: "Invalid email address"}),
    password: z.string().min(4, {message:"Password must be atleast 6 characters"}).max(10),
})