const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Token tidak ditemui. Sila log masuk.' });
    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch {
        return res.status(401).json({ message: 'Token tidak sah atau telah tamat. Sila log masuk semula.' });
    }
};

const requireRole = (...roles) => (req, res, next) => {
    if (!roles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Akses ditolak: anda tidak mempunyai kebenaran untuk endpoint ini.' });
    }
    next();
};

const verifyOwnership = (req, res, next) => {
    const id = req.params.no_matrik;
    if (id && req.user.no_matrik !== id) {
        return res.status(403).json({ message: 'Akses ditolak: anda hanya boleh mengakses data anda sendiri.' });
    }
    next();
};

module.exports = { verifyToken, requireRole, verifyOwnership };
