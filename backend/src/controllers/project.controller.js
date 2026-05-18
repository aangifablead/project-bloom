const { Project, Milestone, Template } = require('../models/project.model');
const { logger } = require('../config/logger');

/**
 * Helper utility to clean up Mongo records dynamically 
 * maps '_id' to a clean 'id' string field to satisfy TypeScript models
 */
const formatProjectData = (project) => {
  if (!project) return null;
  const obj = project.toObject ? project.toObject() : project;
  return {
    id: obj._id ? obj._id.toString() : obj.id,
    ...obj,
    _id: undefined, // Remove to keep payloads tidy
    __v: undefined
  };
};

// 1. GET ALL PROJECTS (with filters)
exports.getAllProjects = async (req, res) => {
  try {
    // 🔥 ALWAYS populate the owner field so that owner/createdBy contains an object with an avatar string
    const projects = await Project.find({}).populate('owner', 'name avatar');
    
    // ⚠️ CRITICAL FIX FOR: "projects.filter is not a function"
    // The frontend array mapping expects an explicit array index block literal []
    return res.status(200).json(projects); 
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// 2. GET SINGLE PROJECT BY ID
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('owner', 'name avatar');
    if (!project) return res.status(404).json({ message: "Project not found" });
    
    return res.status(200).json(project);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
// 3. CREATE NEW PROJECT
exports.createProject = async (req, res, next) => {
  try {
    const { name, description, color, startDate, endDate, templateId } = req.body;

    if (!name) {
      return res.status(400).json({ status: "error", message: "Project name is required" });
    }

    // Check if user is present to prevent application crashes
    if (!req.userId) {
      return res.status(401).json({ status: "error", message: "Not authorized, user missing" });
    }

    const newProject = await Project.create({
      name,
      description,
      color,
      startDate,
      endDate,
      templateId,
      owner: req.userId // Changed from req.user._id to match your other controllers
    });

    return res.status(201).json({
      status: "success",
      data: newProject
    });

  } catch (error) {
    console.error("Error creating project:", error);
    next(error);
  }
};

// 4. UPDATE PROJECT
exports.updateProject = async (req, res, next) => {
  try {
    const { name, description, color } = req.body;

    const updatedProject = await Project.findOneAndUpdate(
      { _id: req.params.id, owner: req.userId },
      { name, description, color },
      { new: true, runValidators: true }
    );

    if (!updatedProject) {
      return res.status(404).json({
        status: 'error',
        message: 'Project not found or unauthorized access'
      });
    }

    return res.status(200).json(formatProjectData(updatedProject));
  } catch (error) {
    logger.error('Error updating project:', error);
    next(error);
  }
};

// Express controller: deleteProject
exports.deleteProject = async (req, res) => {
  try {
    // 1. Double check that you're grabbing 'id' from req.params
    const projectId = req.params.id;

    // Example using Mongoose/MongoDB:
    const project = await Project.findByIdAndDelete(projectId);

    // 2. If the document can't be found in your database collection, return an intentional 404 message object instead of letting the server crash
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project record could not be found in the database."
      });
    }

    // 3. Return a standard success wrapper body 
    return res.status(200).json({
      success: true,
      data: { id: projectId }
    });

  } catch (error) {
    console.error("Error in deleteProject controller:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 6. ARCHIVE PROJECT
exports.archiveProject = async (req, res, next) => {
  try {
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, owner: req.userId },
      { isArchived: true },
      { new: true }
    );

    if (!project) {
      return res.status(404).json({
        status: 'error',
        message: 'Project not found or unauthorized access'
      });
    }

    return res.status(200).json(formatProjectData(project));
  } catch (error) {
    logger.error('Error archiving project:', error);
    next(error);
  }
};

// 7. RESTORE ARCHIVED PROJECT
exports.restoreProject = async (req, res, next) => {
  try {
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, owner: req.userId },
      { isArchived: false },
      { new: true }
    );

    if (!project) {
      return res.status(404).json({
        status: 'error',
        message: 'Project not found or unauthorized access'
      });
    }

    return res.status(200).json(formatProjectData(project));
  } catch (error) {
    logger.error('Error restoring project:', error);
    next(error);
  }
};

