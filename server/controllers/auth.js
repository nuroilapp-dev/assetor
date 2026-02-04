const db = require('../config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

exports.login = async (req, res) => {
    const { email, password } = req.body;
    const cleanEmail = email?.trim().toLowerCase();
    const cleanPassword = password?.trim();

    try {
        console.log(`[AuthDebug] Checking email: "${cleanEmail}"`);
        const [users] = await db.execute('SELECT * FROM users WHERE LOWER(email) = ?', [cleanEmail]);
        console.log(`[AuthDebug] Users found: ${users.length}`);

        if (users.length === 0) {
            console.log(`User not found: ${cleanEmail}`);
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const user = users[0];
        // Use bcrypt to compare
        const isMatch = await bcrypt.compare(cleanPassword, user.password);

        if (!isMatch) {
            console.log(`Password mismatch for ${cleanEmail}`);
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        if (user.status !== 'ACTIVE') {
            return res.status(403).json({ success: false, message: 'User account is inactive' });
        }

        const token = jwt.sign(
            {
                id: user.id,
                company_id: user.company_id,
                role: user.role,
                name: user.name,
                email: user.email
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                company_id: user.company_id
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getMe = async (req, res) => {
    try {
        const [users] = await db.execute('SELECT id, name, email, role, company_id, status FROM users WHERE id = ?', [req.user.id]);

        if (users.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({
            success: true,
            user: users[0]
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
