const db = require('../config/db');

exports.getSummary = async (req, res) => {
    try {
        const companyId = req.companyId;
        console.log('Dashboard getSummary - companyId:', companyId);

        // Build query based on whether we have a specific company or not (SUPER_ADMIN)
        const whereClause = companyId ? 'WHERE company_id = ?' : '';
        const params = companyId ? [companyId] : [];

        console.log('Query params:', params);

        // Debugging queries
        const totalQuery = `SELECT COUNT(*) as count FROM assets ${whereClause}`;
        console.log('Total Query:', totalQuery);
        const [total] = await db.execute(totalQuery, params);

        const assignedQuery = `SELECT COUNT(*) as count FROM assets ${whereClause} ${whereClause ? 'AND' : 'WHERE'} status = "ASSIGNED"`;
        console.log('Assigned Query:', assignedQuery);
        const [assigned] = await db.execute(assignedQuery, params);

        const availableQuery = `SELECT COUNT(*) as count FROM assets ${whereClause} ${whereClause ? 'AND' : 'WHERE'} status = "AVAILABLE"`;
        const [available] = await db.execute(availableQuery, params);

        const maintenanceQuery = `SELECT COUNT(*) as count FROM assets ${whereClause} ${whereClause ? 'AND' : 'WHERE'} status = "MAINTENANCE"`;
        const [maintenance] = await db.execute(maintenanceQuery, params);

        res.json({
            success: true,
            data: {
                total: total[0].count,
                assigned: assigned[0].count,
                available: available[0].count,
                maintenance: maintenance[0].count
            }
        });
    } catch (error) {
        console.error('Dashboard Summary Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getCharts = async (req, res) => {
    try {
        const companyId = req.companyId;

        // Categories distribution
        const [categoryData] = await db.execute(
            'SELECT ac.name, COUNT(a.id) as count FROM assets a ' +
            'JOIN asset_categories ac ON a.category_id = ac.id ' +
            'WHERE a.company_id = ? GROUP BY ac.name',
            [companyId]
        );

        // Status distribution (Health Score)
        const [statusData] = await db.execute(
            'SELECT status as label, COUNT(*) as value FROM assets WHERE company_id = ? GROUP BY status',
            [companyId]
        );

        // Simple Trend (Usage by month - based on created_at or assignments)
        // For brevity, we'll return some mock-structured data or real aggregation
        const [trendData] = await db.execute(
            'SELECT DATE_FORMAT(created_at, "%b") as month, COUNT(*) as count ' +
            'FROM assets WHERE company_id = ? ' +
            'GROUP BY month ORDER BY MIN(created_at)',
            [companyId]
        );

        res.json({
            success: true,
            data: {
                categories: categoryData,
                status: statusData,
                trend: trendData
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getRecentAssets = async (req, res) => {
    try {
        const companyId = req.companyId;
        const whereClause = companyId ? 'WHERE a.company_id = ?' : '';
        const params = companyId ? [companyId] : [];

        const [rows] = await db.execute(
            `SELECT a.*, ac.name as category_name FROM assets a ` +
            `LEFT JOIN asset_categories ac ON a.category_id = ac.id ` +
            `${whereClause} ORDER BY a.created_at DESC LIMIT 5`,
            params
        );
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
