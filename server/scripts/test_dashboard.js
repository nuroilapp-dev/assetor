const axios = require('axios');

async function testDashboard() {
    try {
        const loginRes = await axios.post('http://localhost:5024/api/auth/login', {
            email: 'vishnupriya@nurac',
            password: 'admin123'
        });

        const token = loginRes.data.token;
        console.log('Got token:', token ? 'YES' : 'NO');

        try {
            const summaryRes = await axios.get('http://localhost:5024/api/dashboard/summary', {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('Summary success:', summaryRes.data);
        } catch (err) {
            console.log('Summary failed:', err.response?.status, err.response?.data);
        }

    } catch (error) {
        console.error('Test failed:', error.message);
        if (error.response) console.error(error.response.data);
    }
}

testDashboard();
