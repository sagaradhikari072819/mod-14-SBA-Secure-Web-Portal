const express = require("express");
const { authMiddleware } = require("../middlewares/auth");
const Project = require("../models/Project");

const taskRouter = express.Router();

// Protects all rotes in this router
taskRouter.use(authMiddleware);

/**
 * GET /api/projects
 */
taskRouter.get("/", async (req, res) => {
  try {
    const userProjects = await Project.find({ user: req.user._id });

    res.json(userProjects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/projects/:projectId
 */
taskRouter.get("/:projectId", async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);

    if (!project) {
      return res
        .status(404)
        .json({ message: `Project with id: ${projectId} not found!` });
    }

    // Authorization
    console.log(req.user._id);
    console.log(project.user);
    
    if (project.user.toString() !== req.user._id) {
      return res.status(403).json({ message: "User is not authorized!" });
    }

    res.json(project);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/projects
 */
taskRouter.post("/", async (req, res) => {
  try {
    const newProject = await Project.create({
      ...req.body, //copy from previous body
      user: req.user._id,
    });

    res.status(201).json(newProject);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/projects/projectId
 */
taskRouter.put("/:projectId", async (req, res) => {
  try {
    const updateProject = await Project.findById(req.params.projectId)//finding the user's project with the help of id.

    if (req.user._id !== updateProject.user.toString()){
      return res.status(403).json({message: "This user is not authorized to update this project."})
    }
    const project = await Project.findByIdAndUpdate( req.params.projectId, req.body, {new:true})// need more explanation
    req.json(project)
  } catch (error) {
    res.status(500).json({error: error.message})
  }
});

/**
 * DELETE /api/projects/projectId
 */
taskRouter.delete("/:projectId", async (req, res) => {
  try {
        const deleteProject = await Project.findById(req.params.projectId)//finding the user's project with the help of id.

    if (req.user._id !== deleteProject.user.toString()){
      return res.status(403).json({message: "This user is not authorized to Delete this project."})
    }
    const project = await Project.findByIdAndDelete(req.params.projectId)
    res.json({message: "Project DELETED"})
  } catch (error) {
    res.status(500).json({error: error.message})
  }
});

module.exports = taskRouter;