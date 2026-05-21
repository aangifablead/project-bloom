const mongoose = require('mongoose');
const { Project, Milestone, Template } = require('../models/project.model');
const { logger } = require('../config/logger');

/**
 * Helper utility
 */
const formatProjectData = (project) => {
  if (!project) return null;
  const obj = project.toObject ? project.toObject() : project;

  return {
    id: obj._id ? obj._id.toString() : obj.id,
    ...obj,
    _id: undefined,
    __v: undefined
  };
};

/* =========================================
   1. GET ALL PROJECTS
========================================= */
exports.getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find({})
      .populate('owner', 'name avatar');

    return res.status(200).json(projects);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/* =========================================
   2. GET PROJECT BY ID  (ONLY ONE VERSION)
========================================= */
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const formatted = {
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

    return res.status(200).json(formatted);
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

/* =========================================
   3. CREATE PROJECT
========================================= */
exports.createProject = async (req, res, next) => {
  try {
    const { name, description, color, startDate, endDate, templateId } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Project name is required" });
    }

    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const newProject = await Project.create({
      name,
      description,
      color,
      startDate,
      endDate,
      templateId,
      owner: req.userId
    });

    return res.status(201).json({
      status: "success",
      data: newProject
    });

  } catch (error) {
    next(error);
  }
};

/* =========================================
   4. UPDATE PROJECT
========================================= */
exports.updateProject = async (req, res, next) => {
  try {
    const updated = await Project.findOneAndUpdate(
      { _id: req.params.id, owner: req.userId },
      req.body,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Project not found" });
    }

    return res.status(200).json(formatProjectData(updated));
  } catch (err) {
    next(err);
  }
};

/* =========================================
   5. DELETE PROJECT
========================================= */
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Not found" });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

/* =========================================
   6. ARCHIVE / RESTORE
========================================= */
exports.archiveProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { status: 'archived' },
      { new: true }
    );

    return res.status(200).json(project);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.restoreProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { status: 'active' },
      { new: true }
    );

    return res.status(200).json(project);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

/* =========================================
   7. CLONE PROJECT (FIXED - ONLY ONE VERSION)
========================================= */
exports.cloneProject = async (req, res) => {
  try {
    const source = await Project.findById(req.params.id);

    if (!source) {
      return res.status(404).json({ message: "Project not found" });
    }

    const clone = await Project.create({
      name: `${source.name} (Copy)`,
      description: source.description,
      color: source.color,
      startDate: source.startDate,
      endDate: source.endDate,
      owner: req.userId,
      members: [
        {
          user: req.userId,
          role: 'owner'
        }
      ]
    });

    return res.status(201).json(clone);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

/* =========================================
   8. MEMBERS (FIXED TEAM MEMBER ISSUE)
========================================= */
exports.getProjectMembers = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate({
        path: 'members.user',
        model: 'TeamMember',
        select: 'name email avatar'
      });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    return res.status(200).json(project.members || []);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.addProjectMember = async (req, res) => {
  try {
    const { userId, role } = req.body;

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const exists = project.members.some(
      m => m.user?.toString() === userId
    );

    if (exists) {
      return res.status(400).json({ message: "Already member" });
    }

    project.members.push({
      user: new mongoose.Types.ObjectId(userId),
      role: role || 'member'
    });

    await project.save();

    const updated = await Project.findById(req.params.id)
      .populate('members.user', 'name email avatar');

    return res.status(200).json(updated.members);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.updateProjectMemberRole = async (req, res) => {
  try {
    const { role } = req.body;

    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Not found" });

    const member = project.members.find(
      m => m.user.toString() === req.params.userId
    );

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    member.role = role;
    await project.save();

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// Update your controller to return the saved project
exports.removeProjectMember = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Not found" });

    project.members = project.members.filter(
      m => m.user.toString() !== req.params.userId
    );

    const updatedProject = await project.save(); // Save and store the result

    // Return the updated project so the frontend gets the fresh member list
    return res.status(200).json(updatedProject); 
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

/* =========================================
   9. TEMPLATE + MILESTONE (UNCHANGED SAFE)
========================================= */
exports.getProjectTemplates = async (req, res) => {
  const data = await Template.find();
  return res.json(data);
};

exports.createProjectFromTemplate = async (req, res) => {
  const template = await Template.findById(req.body.templateId);

  const project = await Project.create({
    name: req.body.name,
    description: template?.description,
    owner: req.userId,
    members: [{ user: req.userId, role: 'owner' }]
  });

  return res.status(201).json(project);
};

exports.getProjectMilestones = async (req, res) => {
  const data = await Milestone.find({ projectId: req.params.id });
  return res.json(data);
};

exports.createMilestone = async (req, res) => {
  const data = await Milestone.create({
    ...req.body,
    projectId: req.params.id
  });

  return res.status(201).json(data);
};

exports.updateMilestone = async (req, res) => {
  const data = await Milestone.findByIdAndUpdate(
    req.params.milestoneId,
    req.body,
    { new: true }
  );

  return res.json(data);
};

exports.deleteMilestone = async (req, res) => {
  await Milestone.findByIdAndDelete(req.params.milestoneId);
  return res.json({ success: true });
};