// app/actions/test-db.ts
"use server"

import { connectToDatabase } from "@/lib/mongodb"
import mongoose from "mongoose"

export async function testMongoConnection() {
  try {
    await connectToDatabase()

    // Define a temporary model for testing
    const TestModel =
      mongoose.models.Test ||
      mongoose.model(
        "Test",
        new mongoose.Schema({
          name: String,
          createdAt: { type: Date, default: Date.now },
        })
      )

    // Insert a document to force MongoDB to create the database/collection
    const testDoc = await TestModel.create({
      name: "Connection Test Successful",
    })

    return {
      success: true,
      message: `Successfully connected to MongoDB Atlas! Saved document ID: ${testDoc._id.toString()}`,
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Connection error occurred.",
    }
  }
}