// 8. CLONE PROJECT
exports.cloneProject = async (req, res, next) => {
  try {
    const sourceProject = await Project.findOne({ _id: req.params.id, owner: req.userId });

    if (!sourceProject) {
      return res.status(404).json({
        status: 'error',
        message: 'Source project not found or unauthorized access'
      });
    }

    const clonedProjectData = {
      name: `${sourceProject.name} (Copy)`,
      description: sourceProject.description,
      color: sourceProject.color,
      owner: req.userId,
      isArchived: false
    };

    const clonedProject = await Project.create(clonedProjectData);

    return res.status(201).json(formatProjectData(clonedProject));
  } catch (error) {
    logger.error('Error cloning project:', error);
    next(error);
  }
};
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');
    
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    
    // Transform formatting structure slightly to match your front-end schema assumptions cleanly
    const formattedProject = {
      ...project.toJSON(),
      createdBy: project.owner,
      members: project.members.map(m => ({
        id: m.user?._id,
        name: m.user?.name,
        email: m.user?.email,
        avatar: m.user?.avatar,
        role: m.role
      }))
    };
    
    res.status(200).json(formattedProject);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ==========================================
// 👥 MEMBERS MANAGEMENT ENVELOPES
// ==========================================

exports.getProjectMembers = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('members.user', 'name email avatar');
    if (!project) return res.status(404).json({ message: 'Project not found' });
    
    const users = project.members.map(m => ({
      id: m.user?._id,
      name: m.user?.name,
      email: m.user?.email,
      avatar: m.user?.avatar,
      role: m.role
    }));
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addProjectMember = async (req, res) => {
  try {
    const { userId, role } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Prevent duplicate entries
    const alreadyMember = project.members.some(m => m.user.toString() === userId);
    if (alreadyMember) return res.status(400).json({ message: 'User is already a project member' });

    project.members.push({ user: userId, role });
    await project.save();
    
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateProjectMemberRole = async (req, res) => {
  try {
    const { role } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const member = project.members.find(m => m.user.toString() === req.params.userId);
    if (!member) return res.status(404).json({ message: 'Member matching ID sequence not found' });

    member.role = role;
    await project.save();
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.removeProjectMember = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    project.members = project.members.filter(m => m.user.toString() !== req.params.userId);
    await project.save();
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==========================================
// 🚀 TEMPLATES & CLONING ENGINES
// ==========================================

exports.getProjectTemplates = async (req, res) => {
  try {
    const templates = await Template.find();
    res.status(200).json(templates);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createProjectFromTemplate = async (req, res) => {
  try {
    const { templateId, name } = req.body;
    const template = await Template.findById(templateId);
    if (!template) return res.status(404).json({ message: 'Template layout source missing' });

    const newProject = await Project.create({
      name,
      description: template.description,
      owner: req.user.id,
      members: [{ user: req.user.id, role: 'owner' }]
    });
    res.status(201).json(newProject);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.cloneProject = async (req, res) => {
  try {
    const sourceProject = await Project.findById(req.params.id);
    if (!sourceProject) return res.status(404).json({ message: 'Target project source not found' });

    const clonedProject = await Project.create({
      name: req.body.name || `${sourceProject.name} (Copy)`,
      description: sourceProject.description,
      color: sourceProject.color,
      owner: req.user.id,
      members: [{ user: req.user.id, role: 'owner' }]
    });
    res.status(201).json(clonedProject);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==========================================
// 🏳️ MILESTONES DATA TRANSFERS
// ==========================================

exports.getProjectMilestones = async (req, res) => {
  try {
    const milestones = await Milestone.find({ projectId: req.params.id });
    res.status(200).json(milestones);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createMilestone = async (req, res) => {
  try {
    const milestone = await Milestone.create({
      ...req.body,
      projectId: req.params.id
    });
    res.status(201).json(milestone);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateMilestone = async (req, res) => {
  try {
    const milestone = await Milestone.findByIdAndUpdate(
      req.params.milestoneId,
      req.body,
      { new: true, runValidators: true }
    );
    if (!milestone) return res.status(404).json({ message: 'Milestone target record not found' });
    res.status(200).json(milestone);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteMilestone = async (req, res) => {
  try {
    const milestone = await Milestone.findByIdAndDelete(req.params.milestoneId);
    if (!milestone) return res.status(404).json({ message: 'Milestone target record not found' });
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==========================================
// 🗄️ ARCHIVE ACTIONS
// ==========================================

exports.archiveProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, { status: 'archived' }, { new: true });
    res.status(200).json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.restoreProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, { status: 'active' }, { new: true });
    res.status(200).json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};