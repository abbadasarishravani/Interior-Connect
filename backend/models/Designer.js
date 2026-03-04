const mongoose = require('mongoose')

const designerSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    displayName: { type: String, required: true },
    location: String,
    styles: [String],
    spaces: [String],
    minBudget: Number,
    maxBudget: Number,
    startingPrice: String,
    description: String,
    rating: { type: Number, default: 0 },
    projects: { type: Number, default: 0 },
    badge: String,
    image: String,
    portfolioImages: [String],
    contactEmail: String,
    contactPhone: String,
    onlinePayments: { type: Boolean, default: true },
    offlineAvailable: { type: Boolean, default: true },
  },
  { timestamps: true },
)

module.exports = mongoose.model('Designer', designerSchema)

