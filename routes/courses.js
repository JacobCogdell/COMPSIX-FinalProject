const express = require('express');
const router = express.Router();
const { Course } = require('../database/setup');
const { requireAuth, requireTeacher } = require('../middleware/auth');

// GET all courses, requires authentication
router.get('/', requireAuth, async (req, res) => {
    const courses = await Course.findAll();
    res.status(200).json(courses);
});

// GET course by ID, requires authentication
router.get('/:id', requireAuth, async (req, res) => {
    const course = await Course.findByPk(req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    res.status(200).json(course);
});

// POST create course, requires authentication and teacher role
router.post('/', requireAuth,requireTeacher, async (req, res) => {
    try {
        const { courseName, teacherName, semester, teacherId } = req.body;

        if (!courseName || !teacherName || !semester || !teacherId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const newCourse = await Course.create(req.body);
        res.status(201).json(newCourse);

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// PUT update course, requires authentication and teacher role
router.put('/:id', requireAuth, requireTeacher, async (req, res) => {
    const course = await Course.findByPk(req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found' });

    await course.update(req.body);
    res.status(200).json(course);
});

// DELETE course, requires authentication and teacher role
router.delete('/:id', requireAuth, requireTeacher, async (req, res) => {
    const course = await Course.findByPk(req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found' });

    await course.destroy();
    res.status(200).json({ message: 'Course deleted successfully' });
});

module.exports = router;