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
            console.log(`[AuthDebug] User not found: ${cleanEmail}`);
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const user = users[0];
        console.log(`[AuthDebug] User found: ID=${user.id}, Role=${user.role}`);
        console.log(`[AuthDebug] Input password length: ${cleanPassword.length}`);
        console.log(`[AuthDebug] Stored hash length: ${user.password ? user.password.length : 'null'}`);

        // Use bcrypt to compare
        const isMatch = await bcrypt.compare(cleanPassword, user.password);
        console.log(`[AuthDebug] Password match result: ${isMatch}`);

        if (!isMatch) {
            console.log(`[AuthDebug] ❌ Password mismatch for ${cleanEmail}`);
            // Temporary: Log if the password matches the hardcoded one to verify input
            const testMatch = await bcrypt.compare('superadmin123', user.password);
            console.log(`[AuthDebug] Does stored hash match 'superadmin123'? ${testMatch}`);

            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        if (user.status !== 'ACTIVE') {
            return res.status(403).json({ success: false, message: 'User account is inactive' });
        }

        // Fetch enabled modules from client if user has client_id
        let enabledModules = [];
        if (user.client_id) {
            try {
                const [clients] = await db.execute('SELECT enabled_modules FROM clients WHERE id = ?', [user.client_id]);
                if (clients.length > 0 && clients[0].enabled_modules) {
                    enabledModules = typeof clients[0].enabled_modules === 'string'
                        ? JSON.parse(clients[0].enabled_modules)
                        : clients[0].enabled_modules;
                }
            } catch (moduleError) {
                console.error('[Auth] Error fetching enabled_modules:', moduleError);
                // Continue with empty array - don't fail login
            }
        }

        const token = jwt.sign(
            {
                id: user.id,
                company_id: user.company_id,
                client_id: user.client_id,
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
                company_id: user.company_id,
                client_id: user.client_id,
                enabled_modules: enabledModules
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getMe = async (req, res) => {
    try {
        const [users] = await db.execute('SELECT id, name, email, role, company_id, client_id, status FROM users WHERE id = ?', [req.user.id]);

        if (users.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const user = users[0];
        let enabledModules = [];

        // Fetch enabled modules if client_id exists
        if (user.client_id) {
            try {
                const [clients] = await db.execute('SELECT enabled_modules FROM clients WHERE id = ?', [user.client_id]);
                if (clients.length > 0 && clients[0].enabled_modules) {
                    enabledModules = typeof clients[0].enabled_modules === 'string'
                        ? JSON.parse(clients[0].enabled_modules)
                        : clients[0].enabled_modules;
                }
            } catch (err) {
                console.error('[GetMe] Error fetching enabled_modules:', err);
            }
        }

        res.json({
            success: true,
            user: {
                ...user,
                enabled_modules: enabledModules
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
