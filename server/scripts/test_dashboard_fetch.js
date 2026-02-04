async function test() {
    try {
        // 1. Login
        const loginRes = await fetch('http://localhost:5024/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'vishnupriya@nurac', password: 'admin123' })
        });
        const loginData = await loginRes.json();

        if (!loginData.success) {
            console.error('Login failed:', loginData);
            return;
        }

        const token = loginData.token;
        console.log('Login success. Token obtained.');

        // 2. Get Summary
        const summaryRes = await fetch('http://localhost:5024/api/dashboard/summary', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log('Summary Status:', summaryRes.status);
        const text = await summaryRes.text();
        console.log('Summary Body:', text);

    } catch (e) {
        console.error('Error:', e);
    }
}

test();
