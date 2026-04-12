const express = require('express');
const router = express.Router();
const { User } = require('../setup');

// GET all users
router.get('/', async (req, res) => {
    const users = await User.findAll();
    res.status(200).json(users);
});

// GET user by ID
router.get('/:id', async (req, res) => {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.status(200).json(user);
});

// POST create user
router.post('/', async (req, res) => {
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
router.put('/:id', async (req, res) => {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    await user.update(req.body);
    res.status(200).json(user);
});

// DELETE user
router.delete('/:id', async (req, res) => {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    await user.destroy();
    res.status(200).json({ message: 'User deleted successfully' });
});

module.exports = router;