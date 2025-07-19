const pool = require('../config/database');
const { faker } = require('@faker-js/faker');

// Quick seed with less data for faster startup
async function quickSeed() {
  try {
    console.log('🌱 Quick seeding Ra Platform...');
    
    // Clear existing data
    await pool.query('TRUNCATE TABLE sales, inventory, routes, trucks, employees, locations, companies CASCADE');
    
    // Create 2 ice cream companies in Washington
    const iceCompany1 = await pool.query(`
      INSERT INTO companies (name, business_type, state, contact_email, contact_phone)
      VALUES ('Arctic Delights Ice Cream Co.', 'ice_cream', 'Washington', 'contact@arcticdelights.com', '(206) 555-0101')
      RETURNING *
    `);
    
    const iceCompany2 = await pool.query(`
      INSERT INTO companies (name, business_type, state, contact_email, contact_phone)
      VALUES ('Frozen Paradise Trucks', 'ice_cream', 'Washington', 'info@frozenparadise.com', '(253) 555-0102')
      RETURNING *
    `);
    
    // Create 2 burger companies in California
    const burgerCompany1 = await pool.query(`
      INSERT INTO companies (name, business_type, state, contact_email, contact_phone)
      VALUES ('Golden State Burger Co.', 'burger', 'California', 'orders@goldenburger.com', '(213) 555-0201')
      RETURNING *
    `);
    
    const burgerCompany2 = await pool.query(`
      INSERT INTO companies (name, business_type, state, contact_email, contact_phone)
      VALUES ('Pacific Coast Grill', 'burger', 'California', 'hello@pacificgrill.com', '(415) 555-0202')
      RETURNING *
    `);
    
    const companies = [
      iceCompany1.rows[0],
      iceCompany2.rows[0], 
      burgerCompany1.rows[0],
      burgerCompany2.rows[0]
    ];
    
    console.log('🏢 Created 4 companies');
    
    // Create locations
    const locations = [];
    const washingtonCities = ['Seattle', 'Tacoma', 'Spokane', 'Bellevue'];
    const californiaCities = ['Los Angeles', 'San Francisco', 'San Diego', 'Sacramento'];
    
    // Ice cream locations in Washington
    for (let i = 0; i < 2; i++) {
      for (const city of washingtonCities.slice(0, 2)) {
        const location = await pool.query(`
          INSERT INTO locations (company_id, name, address, city, state, zip_code, latitude, longitude)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING *
        `, [
          companies[i].id,
          `${city} Location`,
          faker.location.streetAddress(),
          city,
          'Washington',
          faker.location.zipCode(),
          faker.location.latitude({ min: 45.5, max: 49.0 }),
          faker.location.longitude({ min: -124.7, max: -116.9 })
        ]);
        locations.push(location.rows[0]);
      }
    }
    
    // Burger locations in California
    for (let i = 2; i < 4; i++) {
      for (const city of californiaCities.slice(0, 2)) {
        const location = await pool.query(`
          INSERT INTO locations (company_id, name, address, city, state, zip_code, latitude, longitude)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING *
        `, [
          companies[i].id,
          `${city} Branch`,
          faker.location.streetAddress(),
          city,
          'California',
          faker.location.zipCode(),
          faker.location.latitude({ min: 32.5, max: 42.0 }),
          faker.location.longitude({ min: -124.4, max: -114.1 })
        ]);
        locations.push(location.rows[0]);
      }
    }
    
    console.log('📍 Created 8 locations');
    
    // Create 200 employees (50 per company)
    const employees = [];
    const positions = ['Driver', 'Cashier', 'Cook', 'Manager', 'Assistant Manager'];
    
    for (const company of companies) {
      const companyLocations = locations.filter(loc => loc.company_id === company.id);
      
      for (let i = 0; i < 50; i++) {
        const location = faker.helpers.arrayElement(companyLocations);
        const employee = await pool.query(`
          INSERT INTO employees (
            company_id, location_id, employee_id, first_name, last_name,
            email, phone, position, hire_date, salary, status
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          RETURNING *
        `, [
          company.id,
          location.id,
          `${company.business_type.toUpperCase().substring(0, 3)}${company.id.substring(0, 3)}${String(i + 1).padStart(3, '0')}`,
          faker.person.firstName(),
          faker.person.lastName(),
          faker.internet.email(),
          faker.phone.number().substring(0, 15),
          faker.helpers.arrayElement(positions),
          faker.date.between({ from: '2022-01-01', to: new Date() }).toISOString().split('T')[0],
          faker.number.int({ min: 35000, max: 75000 }),
          faker.helpers.weightedArrayElement([
            { weight: 8, value: 'active' },
            { weight: 1, value: 'inactive' }
          ])
        ]);
        employees.push(employee.rows[0]);
      }
    }
    
    console.log('👥 Created 200 employees');
    
    // Create trucks (5 per company)
    const trucks = [];
    let truckCounter = 1;
    
    for (const company of companies) {
      const companyLocations = locations.filter(loc => loc.company_id === company.id);
      
      for (let i = 0; i < 5; i++) {
        const location = faker.helpers.arrayElement(companyLocations);
        const truck = await pool.query(`
          INSERT INTO trucks (
            company_id, location_id, truck_number, license_plate,
            model, year, capacity, status, last_maintenance, next_maintenance
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          RETURNING *
        `, [
          company.id,
          location.id,
          `${company.business_type.toUpperCase()}-${String(truckCounter++).padStart(3, '0')}`,
          faker.vehicle.vrm().substring(0, 15),
          faker.vehicle.model(),
          faker.number.int({ min: 2018, max: 2024 }),
          faker.number.int({ min: 100, max: 300 }),
          faker.helpers.arrayElement(['active', 'active', 'active', 'maintenance']),
          faker.date.recent({ days: 60 }).toISOString().split('T')[0],
          faker.date.future({ days: 60 }).toISOString().split('T')[0]
        ]);
        trucks.push(truck.rows[0]);
      }
    }
    
    console.log('🚚 Created 20 trucks');
    
    // Create inventory
    const iceCreamItems = [
      { name: 'Vanilla Cone', category: 'Ice Cream', price: 3.50 },
      { name: 'Chocolate Sundae', category: 'Ice Cream', price: 5.00 },
      { name: 'Strawberry Bar', category: 'Frozen Treats', price: 2.75 },
      { name: 'Milkshake', category: 'Beverages', price: 4.50 },
      { name: 'Popsicle', category: 'Frozen Treats', price: 2.00 }
    ];
    
    const burgerItems = [
      { name: 'Classic Burger', category: 'Burgers', price: 9.99 },
      { name: 'Cheeseburger', category: 'Burgers', price: 10.99 },
      { name: 'French Fries', category: 'Sides', price: 4.99 },
      { name: 'Soda', category: 'Beverages', price: 2.99 },
      { name: 'Chicken Nuggets', category: 'Sides', price: 6.99 }
    ];
    
    for (const truck of trucks) {
      const company = companies.find(c => c.id === truck.company_id);
      const items = company.business_type === 'ice_cream' ? iceCreamItems : burgerItems;
      
      for (const item of items) {
        await pool.query(`
          INSERT INTO inventory (
            truck_id, item_name, category, quantity, unit_price, reorder_level, last_restocked
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [
          truck.id,
          item.name,
          item.category,
          faker.number.int({ min: 10, max: 100 }),
          item.price,
          faker.number.int({ min: 15, max: 25 }),
          faker.date.recent({ days: 14 }).toISOString().split('T')[0]
        ]);
      }
    }
    
    console.log('📦 Created inventory for all trucks');
    
    // Create some sales (50 per active truck)
    let salesCount = 0;
    for (const truck of trucks.filter(t => t.status === 'active')) {
      const company = companies.find(c => c.id === truck.company_id);
      const truckEmployees = employees.filter(e => e.company_id === truck.company_id && e.status === 'active');
      
      for (let i = 0; i < 50; i++) {
        const employee = faker.helpers.arrayElement(truckEmployees);
        const saleDate = faker.date.recent({ days: 30 });
        const baseAmount = company.business_type === 'ice_cream' ? 
          faker.number.float({ min: 3.00, max: 15.00, fractionDigits: 2 }) :
          faker.number.float({ min: 8.99, max: 25.00, fractionDigits: 2 });
        
        await pool.query(`
          INSERT INTO sales (
            truck_id, employee_id, sale_date, sale_time,
            total_amount, payment_method, location_lat, location_lng
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [
          truck.id,
          employee.id,
          saleDate.toISOString().split('T')[0],
          saleDate.toTimeString().split(' ')[0].substring(0, 8),
          baseAmount,
          faker.helpers.arrayElement(['cash', 'card', 'mobile']),
          company.state === 'Washington' ? 
            faker.location.latitude({ min: 45.5, max: 49.0 }) : 
            faker.location.latitude({ min: 32.5, max: 42.0 }),
          company.state === 'Washington' ? 
            faker.location.longitude({ min: -124.7, max: -116.9 }) : 
            faker.location.longitude({ min: -124.4, max: -114.1 })
        ]);
        salesCount++;
      }
    }
    
    console.log(`💰 Created ${salesCount} sales records`);
    
    console.log('✅ Quick seed completed successfully!');
    console.log(`
📊 Summary:
   - Companies: 4 (2 ice cream in Washington, 2 burger in California)
   - Locations: 8
   - Employees: 200
   - Trucks: 20
   - Sales: ${salesCount}
    `);
    
  } catch (error) {
    console.error('❌ Error in quick seed:', error);
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  quickSeed();
}

module.exports = { quickSeed };