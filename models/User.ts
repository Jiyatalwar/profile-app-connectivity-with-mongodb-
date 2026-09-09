// models/User.ts
import mongoose, { Schema, model, models } from "mongoose"

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
    },
    company: {
      type: String,
      required: [true, "Company name is required"],
    },
    role: {
      type: String,
      required: [true, "Role is required"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
    },
  },
  { timestamps: true }
)

const User = models.User || model("User", UserSchema)

export default User
// // models/User.ts
// import mongoose, { Schema, model, models } from "mongoose"

// const UserSchema = new Schema(
//   {
//     name: { type: String, required: true },
//     email: { type: String, required: true, unique: true, lowercase: true, trim: true },
//     phone: { type: String, required: true },
//     company: { type: String, required: true },
//     role: { type: String, required: true },
//     password: { type: String, required: true, select: false },
//   },
//   { timestamps: true }
// )

// // Delete existing cached model to force Mongoose to register updated fields
// if (process.env.NODE_ENV === "development" && models.User) {
//   delete models.User
// }

// const User = models.User || model("User", UserSchema)

// export default User8