import mongoose from "mongoose";

const SurveyResultSchema = new mongoose.Schema(
  {
    name: { type: String },

    report: {
      raw: {
        type: mongoose.Schema.Types.Mixed,
        required: true
      },

      summary: {
        primaryMovement: String,

        variants: [
          {
            name: String,
            score: Number,
            confidence: Number,
            seen: Number
          }
        ],

        colors: [
          {
            name: String,
            count: Number
          }
        ],

        philosophy: [
          {
            text: String,
            weight: Number
          }
        ],

        imagesSeen: Number,
        roundsCompleted: Number
      }
    },

    meta: {
      imagesSeen: Number,
      rounds: Number,
      completedAt: Date
    }
  },
  { timestamps: true }
);

export default mongoose.model("SurveyResult", SurveyResultSchema);
