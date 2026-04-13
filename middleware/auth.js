const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const token = authHeader.substring(7);

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid or expired token.' });
    }
}

function requireTeacher(req, res, next) {
    if (!req.user || req.user.role !== 'teacher') {
        return res.status(403).json({ error: 'Teacher role required.' });
    }
    next();
}

function requireStudent(req, res, next) {
    if (!req.user || req.user.role !== 'student') {
        return res.status(403).json({ error: 'Student role required.' });
    }
    next();
}

module.exports = { requireAuth, requireTeacher, requireStudent };