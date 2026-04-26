const express = require('express');
const router = express.Router();
const { User } = require('../database/setup');
const { requireAuth, requireTeacher } = require('../middleware/auth');

// GET all users
router.get('/', requireAuth, requireTeacher, async (req, res) => {
    try {
        const users = await User.findAll();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET user by ID
router.get('/:id', requireAuth, async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        if(req.user.role === 'student' && req.user.id !== user.id) {
            return res.status(403).json({ error: 'Forbidden: Students can only access their own data' });
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST create user
router.post('/', requireAuth, requireTeacher,async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const newUser = await User.create({ name, email, password, role });
        res.status(201).json(newUser);

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// PUT update user
router.put('/:id', requireAuth, async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        if(req.user.role === 'student' && req.user.id !== user.id) {
            return res.status(403).json({ error: 'Forbidden: Students can only update their own data' });
    }

        await user.update(req.body);
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE user
router.delete('/:id', requireAuth, requireTeacher, async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        await user.destroy();
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;