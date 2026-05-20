const mongoose = require('mongoose');

const inviteSchema =
  new mongoose.Schema({
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      index: { unique: true, partialFilterExpression: { status: 'pending' } }
    },
    role: {
      type: String,
      enum: [
        'admin',
        'manager',
        'member',
      ],
      default: 'member',
    },
    status: {
      type: String,
      enum: [
        'pending',
        'accepted',
      ],
      default: 'pending',
    },
    inviteToken: {
      type: String,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  });
  
module.exports = mongoose.model(
  'Invite',
  inviteSchema
);