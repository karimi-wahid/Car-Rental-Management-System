import Comment from '../models/commentModel.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import mongoose from 'mongoose';

// ===================== USER =====================

// Get top-level comments for a car + their replies
export const getCarComments = catchAsync(async (req, res, next) => {
  const { carId } = req.params;
  const { page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [comments, total] = await Promise.all([
    Comment.find({ car: carId, parent: null, status: 'approved' })
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit))
      .populate('user', 'name avatar')
      .populate({
        path: 'replies',
        match: { status: 'approved' },
        populate: { path: 'user', select: 'name avatar' },
        options: { sort: { createdAt: 1 }, limit: 5 },
      }),

    Comment.countDocuments({ car: carId, parent: null, status: 'approved' }),
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      comments,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    },
  });
});

// Get replies for a specific comment
export const getCommentReplies = catchAsync(async (req, res, next) => {
  const { commentId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [replies, total] = await Promise.all([
    Comment.find({ parent: commentId, status: 'approved' })
      .sort('createdAt')
      .skip(skip)
      .limit(parseInt(limit))
      .populate('user', 'name avatar'),

    Comment.countDocuments({ parent: commentId, status: 'approved' }),
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      replies,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    },
  });
});

// Post a comment or reply
export const createComment = catchAsync(async (req, res, next) => {
  const { carId, content, parentId } = req.body;

  // If replying, verify parent exists and belongs to the same car
  if (parentId) {
    const parent = await Comment.findOne({ _id: parentId, car: carId });
    if (!parent) {
      return next(new AppError('Parent comment not found.', 404));
    }
    // Only allow one level of nesting
    if (parent.parent) {
      return next(new AppError('Replies to replies are not allowed.', 400));
    }
  }

  const comment = await Comment.create({
    user: req.user.id,
    car: carId,
    content,
    parent: parentId || null,
  });

  await comment.populate('user', 'name avatar');

  res.status(201).json({
    status: 'success',
    data: { comment },
  });
});

// Edit own comment
export const updateComment = catchAsync(async (req, res, next) => {
  const { content } = req.body;

  const comment = await Comment.findOne({
    _id: req.params.id,
    user: req.user.id,
  });

  if (!comment) {
    return next(new AppError('No comment found with that ID.', 404));
  }

  if (comment.status === 'approved') {
    return next(new AppError('Approved comments cannot be edited.', 400));
  }

  comment.content = content;
  comment.isEdited = true;
  comment.status = 'pending'; // re-queue for approval
  await comment.save();

  res.status(200).json({
    status: 'success',
    data: { comment },
  });
});

// Delete own comment
export const deleteComment = catchAsync(async (req, res, next) => {
  const comment = await Comment.findOne({
    _id: req.params.id,
    user: req.user.id,
  });

  if (!comment) {
    return next(new AppError('No comment found with that ID.', 404));
  }

  // Delete comment and all its replies
  await Promise.all([
    Comment.findByIdAndDelete(req.params.id),
    Comment.deleteMany({ parent: req.params.id }),
  ]);

  res.status(204).json({ status: 'success', data: null });
});

// Toggle like on a comment
export const toggleLike = catchAsync(async (req, res, next) => {
  const comment = await Comment.findById(req.params.id);

  if (!comment) {
    return next(new AppError('No comment found with that ID.', 404));
  }

  const userId = new mongoose.Types.ObjectId(req.user.id);
  const alreadyLiked = comment.likes.some((id) => id.equals(userId));

  if (alreadyLiked) {
    comment.likes = comment.likes.filter((id) => !id.equals(userId));
  } else {
    comment.likes.push(userId);
  }

  await comment.save();

  res.status(200).json({
    status: 'success',
    data: {
      liked: !alreadyLiked,
      likeCount: comment.likes.length,
    },
  });
});

// Get current user's comments
export const getMyComments = catchAsync(async (req, res, next) => {
  const comments = await Comment.find({ user: req.user.id })
    .sort('-createdAt')
    .populate('car', 'name brand images');

  res.status(200).json({
    status: 'success',
    results: comments.length,
    data: { comments },
  });
});

// ===================== ADMIN =====================

export const getAllComments = catchAsync(async (req, res, next) => {
  const { status, page = 1, limit = 20, sort = '-createdAt' } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const filter = {};
  if (status) filter.status = status;

  const [comments, total] = await Promise.all([
    Comment.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('user', 'name email avatar')
      .populate('car', 'name brand')
      .populate('parent', 'content'),

    Comment.countDocuments(filter),
  ]);

  console.log('COmments', comments);

  res.status(200).json({
    status: 'success',
    data: {
      comments,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    },
  });
});

export const moderateComment = catchAsync(async (req, res, next) => {
  const { status } = req.body;

  if (!['approved', 'rejected'].includes(status)) {
    return next(new AppError('Status must be approved or rejected.', 400));
  }

  const comment = await Comment.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true },
  ).populate('user', 'name email');

  if (!comment) {
    return next(new AppError('No comment found with that ID.', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { comment },
  });
});

export const adminDeleteComment = catchAsync(async (req, res, next) => {
  const comment = await Comment.findById(req.params.id);

  if (!comment) {
    return next(new AppError('No comment found with that ID.', 404));
  }

  await Promise.all([
    Comment.findByIdAndDelete(req.params.id),
    Comment.deleteMany({ parent: req.params.id }),
  ]);

  res.status(204).json({ status: 'success', data: null });
});

export const replyToComment = catchAsync(async (req, res, next) => {
  const { reply } = req.body;

  if (!reply?.trim()) {
    return next(new AppError('Please provide a reply.', 400));
  }

  const comment = await Comment.findByIdAndUpdate(
    req.params.id,
    { adminReply: reply, adminRepliedAt: new Date() },
    { new: true },
  ).populate('user', 'name avatar');

  if (!comment) {
    return next(new AppError('No comment found with that ID.', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { comment },
  });
});
