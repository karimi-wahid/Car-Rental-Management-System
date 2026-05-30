import User from '../models/userModel.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

export const getAllUsers = catchAsync(async (req, res) => {
  // Get all users, optionally exclude sensitive fields
  const users = await User.find().select('-password -__v +active');

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users,
    },
  });
});

export const getMe = catchAsync(async (req, res, next) => {
  // req.user is set by the protect middleware
  const user = await User.findById(req.user.id).select('-password');

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

export const updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user Posts password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. please use /updateMyPassword',
        400,
      ),
    );
  }

  // 2) Filtered out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObj(req.body, 'name', 'email');

  // 3) Update the user document
  const updatedUser = await User.findByIdAndUpdate(req.user._id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

export const deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

export const toggleUserActive = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id).select('+active');

  if (!user) {
    return next(new AppError('No user found with that ID.', 404));
  }

  // Prevent admin from deactivating themselves
  if (user._id.toString() === req.user.id) {
    return next(new AppError('You cannot deactivate your own account.', 400));
  }

  user.active = !user.active;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
    message: `User ${user.active ? 'activated' : 'deactivated'} successfully.`,
    data: {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        active: user.active,
      },
    },
  });
});

export const getUser = catchAsync(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    return res.status(404).json({
      status: 'fail',
      message: 'User not found with that ID',
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

export const createUser = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  // Remove password from output
  newUser.password = undefined;

  res.status(201).json({
    status: 'success',
    data: {
      user: newUser,
    },
  });
});

export const updateUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

export const deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, { active: false });

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

export const updateUserRole = catchAsync(async (req, res, next) => {
  // 1) Only admin can change roles
  if (req.user.role !== 'admin') {
    return next(new AppError('Only admins can update user roles', 403));
  }

  const { id } = req.params;
  const { role } = req.body;

  // 2) Validate role
  const allowedRoles = ['user', 'admin'];
  if (!role || !allowedRoles.includes(role)) {
    return next(
      new AppError(`Role must be one of: ${allowedRoles.join(', ')}`, 400),
    );
  }

  // 3) Prevent admin from changing their own role (IMPORTANT)
  if (req.user._id.toString() === id) {
    return next(new AppError('You cannot change your own role', 400));
  }

  // 4) Find user
  const updatedUser = await User.findByIdAndUpdate(
    id,
    { role },
    { returnDocument: 'after', runValidators: true },
  );

  if (!updatedUser) {
    return next(new AppError('No user found with that ID', 404));
  }

  // 6) Response
  res.status(200).json({
    status: 'success',
    message: `User role updated to ${role}`,
    data: {
      updatedUser,
    },
  });
});
