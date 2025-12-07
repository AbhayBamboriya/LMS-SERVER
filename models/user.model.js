import mongoose, { Schema, Model } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const userSchema = new Schema(
  {
    fullName: {
      type: String,
      required: [true, "Name is Required"],
      minLength: [1, "Name must be at least 5 characters"],
      maxLength: [50, "Name must contain less than 50 characters"],
      lowercase: true,
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      unique: true,
    },

    password: {
      type: String,
      required: [true, "Password is Required"],
      minLength: [3, "Password must contain at least 5 characters"],
      select: false,
    },

    avatar: {
      public_id: { type: String },
      secure_url: { type: String },
    },

    role: {
      type: String,
      enum: ["USER", "ADMIN"],
      default: "USER",
    },

    forgotPasswordToken: String,
    forgotPasswordExpiry: Date,

    subscription: {
      id: { type: String },
      status: { type: String },
    },

    // ✅ New field: stores active course subscriptions (array of course IDs)
    activeSubscriptions: {
      type: [String], // Array of course IDs
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Encrypt password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Methods
userSchema.methods = {
  // import jwt from "jsonwebtoken";

isTokenExpired:async function(token) {
  try {
    jwt.verify(token, process.env.JWT_SECRET); 
    return false; // token is valid (NOT EXPIRED)
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return true; // token is EXPIRED
    }
    return true; // other error = treat as expired
  }
},

  generateJWTToken: async function () {
    return jwt.sign(
      {
        id: this._id,
        email: this.email,
        subscription: this.subscription,
        role: this.role,
        activeSubscriptions: this.activeSubscriptions,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY }
    );
  },

  comparePassword: async function (plaintextPassword) {
    return bcrypt.compare(plaintextPassword, this.password);
  },

  generatePasswordResetToken: async function () {
    const resetToken = crypto.randomBytes(20).toString("hex");

    this.forgotPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    this.forgotPasswordExpiry = Date.now() + 15 * 60 * 1000;

    return resetToken;
  },

  // ✅ Helper to add a new course subscription
  addActiveSubscription: async function (courseId) {
    if (!this.activeSubscriptions.includes(courseId)) {
      this.activeSubscriptions.push(courseId);
      await this.save();
    }
  },
};

const User = mongoose.model("User2", userSchema);
export default User;
