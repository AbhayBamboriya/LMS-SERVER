// models/SubscriptionPlan.js
import mongoose from "mongoose";

const SubscriptionPlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  duration: {
    type: Number,  // number of days: e.g., 30 = 1 month
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true
  },
  razorpay_plan_id: {
    type: String,
    required: false
  }
}, { timestamps: true });

export default mongoose.model("SubscriptionPlan", SubscriptionPlanSchema);
