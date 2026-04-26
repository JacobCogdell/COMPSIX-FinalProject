const express = require('express');
const router = express.Router();
const { Assignment } = require('../database/setup');
const { requireAuth, requireTeacher } = require('../middleware/auth');


// GET all assignments, requires authentication
router.get('/', requireAuth, async (req, res) => {
    try {
        const assignments = await Assignment.findAll();
        res.status(200).json(assignments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET assignment by ID, requires authentication
router.get('/:id', requireAuth, async (req, res) => {
    try {
        const assignment = await Assignment.findByPk(req.params.id);
        if (!assignment) return res.status(404).json({ error: 'Assignment not found' });
        res.status(200).json(assignment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST create assignment, requires authentication and teacher role
router.post('/', requireAuth, requireTeacher, async (req, res) => {
    try {
        const { title, dueDate, courseId } = req.body;

        if (!title || !dueDate || !courseId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const newAssignment = await Assignment.create(req.body);
        res.status(201).json(newAssignment);

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// PUT update assignment, requires authentication and teacher role
router.put('/:id', requireAuth, requireTeacher, async (req, res) => {
    try {
        const assignment = await Assignment.findByPk(req.params.id);
        if (!assignment) return res.status(404).json({ error: 'Assignment not found' });

        await assignment.update(req.body);
        res.status(200).json(assignment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE assignment, requires authentication and teacher role
router.delete('/:id', requireAuth, requireTeacher, async (req, res) => {
    try {
        const assignment = await Assignment.findByPk(req.params.id);
        if (!assignment) return res.status(404).json({ error: 'Assignment not found' });

        await assignment.destroy();
        res.status(200).json({ message: 'Assignment deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;