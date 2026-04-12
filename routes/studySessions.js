const express = require('express');
const router = express.Router();
const { StudySession } = require('../setup');

// GET all study sessions
router.get('/', async (req, res) => {
    const sessions = await StudySession.findAll();
    res.status(200).json(sessions);
});

// GET session by ID
router.get('/:id', async (req, res) => {
    const session = await StudySession.findByPk(req.params.id);
    if (!session) return res.status(404).json({ error: 'Study session not found' });
    res.status(200).json(session);
});

// POST create session
router.post('/', async (req, res) => {
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

// PUT update session
router.put('/:id', async (req, res) => {
    const session = await StudySession.findByPk(req.params.id);
    if (!session) return res.status(404).json({ error: 'Study session not found' });

    await session.update(req.body);
    res.status(200).json(session);
});

// DELETE session
router.delete('/:id', async (req, res) => {
    const session = await StudySession.findByPk(req.params.id);
    if (!session) return res.status(404).json({ error: 'Study session not found' });

    await session.destroy();
    res.status(200).json({ message: 'Study session deleted successfully' });
});

module.exports = router;