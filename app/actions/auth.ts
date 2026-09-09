// app/actions/auth.ts
"use server"

import { connectToDatabase } from "@/lib/mongodb"
import User from "@/models/User"
import bcrypt from "bcryptjs"

export async function handleSignup(formData: FormData) {
  try {
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    if (!name || !email || !password) {
      return { success: false, message: "Please fill in all fields." }
    }

    await connectToDatabase()

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return { success: false, message: "An account with this email already exists." }
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await User.create({
      name,
      email,
      password: hashedPassword,
    })

    return { success: true, message: "Account created successfully!" }
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to create account." }
  }
}

export async function handleSignin(formData: FormData) {
  try {
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    if (!email || !password) {
      return { success: false, message: "Please enter your email and password." }
    }

    await connectToDatabase()

    // Query user and include hidden password field
    const user = await User.findOne({ email }).select("+password")
    if (!user) {
      return { success: false, message: "Invalid email or password." }
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return { success: false, message: "Invalid email or password." }
    }

    return {
      success: true,
      message: `Welcome back, ${user.name}!`,
      user: { id: user._id.toString(), name: user.name, email: user.email },
    }
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to sign in." }
  }
}