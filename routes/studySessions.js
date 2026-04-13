const express = require('express');
const router = express.Router();
const { StudySession } = require('../database/setup');
const { requireAuth, requireStudent } = require('../middleware/auth');

// GET all study sessions, requires authentication
router.get('/', requireAuth, async (req, res) => {
    const sessions = await StudySession.findAll();
    res.status(200).json(sessions);
});

// GET session by ID, requires authentication
router.get('/:id', requireAuth, async (req, res) => {
    const session = await StudySession.findByPk(req.params.id);
    if (!session) return res.status(404).json({ error: 'Study session not found' });
    res.status(200).json(session);
});

// POST create session, requires authentication and student role
router.post('/', requireAuth, requireStudent,async (req, res) => {
    try {
        const { userId, courseId, startTime, endTime } = req.body;

        if (!userId || !courseId || !startTime || !endTime) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const newSession = await StudySession.create(req.body);
        res.status(201).json(newSession);

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// PUT update session, requires authentication and student role
router.put('/:id', requireAuth, requireStudent, async (req, res) => {
    const session = await StudySession.findByPk(req.params.id);
    if (!session) return res.status(404).json({ error: 'Study session not found' });

    await session.update(req.body);
    res.status(200).json(session);
});

// DELETE session, requires authentication and student role
router.delete('/:id', requireAuth, requireStudent, async (req, res) => {
    const session = await StudySession.findByPk(req.params.id);
    if (!session) return res.status(404).json({ error: 'Study session not found' });

    await session.destroy();
    res.status(200).json({ message: 'Study session deleted successfully' });
});

module.exports = router;