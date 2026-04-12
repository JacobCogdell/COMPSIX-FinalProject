const express = require('express');
const router = express.Router();
const { Course } = require('../setup');

// GET all courses
router.get('/', async (req, res) => {
    const courses = await Course.findAll();
    res.status(200).json(courses);
});

// GET course by ID
router.get('/:id', async (req, res) => {
    const course = await Course.findByPk(req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    res.status(200).json(course);
});

// POST create course
router.post('/', async (req, res) => {
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

// PUT update course
router.put('/:id', async (req, res) => {
    const course = await Course.findByPk(req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found' });

    await course.update(req.body);
    res.status(200).json(course);
});

// DELETE course
router.delete('/:id', async (req, res) => {
    const course = await Course.findByPk(req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found' });

    await course.destroy();
    res.status(200).json({ message: 'Course deleted successfully' });
});

module.exports = router;