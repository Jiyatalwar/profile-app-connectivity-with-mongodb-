// app/actions/auth.ts
"use server"

import { connectToDatabase } from "@/lib/mongodb"
import User from "@/models/User"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"
import { SignJWT, jwtVerify } from "jose"

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-fallback-secret-key"
)

type SessionUser = {
  id: string
  name: string
  email: string
  role: "user" | "superuser"
}

async function createSession(user: SessionUser) {
  const token = await new SignJWT(user)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(JWT_SECRET)

  const cookieStore = await cookies()
  cookieStore.set("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  })
}

export async function handleSignup(formData: FormData) {
  try {
    const name = formData.get("name") as string
    const email = (formData.get("email") as string).trim().toLowerCase()
    const phone = formData.get("phone") as string
    const password = formData.get("password") as string

    if (!name || !email || !phone || !password) {
      return { success: false, message: "Please fill in all required fields." }
    }

    await connectToDatabase()

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return { success: false, message: "An account with this email already exists." }
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = await User.create({
      name,
      email,
      phone,
      role:
        process.env.SUPERUSER_EMAIL?.trim().toLowerCase() === email
          ? "superuser"
          : "user",
      password: hashedPassword,
    })

    const userData = {
      id: newUser._id.toString(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    }

    await createSession(userData)

    return { success: true, message: "Account created successfully!", user: userData }
  } catch (error: unknown) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to create account.",
    }
  }
}

export async function handleSignin(formData: FormData) {
  try {
    const email = (formData.get("email") as string).trim().toLowerCase()
    const password = formData.get("password") as string

    if (!email || !password) {
      return { success: false, message: "Please enter your email and password." }
    }

    await connectToDatabase()

    const user = await User.findOne({ email }).select("+password")
    if (!user) {
      return { success: false, message: "Invalid email or password." }
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return { success: false, message: "Invalid email or password." }
    }

    const userData = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role || "user",
    }
    await createSession(userData)

    return {
      success: true,
      message: `Welcome back, ${user.name}!`,
      user: userData,
    }
  } catch (error: unknown) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to sign in.",
    }
  }
}

export async function getSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth_token")?.value

  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as SessionUser
  } catch {
    return null
  }
}

export async function handleLogout() {
  const cookieStore = await cookies()
  cookieStore.delete("auth_token")
}

async function requireSuperuser() {
  const session = await getSession()

  if (!session || session.role !== "superuser") {
    throw new Error("Superuser access required")
  }

  return session
}

export async function getAdminUsers() {
  const session = await requireSuperuser()
  await connectToDatabase()

  const users = await User.find({})
    .select("name email phone role createdAt")
    .sort({ createdAt: -1 })
    .lean()

  return users.map((user) => ({
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role || "user",
    createdAt: user.createdAt.toISOString(),
    isCurrentUser: user._id.toString() === session.id,
  }))
}

export async function updateUserRole(userId: string, role: "user" | "superuser") {
  const session = await requireSuperuser()

  if (userId === session.id) {
    return { success: false, message: "You cannot change your own role." }
  }

  await connectToDatabase()
  const user = await User.findByIdAndUpdate(userId, { role }, { new: true })

  if (!user) return { success: false, message: "User not found." }

  return { success: true, message: "User role updated." }
}

export async function deleteUser(userId: string) {
  const session = await requireSuperuser()

  if (userId === session.id) {
    return { success: false, message: "You cannot delete your own account." }
  }

  await connectToDatabase()
  const result = await User.deleteOne({ _id: userId })

  return result.deletedCount === 1
    ? { success: true, message: "User deleted." }
    : { success: false, message: "User not found." }
}