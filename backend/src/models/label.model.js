const mongoose = require('mongoose');

const labelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Label text name is required'],
    trim: true,
    maxlength: [30, 'Label cannot exceed 30 characters']
  },
  color: {
    type: String,
    required: [true, 'Hex color required'],
    default: '#3b82f6',
    match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please provide a valid hex color format']
  }
}, { timestamps: true });

const Label = mongoose.model('Label', labelSchema);
module.exports = Label;