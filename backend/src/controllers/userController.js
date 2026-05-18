const User = require('../models/user.model.js'); 

// GET /api/users (with pagination & filtering)
const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.role) {
      filter.role = req.query.role;
    }

    const users = await User.find(filter)
      .select('-password') 
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: { total, page, limit, pages: Math.ceil(total / limit) }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/users/search
const searchUsers = async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) {
      res.status(400).json({ success: false, message: 'Search query parameter "q" is required' });
      return;
    }

    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    }).select('-password');

    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/users/profile & GET /api/users/:id
const getUserProfile = async (req, res) => {
  try {
    const targetId = req.params.id || req.user?.id; 

    const user = await User.findById(targetId).select('-password');
    if (!user) {
      res.status(404).json({ success: false, message: 'User profile not found' });
      return;
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// userController.js — Inside updateProfile

const updateProfile = async (req, res) => {
  try {
    // 1. Fallback through every potential id vector on the authenticated session
    const currentUserId = (req.user?._id || req.user?.id || req.user?._doc?._id)?.toString();
    const targetId = req.params.id ? req.params.id.toString() : currentUserId;

    // 2. Validate bounds if an ID was explicitly provided in the request URL parameters
    if (req.params.id) {
      if (!currentUserId) {
        res.status(401).json({ success: false, message: 'Unauthorized: Missing session context' });
        return;
      }

      if (targetId !== currentUserId && req.user?.role !== 'admin') {
        res.status(403).json({ 
          success: false, 
          message: 'Forbidden: Unauthorized adjustment vector' 
        });
        return;
      }
    }

    // 3. Prevent non-admin users from upgrading roles
    if (req.user?.role !== 'admin' && req.body.role) {
      delete req.body.role;
    }

    const updatedUser = await User.findByIdAndUpdate(
      targetId,
      { $set: req.body },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      res.status(404).json({ success: false, message: 'User profile not found' });
      return;
    }

    res.status(200).json({ success: true, data: updatedUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// DELETE /api/users/:id
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      res.status(404).json({ success: false, message: 'Target user records not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'User workspace evicted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllUsers,
  searchUsers,
  getUserProfile,
  updateProfile,
  deleteUser
};