import mongoose from "mongoose";

const SurveyResultSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },

    report: {
      primaryVariant: String,
      secondaryVariants: [String],
      dominance: String,
      colors: [String]
    },

    meta: {
      imagesSeen: Number,
      rounds: Number
    }
  },
  {
    timestamps: true // adds createdAt, updatedAt
  }
);

export default mongoose.model("SurveyResult", SurveyResultSchema);
