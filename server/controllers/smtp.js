const db = require('../config/db');

exports.getAllConfigs = async (req, res) => {
    try {
        let sql = 'SELECT * FROM smtp_configs';
        let params = [];

        if (req.user?.role === 'COMPANY_ADMIN') {
            sql += ' WHERE company_id = ?';
            params.push(req.user.company_id);
        }

        sql += ' ORDER BY created_at DESC';
        const [configs] = await db.execute(sql, params);
        res.json({ success: true, configs });
    } catch (err) {
        console.error('Error fetching SMTP configs:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getConfig = async (req, res) => {
    try {
        const [configs] = await db.execute('SELECT * FROM smtp_configs WHERE id = ?', [req.params.id]);
        if (configs.length === 0) {
            return res.status(404).json({ success: false, message: 'Config not found' });
        }
        res.json({ success: true, config: configs[0] });
    } catch (err) {
        console.error('Error fetching SMTP config:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.createConfig = async (req, res) => {
    const { name, host, port, username, password, encryption, from_email, from_name, reply_to, is_active, debug_mode } = req.body;

    if (!name || !host || !username || !password || !from_email) {
        return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    // Determine company_id scope
    const company_id = req.user?.role === 'COMPANY_ADMIN' ? req.user.company_id : (req.body.company_id || null);

    try {
        if (is_active) {
            // Only deactivate within the same scope
            if (company_id) {
                await db.execute('UPDATE smtp_configs SET is_active = false WHERE company_id = ?', [company_id]);
            } else {
                await db.execute('UPDATE smtp_configs SET is_active = false WHERE company_id IS NULL');
            }
        }

        const query = `
            INSERT INTO smtp_configs (name, host, port, username, password, encryption, from_email, from_name, reply_to, is_active, debug_mode, company_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const params = [
            name, host, port || 587, username, password,
            encryption || 'tls', from_email, from_name || '',
            reply_to || '', is_active ? true : false,
            debug_mode ? true : false, company_id
        ];

        await db.execute(query, params);
        res.status(201).json({ success: true, message: 'SMTP Configuration created successfully' });
    } catch (err) {
        console.error('Error creating SMTP config:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.updateConfig = async (req, res) => {
    const { id } = req.params;
    const { name, host, port, username, password, encryption, from_email, from_name, reply_to, is_active, debug_mode } = req.body;

    try {
        // Build update query dynamically or just update all fields
        if (is_active) {
            await db.execute('UPDATE smtp_configs SET is_active = false WHERE id != ?', [id]);
        }

        const query = `
            UPDATE smtp_configs 
            SET name=?, host=?, port=?, username=?, password=?, encryption=?, from_email=?, from_name=?, reply_to=?, is_active=?, debug_mode=?, updated_at=CURRENT_TIMESTAMP
            WHERE id = ?
        `;

        const params = [
            name,
            host,
            port,
            username,
            password,
            encryption,
            from_email,
            from_name,
            reply_to,
            is_active,
            debug_mode,
            id
        ];

        const [result] = await db.execute(query, params);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Config not found' });
        }

        res.json({ success: true, message: 'SMTP Configuration updated successfully' });
    } catch (err) {
        console.error('Error updating SMTP config:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.deleteConfig = async (req, res) => {
    try {
        await db.execute('DELETE FROM smtp_configs WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Configuration deleted successfully' });
    } catch (err) {
        console.error('Error deleting SMTP config:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
