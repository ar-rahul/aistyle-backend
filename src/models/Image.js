import mongoose from "mongoose";

const ImageSchema = new mongoose.Schema(
  {
    imageUrl: {
      type: String,
      required: true
    },

    storagePath: {
      type: String,
      required: true
    },

    hash: {
      type: String,
      required: true,
      unique: true,
      index: true
    },

    /* ---------------------------
       AI Analysis Output
    ---------------------------- */
    analysis: {
      space_category: {
        type: String,
        enum: ["living", "bedroom"],
        required: true,
        index: true
      },
      movement: {
        type: String
      },

      family: {
        type: String
      },

      variant: {
        type: String
      },

      color_keywords: {
        type: [String],
        default: []
      },

      design_philosophy: {
        type: String
      },

      visual_features: {
        type: [String],
        default: []
      },

      confidence: {
        type: String,
        enum: ["low", "medium", "high"]
      },

      notes: {
        type: String
      }
    },

    /* ---------------------------
       Embeddings (AI-generated)
    ---------------------------- */
    embeddings: {
      variant: {
        type: [Number],     // embedding vector
        default: null
      },

      colors: {
        type: [[Number]],   // array of embeddings
        default: []
      },

      philosophy: {
        type: [Number],     // embedding vector
        default: null
      }
    },

    analyzed: {
      type: Boolean,
      default: false
    },

    isVisible: {
      type: Boolean,
      default: true,
      index: true
    },

    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: false
  }
);

export default mongoose.model("Image", ImageSchema);
