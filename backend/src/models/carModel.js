import mongoose, { Schema } from 'mongoose';

// Define TransmissionType enum values
const TransmissionType = {
  MANUAL: 'manual',
  AUTOMATIC: 'automatic',
  SEMI_AUTOMATIC: 'semi_automatic',
  CVT: 'cvt',
};

// Define FuelType enum values
const FuelType = {
  PETROL: 'petrol',
  DIESEL: 'diesel',
  ELECTRIC: 'electric',
  HYBRID: 'hybrid',
  PLUGIN_HYBRID: 'plugin_hybrid',
};

const imageSchema = new mongoose.Schema({
  url: String,
  public_id: String,
});

const carSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Car name is required'],
      trim: true,
      maxlength: [100, 'Car name cannot exceed 100 characters'],
    },
    brand: {
      type: String,
      required: [true, 'Brand is required'],
      trim: true,
      index: true,
    },
    carModel: {
      type: String,
      required: [true, 'Model is required'],
      trim: true,
    },
    year: {
      type: Number,
      required: [true, 'Year is required'],
      min: [2000, 'Year must be 2000 or later'],
      max: [new Date().getFullYear() + 1, 'Year cannot be in the future'],
    },
    seats: {
      type: Number,
      required: [true, 'Number of seats is required'],
      min: [2, 'Car must have at least 2 seats'],
      max: [50, 'Car cannot have more than 50 seats'],
    },
    transmission: {
      type: String,
      enum: Object.values(TransmissionType),
      required: [true, 'Transmission type is required'],
    },
    fuelType: {
      type: String,
      enum: Object.values(FuelType),
      required: [true, 'Fuel type is required'],
    },
    pricePerDay: {
      type: Number,
      required: [true, 'Price per day is required'],
      min: [0, 'Price cannot be negative'],
    },
    images: {
      type: [imageSchema],
      required: [true, 'At least one image is required'],
      validate: {
        validator: function (v) {
          return v.length > 0;
        },
        message: 'At least one image is required',
      },
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    features: {
      type: [String],
      default: [],
    },
    availability: {
      type: Boolean,
      default: true,
      index: true,
    },
    licensePlate: {
      type: String,
      required: [true, 'License plate is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    mileage: {
      type: Number,
      min: [0, 'Mileage cannot be negative'],
    },
    color: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    numRatings: {
      type: Number,
      default: 0,
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
carSchema.index({ brand: 1, carModel: 1 });
carSchema.index({ pricePerDay: 1 });
carSchema.index({ brand: 1, availability: 1 });
carSchema.index({ transmission: 1, fuelType: 1 });

// Text search index
carSchema.index(
  {
    name: 'text',
    brand: 'text',
    carModel: 'text',
    description: 'text',
  },
  {
    weights: {
      name: 10,
      brand: 5,
      carModel: 5,
      description: 1,
    },
    name: 'car_text_index',
  },
);

// Check if car is available for given dates (virtual)
carSchema.virtual('isAvailableForDates').get(function () {
  return this.availability;
});

export const Car = mongoose.model('Car', carSchema);
