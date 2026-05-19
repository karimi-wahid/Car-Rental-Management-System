import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
      maxlength: [20, 'Phone cannot exceed 20 characters'],
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      enum: ['general', 'booking', 'complaint', 'partnership', 'other'],
      default: 'general',
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      maxlength: [2000, 'Message cannot exceed 2000 characters'],
    },
    status: {
      type: String,
      enum: ['unread', 'read', 'replied', 'closed'],
      default: 'unread',
      index: true,
    },
    adminReply: {
      type: String,
      trim: true,
      maxlength: [2000, 'Reply cannot exceed 2000 characters'],
    },
    adminRepliedAt: Date,
    repliedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // null = guest submission
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      default: null,
    },
    ipAddress: String,
    isSpam: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

contactSchema.index({ status: 1, createdAt: -1 });
contactSchema.index({ email: 1 });

const Contact = mongoose.model('Contact', contactSchema);
export default Contact;
