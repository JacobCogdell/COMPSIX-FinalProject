const express = require('express');
const router = express.Router();
const { StudySession } = require('../database/setup');
const { requireAuth, requireStudent } = require('../middleware/auth');

// GET all study sessions, requires authentication, students can only see their own sessions, teachers can see all sessions
router.get('/', requireAuth, async (req, res) => {
    try {
        let sessions;

        if (req.user.role === 'teacher') {
            sessions = await StudySession.findAll();
        } else {
            sessions = await StudySession.findAll({ 
                where: { userId: req.user.id } 
            });
        }

        res.status(200).json(sessions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET session by ID, requires authentication
router.get('/:id', requireAuth, async (req, res) => {
    try {
        const session = await StudySession.findByPk(req.params.id);
        if (!session) return res.status(404).json({ error: 'Study session not found' });

        if(req.user.role === 'student' && req.user.id !== session.userId) {
            return res.status(403).json({ error: 'Forbidden: Students can only access their own study sessions' });
        }

        res.status(200).json(session);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
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
    try {
        const session = await StudySession.findByPk(req.params.id);
        if (!session) return res.status(404).json({ error: 'Study session not found' });

        if (session.userId !== req.user.id) {
            return res.status(403).json({ error: 'Forbidden: Students can only update their own study sessions' });
        }

        await session.update(req.body);
        res.status(200).json(session);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE session, requires authentication and student role
router.delete('/:id', requireAuth, requireStudent, async (req, res) => {
    try {
        const session = await StudySession.findByPk(req.params.id);
        if (!session) return res.status(404).json({ error: 'Study session not found' });

    if (session.userId !== req.user.id) {
        return res.status(403).json({ error: 'Forbidden: Students can only delete their own study sessions' });
    }

        await session.destroy();
        res.status(200).json({ message: 'Study session deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;