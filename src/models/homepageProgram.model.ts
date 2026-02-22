import mongoose from "mongoose";

const homepageProgramSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["CONCERT", "VESPERS", "PROGRAM", "ANNOUNCEMENT"],
      default: "PROGRAM",
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    imageUrl: { type: String },
    videoUrl: { type: String },
    showOnHomepage: { type: Boolean, default: true },
    isPopup: { type: Boolean, default: false },
    popupTitle: { type: String, trim: true },
    popupMessage: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    startDate: { type: Date },
    endDate: { type: Date },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

homepageProgramSchema.index({
  showOnHomepage: 1,
  isActive: 1,
  startDate: 1,
  endDate: 1,
});

export const HomepageProgram = mongoose.model(
  "HomepageProgram",
  homepageProgramSchema,
);

