const mongoose = require('mongoose');

const teamMemberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ['member', 'manager', 'admin'], default: 'member' },
  avatar: String,
}, { timestamps: true });

module.exports = mongoose.model('TeamMember', teamMemberSchema);