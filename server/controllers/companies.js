const db = require('../config/db');

exports.getCompanies = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM companies');
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createCompany = async (req, res) => {
    const { name, subdomain } = req.body;
    try {
        const [rows] = await db.execute('INSERT INTO companies (name, subdomain) VALUES (?, ?) RETURNING id', [name, subdomain]);
        res.status(201).json({ success: true, data: { id: rows[0].id, name, subdomain } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
