const express = require('express');
const { 
  getAllUsers, 
  getUserProfile, 
  updateProfile, 
  deleteUser, 
  searchUsers 
} = require('../controllers/userController.js');
const { protect, requireAdmin } = require('../middlewares/auth.middleware.js');

const router = express.Router();

router.use(protect);

// Static paths
router.get('/profile', getUserProfile);
router.patch('/profile', updateProfile); 

// ADDED THIS LINE: Fallback route to catch frontend PUT requests on /profile/:id
router.put('/profile/:id', updateProfile); 

router.get('/search', searchUsers);

// Generic structural paths
router.get('/', getAllUsers);
router.get('/:id', getUserProfile);
router.patch('/:id', updateProfile);
router.delete('/:id', requireAdmin, deleteUser);

module.exports = router;