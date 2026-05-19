import mongoose from 'mongoose';

// Define BookingStatus enum values
const BookingStatus = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      index: true,
    },
    car: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Car',
      required: [true, 'Car is required'],
      index: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
      validate: {
        validator: function (value) {
          return value > this.startDate;
        },
        message: 'End date must be after start date',
      },
    },
    totalPrice: {
      type: Number,
      required: [true, 'Total price is required'],
      min: [0, 'Total price cannot be negative'],
    },
    status: {
      type: String,
      enum: Object.values(BookingStatus),
      default: BookingStatus.PENDING,
      index: true,
    },
    cancellationReason: {
      type: String,
      maxlength: [500, 'Cancellation reason cannot exceed 500 characters'],
    },
    confirmedAt: { type: Date },
    startedAt: { type: Date },
    completedAt: { type: Date },
    cancelledAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret.__v;
        return ret;
      },
    },
  },
);

// Compound indexes for efficient querying
bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ car: 1, startDate: 1, endDate: 1 });
bookingSchema.index({ status: 1, startDate: 1 });
bookingSchema.index({ startDate: 1, endDate: 1 });

// Check for overlapping bookings
bookingSchema.methods.isOverlapping = async function (start, end) {
  const overlapping = await mongoose.model('Booking').findOne({
    car: this.car,
    status: { $in: [BookingStatus.CONFIRMED, BookingStatus.IN_PROGRESS] },
    _id: { $ne: this._id }, // Exclude current booking when updating
    $or: [
      {
        startDate: { $lt: end },
        endDate: { $gt: start },
      },
      {
        startDate: { $gte: start, $lt: end },
      },
      {
        endDate: { $gt: start, $lte: end },
      },
    ],
  });

  return !!overlapping;
};

// Static method to find available cars for date range
bookingSchema.statics.findAvailableCars = async function (startDate, endDate) {
  const bookedCarIds = await this.distinct('car', {
    status: { $in: [BookingStatus.CONFIRMED, BookingStatus.IN_PROGRESS] },
    $or: [
      {
        startDate: { $lt: endDate },
        endDate: { $gt: startDate },
      },
    ],
  });

  return bookedCarIds;
};

// Pre-save middleware to validate no overlap
bookingSchema.pre('save', async function (next) {
  // Only check when dates actually changed
  if (!this.isModified('startDate') && !this.isModified('endDate')) return;

  const isOverlapping = await this.isOverlapping(this.startDate, this.endDate);
  if (isOverlapping)
    return next(new Error('Booking dates overlap with an existing booking'));
});

// Pre-update middleware for findOneAndUpdate
bookingSchema.pre('findOneAndUpdate', async function () {
  const update = this.getUpdate();

  if (update.startDate || update.endDate || update.car) {
    const doc = await this.model.findOne(this.getQuery());

    if (doc) {
      const isOverlapping = await doc.isOverlapping(
        update.startDate || doc.startDate,
        update.endDate || doc.endDate,
      );

      if (isOverlapping) {
        throw new Error('Booking dates overlap with an existing booking');
      }
    }
  }
});

// Create the model
export const Booking = mongoose.model('Booking', bookingSchema);
