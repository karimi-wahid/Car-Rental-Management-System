import mongoose from 'mongoose';
import { Car } from './carModel.js';

const feedbackSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Feedback must belong to a user'],
      index: true,
    },
    car: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Car',
      required: [true, 'Feedback must belong to a car'],
      index: true,
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: [true, 'Feedback must be linked to a booking'],
      unique: true, // one review per booking
    },
    rating: {
      type: Number,
      required: [true, 'Please provide a rating'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    title: {
      type: String,
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    comment: {
      type: String,
      trim: true,
      required: [true, 'Please provide a comment'],
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    adminReply: {
      type: String,
      trim: true,
      maxlength: [500, 'Reply cannot exceed 500 characters'],
    },
    adminRepliedAt: Date,
    isVerifiedPurchase: {
      type: Boolean,
      default: true, // always true since we require a booking
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Compound index — one review per user per car
feedbackSchema.index({ user: 1, car: 1 }, { unique: true });

// Update car's average rating after save
feedbackSchema.statics.calcAverageRating = async function (carId) {
  const stats = await this.aggregate([
    { $match: { car: carId, status: 'approved' } },
    {
      $group: {
        _id: '$car',
        avgRating: { $avg: '$rating' },
        numRatings: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await Car.findByIdAndUpdate(carId, {
      averageRating: Math.round(stats[0].avgRating * 10) / 10,
      numRatings: stats[0].numRatings,
    });
  } else {
    await Car.findByIdAndUpdate(carId, {
      averageRating: 0,
      numRatings: 0,
    });
  }
};

feedbackSchema.post('save', function () {
  this.constructor.calcAverageRating(this.car);
});

feedbackSchema.post('findOneAndUpdate', async function (doc) {
  if (doc) await doc.constructor.calcAverageRating(doc.car);
});

const Feedback = mongoose.model('Feedback', feedbackSchema);
export default Feedback;
