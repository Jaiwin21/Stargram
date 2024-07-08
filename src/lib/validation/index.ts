import * as z from "zod"

export const SignupValidation = z.object({
    name: z.string().min(2, {message: 'Name length insufficient.'}),
    username: z.string().min(2, {message: 'Username length insufficient.'}).max(50),
    email: z.string().email(),
    password: z.string().min(8, {message: 'Password must be at least 8 characters.'})
  })

  export const SigninValidation = z.object({
    email: z.string().email(),
    password: z.string().min(8, {message: 'Password must be at least 8 characters.'})
  })