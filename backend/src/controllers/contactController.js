import Contact from '../models/contactModel.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import sendEmail from '../utils/email.js';
import emailTemplates from '../templates/EmailTemplate.js';

// ===================== PUBLIC =====================

export const createContact = catchAsync(async (req, res, next) => {
  const { name, email, phone, subject, message, bookingId } = req.body;

  const contact = await Contact.create({
    name,
    email,
    phone,
    subject,
    message,
    bookingId: bookingId || null,
    user: req.user?.id || null,
    ipAddress: req.ip,
  });

  // Send confirmation email to user
  try {
    await sendEmail({
      email,
      subject: 'پیام شما دریافت شد',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; direction: rtl;">
          <h2 style="color: #1a1a1a;">با تشکر از تماس شما، ${name}!</h2>
          <p style="color: #555;">پیام شما با موضوع <strong>${subject}</strong> دریافت شد.</p>
          <p style="color: #555;">تیم ما در اسرع وقت پاسخ خواهد داد.</p>
          <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 20px 0;">
            <p style="color: #333; margin: 0;">${message}</p>
          </div>
          <p style="color: #999; font-size: 13px;">شماره پیگیری: ${contact._id}</p>
        </div>
      `,
    });
  } catch (err) {
    console.error('Confirmation email failed:', err);
  }

  res.status(201).json({
    status: 'success',
    message: 'پیام شما با موفقیت ارسال شد.',
    data: {
      contact: {
        _id: contact._id,
        name: contact.name,
        subject: contact.subject,
        status: contact.status,
        createdAt: contact.createdAt,
      },
    },
  });
});

// ===================== ADMIN =====================

export const getAllContacts = catchAsync(async (req, res, next) => {
  const {
    status,
    subject,
    page = 1,
    limit = 20,
    sort = '-createdAt',
    search,
  } = req.query;

  const filter = { isSpam: false };
  if (status) filter.status = status;
  if (subject) filter.subject = subject;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { message: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [contacts, total] = await Promise.all([
    Contact.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('user', 'name email avatar')
      .populate('repliedBy', 'name')
      .populate('bookingId', 'startDate endDate totalPrice'),

    Contact.countDocuments(filter),
  ]);

  // Summary counts
  const counts = await Contact.aggregate([
    { $match: { isSpam: false } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  const summary = { unread: 0, read: 0, replied: 0, closed: 0 };
  counts.forEach(({ _id, count }) => {
    summary[_id] = count;
  });

  res.status(200).json({
    status: 'success',
    data: {
      contacts,
      summary,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    },
  });
});

export const getContactById = catchAsync(async (req, res, next) => {
  const contact = await Contact.findById(req.params.id)
    .populate('user', 'name email avatar phone')
    .populate('repliedBy', 'name')
    .populate('bookingId', 'startDate endDate totalPrice status');

  if (!contact) {
    return next(new AppError('No contact message found with that ID.', 404));
  }

  // Auto-mark as read
  if (contact.status === 'unread') {
    contact.status = 'read';
    await contact.save();
  }

  res.status(200).json({
    status: 'success',
    data: { contact },
  });
});

export const replyToContact = catchAsync(async (req, res, next) => {
  const { reply } = req.body;

  if (!reply?.trim()) {
    return next(new AppError('Please provide a reply message.', 400));
  }

  const contact = await Contact.findById(req.params.id);

  if (!contact) {
    return next(new AppError('No contact message found with that ID.', 404));
  }

  contact.adminReply = reply;
  contact.adminRepliedAt = new Date();
  contact.repliedBy = req.user.id;
  contact.status = 'replied';
  await contact.save();

  // Send reply email
  try {
    await sendEmail({
      email: contact.email,
      subject: `پاسخ به پیام شما: ${contact.subject}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; direction: rtl;">
          <h2 style="color: #1a1a1a;">پاسخ به پیام شما</h2>
          <p style="color: #555;">سلام ${contact.name}،</p>
          <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p style="color: #888; font-size: 13px; margin: 0 0 8px;">پیام شما:</p>
            <p style="color: #555; margin: 0;">${contact.message}</p>
          </div>
          <div style="background: #e8f5e9; padding: 16px; border-radius: 8px; margin: 16px 0; border-right: 4px solid #4caf50;">
            <p style="color: #888; font-size: 13px; margin: 0 0 8px;">پاسخ تیم ما:</p>
            <p style="color: #333; margin: 0;">${reply}</p>
          </div>
        </div>
      `,
    });
  } catch (err) {
    console.error('Reply email failed:', err);
  }

  res.status(200).json({
    status: 'success',
    message: 'Reply sent successfully.',
    data: { contact },
  });
});

export const updateContactStatus = catchAsync(async (req, res, next) => {
  const { status } = req.body;

  const validStatuses = ['unread', 'read', 'replied', 'closed'];
  if (!validStatuses.includes(status)) {
    return next(new AppError('Invalid status.', 400));
  }

  const contact = await Contact.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true },
  );

  if (!contact) {
    return next(new AppError('No contact message found with that ID.', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { contact },
  });
});

export const markAsSpam = catchAsync(async (req, res, next) => {
  const contact = await Contact.findByIdAndUpdate(
    req.params.id,
    { isSpam: true, status: 'closed' },
    { new: true },
  );

  if (!contact) {
    return next(new AppError('No contact message found with that ID.', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Marked as spam.',
    data: { contact },
  });
});

export const deleteContact = catchAsync(async (req, res, next) => {
  const contact = await Contact.findByIdAndDelete(req.params.id);

  if (!contact) {
    return next(new AppError('No contact message found with that ID.', 404));
  }

  res.status(204).json({ status: 'success', data: null });
});
