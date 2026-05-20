const crypto = require('crypto');
const { sendInviteEmail } = require('../services/email.service');
const asyncHandler = require('express-async-handler');
const TeamMember = require('../models/teamMember.model');
const Invite = require('../models/invite.model');
const AuditLog = require('../models/auditLog.model');
const { getIO } = require('../socket');

// GET /api/team
exports.getAllMembers = asyncHandler(async (req, res) => {
  const members = await TeamMember.find({}).sort({
    createdAt: -1,
  });
  res.status(200).json({
    status: 'success',
    data: members,
  });
});

// POST /api/team
exports.createMember = asyncHandler(async (req, res) => {
  const member = await TeamMember.create(req.body);

  res.status(201).json({
    status: 'success',
    data: member,
  });
});

// GET /api/team/:id
exports.getMemberById = asyncHandler(async (req, res) => {
  const member = await TeamMember.findById(
    req.params.id
  );

  if (!member) {
    return res.status(404).json({
      status: 'fail',
      message: 'Member not found',
    });
  }

  res.status(200).json({
    status: 'success',
    data: member,
  });
});

// PATCH /api/team/:id
exports.updateMember = asyncHandler(async (req, res) => {
  const member =
    await TeamMember.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
  if (!member) {
    return res.status(404).json({
      status: 'fail',
      message: 'Member not found',
    });
  }

  res.status(200).json({
    status: 'success',
    data: member,
  });
});

// DELETE /api/team/:id
exports.removeMember = asyncHandler(async (req, res) => {
  const member =
    await TeamMember.findByIdAndDelete(
      req.params.id
    );

  if (!member) {
    return res.status(404).json({
      status: 'fail',
      message: 'Member not found',
    });
  }

  res.status(200).json({
    status: 'success',
    message: 'Member deleted successfully',
  });
});


// POST /api/team/invite
exports.inviteMember = asyncHandler(async (req, res) => {
  const { name, email, role } = req.body;
  await Invite.deleteMany({ email });
  // 1. Basic Validation
  if (!name || !email) {
    return res.status(400).json({
      status: 'error',
      message: 'Name and email are required',
    });
  }

  // 2. Check if a pending invite already exists for this email
  const existingInvite = await Invite.findOne({ email, status: 'pending' });

  if (existingInvite) {
    return res.status(400).json({
      status: 'error',
      message: 'An invitation is already pending for this email address.',
    });
  }

  // 3. Optional: Prevent inviting existing team members
  const alreadyMember = await TeamMember.findOne({ email });
  if (alreadyMember) {
    return res.status(400).json({
      status: 'error',
      message: 'This user is already a member of the team.',
    });
  }

  // 4. Generate a unique token
  const inviteToken = crypto.randomBytes(32).toString('hex');
  try {
    const newInvite = await Invite.create({
      name,
      email,
      role: role || 'member',
      status: 'pending',
      inviteToken,
    });

    await sendInviteEmail({
      name,
      email,
      role: role || 'member',
      inviteToken,
    });

    res.status(201).json({
      status: 'success',
      data: newInvite,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        status: 'error',
        message: 'An invitation for this email is currently being processed.',
      });
    }
    throw err;
  }
});

exports.acceptInvite = asyncHandler(async (req, res) => {
  const { token } = req.params;

  // 1. Ensure you are searching by the exact field name in your model
  const invite = await Invite.findOne({
    inviteToken: token, // This must match the field name in your MongoDB document
    status: "pending",
  });

  if (!invite) {
    return res.status(404).json({
      status: "error",
      message: "Invalid or expired invite",
    });
  }

  // 2. Create the team member only if they don't exist
  const existingMember = await TeamMember.findOne({ email: invite.email });
  if (!existingMember) {
    await TeamMember.create({
      name: invite.name,
      email: invite.email,
      role: invite.role,
      status: "active",
    });
  }

  // 3. Update status
  invite.status = "accepted";
  await invite.save();

  return res.status(200).json({ status: "success" });
});
// GET /api/team/invites
exports.getPendingInvites =
  asyncHandler(async (req, res) => {
    const invites = await Invite.find({
      status: 'pending',
    }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      status: 'success',
      data: invites,
    });
  });

// POST /api/team/invites/:id/resend
exports.resendInvite = asyncHandler(async (req, res) => {
  const invite = await Invite.findById(req.params.id);

  if (!invite) {
    return res.status(404).json({
      status: "fail",
      message: "Invite not found",
    });
  }

  // regenerate token (IMPORTANT)
  invite.inviteToken = crypto.randomBytes(32).toString("hex");
  invite.status = "pending";
  await invite.save();

  await sendInviteEmail({
    name: invite.name,
    email: invite.email,
    role: invite.role,
    inviteToken: invite.inviteToken,
  });

  res.status(200).json({
    status: "success",
  });
});

// DELETE /api/team/invites/:id
exports.cancelInvite = asyncHandler(
  async (req, res) => {
    const invite =
      await Invite.findByIdAndDelete(
        req.params.id
      );

    if (!invite) {
      return res.status(404).json({
        status: 'fail',
        message: 'Invite not found',
      });
    }

    res.status(200).json({
      status: 'success',
      message:
        'Invite cancelled successfully',
    });
  }
);

// GET /api/team/activity
exports.getActivityLogs =
  asyncHandler(async (req, res) => {
    const logs = await AuditLog.find({
      type: 'activity',
    }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      status: 'success',
      data: logs,
    });
  });

// GET /api/team/workload
exports.getWorkload = asyncHandler(
  async (req, res) => {
    const workload =
      await TeamMember.aggregate([
        {
          $lookup: {
            from: 'tasks',
            localField: '_id',
            foreignField: 'assignee',
            as: 'tasks',
          },
        },
        {
          $project: {
            name: 1,
            email: 1,
            role: 1,
            workload: {
              $size: '$tasks',
            },
          },
        },
      ]);

    res.status(200).json({
      status: 'success',
      data: workload,
    });
  }
);

// GET /api/team/audit-logs
exports.getAuditLogs = asyncHandler(
  async (req, res) => {
    const {
      startDate,
      endDate,
    } = req.query;

    const filter = {};

    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const logs = await AuditLog.find(
      filter
    ).sort({
      createdAt: -1,
    });

    res.status(200).json({
      status: 'success',
      total: logs.length,
      logs,
    });
  }
);