const db = require('../config/db');

async function test() {
    const data = {
        name: 'Test Company',
        subdomain: 'testcomp',
        client_id: null,
        can_add_employee: true,
        max_employees: 10,
        max_assets: 20,
        company_code: 'TC',
        trade_license: 'TL123',
        tax_no: 'TX123',
        industry: 'Tech',
        logo: '',
        tenancy_type: 'OWNED',
        landlord_name: '',
        contract_start_date: null,
        contract_end_date: null,
        registration_no: '',
        ownership_doc_ref: '',
        country: 'UAE',
        state: 'Dubai',
        city: 'Dubai',
        area: 'JLT',
        address: 'Office 123',
        po_box: '12345',
        makani_number: '',
        telephone: '1234567',
        email: 'test@comp.com',
        website: 'test.com'
    };

    const columns = [
        'name', 'subdomain', 'client_id', 'can_add_employee', 'max_employees', 'max_assets',
        'company_code', 'trade_license', 'tax_no', 'industry', 'logo',
        'tenancy_type', 'landlord_name', 'contract_start_date', 'contract_end_date',
        'registration_no', 'ownership_doc_ref', 'country', 'state', 'city', 'area',
        'address', 'po_box', 'makani_number', 'telephone', 'email', 'website'
    ];

    const values = [
        data.name, data.subdomain, data.client_id, data.can_add_employee, data.max_employees, data.max_assets,
        data.company_code, data.trade_license, data.tax_no, data.industry, data.logo,
        data.tenancy_type, data.landlord_name, data.contract_start_date, data.contract_end_date,
        data.registration_no, data.ownership_doc_ref, data.country, data.state, data.city, data.area,
        data.address, data.po_box, data.makani_number, data.telephone, data.email, data.website
    ];

    const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');

    try {
        console.log(`Executing INSERT with ${columns.length} columns and ${values.length} values.`);
        const sql = `INSERT INTO companies (${columns.join(', ')}) VALUES (${placeholders}) RETURNING id`;
        const [rows] = await db.execute(sql, values);
        console.log('Success! ID:', rows[0].id);
    } catch (e) {
        console.error('FAILED:', e.message);
    } finally {
        process.exit();
    }
}

test();
