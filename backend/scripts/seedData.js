const pool = require('../config/database');
const { faker } = require('@faker-js/faker');

// Sample data for seeding
const washingtonCities = [
  'Seattle', 'Spokane', 'Tacoma', 'Vancouver', 'Bellevue', 'Kent', 'Everett', 
  'Renton', 'Federal Way', 'Yakima', 'Spokane Valley', 'Bellingham', 'Kennewick'
];

const californiaCities = [
  'Los Angeles', 'San Diego', 'San Jose', 'San Francisco', 'Fresno', 'Sacramento', 
  'Long Beach', 'Oakland', 'Bakersfield', 'Anaheim', 'Santa Ana', 'Riverside'
];

const iceCreamItems = [
  { name: 'Vanilla Cone', category: 'Ice Cream', price: 3.50 },
  { name: 'Chocolate Cone', category: 'Ice Cream', price: 3.50 },
  { name: 'Strawberry Cone', category: 'Ice Cream', price: 3.50 },
  { name: 'Ice Cream Sandwich', category: 'Ice Cream', price: 2.75 },
  { name: 'Popsicle', category: 'Frozen Treats', price: 2.00 },
  { name: 'Ice Cream Bar', category: 'Ice Cream', price: 4.00 },
  { name: 'Milkshake', category: 'Beverages', price: 5.50 },
  { name: 'Sundae', category: 'Ice Cream', price: 6.00 },
  { name: 'Frozen Yogurt', category: 'Frozen Treats', price: 4.25 },
  { name: 'Slush', category: 'Beverages', price: 3.00 }
];

const burgerItems = [
  { name: 'Classic Burger', category: 'Burgers', price: 8.99 },
  { name: 'Cheeseburger', category: 'Burgers', price: 9.99 },
  { name: 'Double Burger', category: 'Burgers', price: 12.99 },
  { name: 'Chicken Burger', category: 'Burgers', price: 10.99 },
  { name: 'Fish Burger', category: 'Burgers', price: 11.99 },
  { name: 'French Fries', category: 'Sides', price: 4.99 },
  { name: 'Onion Rings', category: 'Sides', price: 5.99 },
  { name: 'Soda', category: 'Beverages', price: 2.99 },
  { name: 'Milkshake', category: 'Beverages', price: 5.99 },
  { name: 'Chicken Nuggets', category: 'Sides', price: 6.99 }
];

const positions = [
  'Driver', 'Cashier', 'Cook', 'Manager', 'Assistant Manager', 'Supervisor',
  'Route Coordinator', 'Maintenance Technician', 'Sales Associate'
];

async function generateCompanies() {
  console.log('🏢 Creating companies...');
  
  // Ice cream companies in Washington
  const iceCompanies = [];
  for (let i = 0; i < 3; i++) {
    const result = await pool.query(`
      INSERT INTO companies (name, business_type, state, contact_email, contact_phone)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [
      `${faker.company.name()} Ice Cream Co.`,
      'ice_cream',
      'Washington',
      faker.internet.email(),
faker.phone.number().substring(0, 15)
    ]);
    iceCompanies.push(result.rows[0]);
  }

  // Burger companies in California
  const burgerCompanies = [];
  for (let i = 0; i < 2; i++) {
    const result = await pool.query(`
      INSERT INTO companies (name, business_type, state, contact_email, contact_phone)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [
      `${faker.company.name()} Burger Co.`,
      'burger',
      'California',
      faker.internet.email(),
faker.phone.number().substring(0, 15)
    ]);
    burgerCompanies.push(result.rows[0]);
  }

  return { iceCompanies, burgerCompanies };
}

async function generateLocations(companies) {
  console.log('📍 Creating locations...');
  
  const locations = [];
  
  // Ice cream locations in Washington
  for (const company of companies.iceCompanies) {
    const numLocations = faker.number.int({ min: 2, max: 4 });
    for (let i = 0; i < numLocations; i++) {
      const city = faker.helpers.arrayElement(washingtonCities);
      const result = await pool.query(`
        INSERT INTO locations (company_id, name, address, city, state, zip_code, latitude, longitude)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `, [
        company.id,
        `${city} Location`,
        faker.location.streetAddress(),
        city,
        'Washington',
        faker.location.zipCode(),
        faker.location.latitude({ min: 45.5, max: 49.0 }),
        faker.location.longitude({ min: -124.7, max: -116.9 })
      ]);
      locations.push(result.rows[0]);
    }
  }

  // Burger locations in California
  for (const company of companies.burgerCompanies) {
    const numLocations = faker.number.int({ min: 3, max: 5 });
    for (let i = 0; i < numLocations; i++) {
      const city = faker.helpers.arrayElement(californiaCities);
      const result = await pool.query(`
        INSERT INTO locations (company_id, name, address, city, state, zip_code, latitude, longitude)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `, [
        company.id,
        `${city} Branch`,
        faker.location.streetAddress(),
        city,
        'California',
        faker.location.zipCode(),
        faker.location.latitude({ min: 32.5, max: 42.0 }),
        faker.location.longitude({ min: -124.4, max: -114.1 })
      ]);
      locations.push(result.rows[0]);
    }
  }

  return locations;
}

async function generateEmployees(companies, locations) {
  console.log('👥 Creating 1000 employees...');
  
  const employees = [];
  const allCompanies = [...companies.iceCompanies, ...companies.burgerCompanies];
  
  for (let i = 0; i < 1000; i++) {
    const company = faker.helpers.arrayElement(allCompanies);
    const companyLocations = locations.filter(loc => loc.company_id === company.id);
    const location = companyLocations.length > 0 ? faker.helpers.arrayElement(companyLocations) : null;
    
    const hireDate = faker.date.between({ 
      from: new Date('2020-01-01'), 
      to: new Date() 
    });
    
    const result = await pool.query(`
      INSERT INTO employees (
        company_id, location_id, employee_id, first_name, last_name,
        email, phone, position, hire_date, salary, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `, [
      company.id,
      location?.id || null,
      `EMP${String(i + 1).padStart(4, '0')}`,
      faker.person.firstName(),
      faker.person.lastName(),
      faker.internet.email(),
faker.phone.number().substring(0, 15),
      faker.helpers.arrayElement(positions),
      hireDate.toISOString().split('T')[0],
      faker.number.int({ min: 30000, max: 80000 }),
      faker.helpers.arrayElement(['active', 'active', 'active', 'active', 'inactive'])
    ]);
    employees.push(result.rows[0]);
    
    if ((i + 1) % 100 === 0) {
      console.log(`   Created ${i + 1} employees...`);
    }
  }

  return employees;
}

async function generateTrucks(companies, locations) {
  console.log('🚚 Creating trucks...');
  
  const trucks = [];
  const allCompanies = [...companies.iceCompanies, ...companies.burgerCompanies];
  let truckCounter = 1;
  
  for (const company of allCompanies) {
    const companyLocations = locations.filter(loc => loc.company_id === company.id);
    const numTrucks = faker.number.int({ min: 3, max: 8 });
    
    for (let i = 0; i < numTrucks; i++) {
      const location = companyLocations.length > 0 ? faker.helpers.arrayElement(companyLocations) : null;
      const year = faker.number.int({ min: 2015, max: 2024 });
      
      const result = await pool.query(`
        INSERT INTO trucks (
          company_id, location_id, truck_number, license_plate,
          model, year, capacity, status, last_maintenance, next_maintenance
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `, [
        company.id,
        location?.id || null,
        `${company.business_type.toUpperCase()}-${String(truckCounter++).padStart(3, '0')}`,
        faker.vehicle.vrm(),
        faker.vehicle.model(),
        year,
        faker.number.int({ min: 50, max: 200 }),
        faker.helpers.arrayElement(['active', 'active', 'active', 'maintenance']),
        faker.date.recent({ days: 90 }).toISOString().split('T')[0],
        faker.date.future({ days: 90 }).toISOString().split('T')[0]
      ]);
      trucks.push(result.rows[0]);
    }
  }

  return trucks;
}

async function generateInventory(trucks, companies) {
  console.log('📦 Creating inventory...');
  
  for (const truck of trucks) {
    const company = [...companies.iceCompanies, ...companies.burgerCompanies]
      .find(c => c.id === truck.company_id);
    
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
        faker.number.int({ min: 5, max: 100 }),
        item.price,
        faker.number.int({ min: 10, max: 30 }),
        faker.date.recent({ days: 30 }).toISOString().split('T')[0]
      ]);
    }
  }
}

async function generateRoutes(trucks, employees) {
  console.log('🗺️ Creating routes...');
  
  const routes = [];
  
  for (const truck of trucks.filter(t => t.status === 'active')) {
    const truckEmployees = employees.filter(e => 
      e.company_id === truck.company_id && 
      e.status === 'active' && 
      ['Driver', 'Manager'].includes(e.position)
    );
    
    const numRoutes = faker.number.int({ min: 5, max: 15 });
    
    for (let i = 0; i < numRoutes; i++) {
      const employee = truckEmployees.length > 0 ? faker.helpers.arrayElement(truckEmployees) : null;
      const routeDate = faker.date.between({ 
        from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 
        to: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) 
      });
      
      const result = await pool.query(`
        INSERT INTO routes (
          truck_id, employee_id, route_name, start_location, end_location,
          estimated_duration, route_date, status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `, [
        truck.id,
        employee?.id || null,
        `Route ${faker.location.cardinalDirection()} ${faker.number.int({ min: 1, max: 10 })}`,
        faker.location.streetAddress(),
        faker.location.streetAddress(),
        faker.number.int({ min: 60, max: 480 }), // 1-8 hours
        routeDate.toISOString().split('T')[0],
        routeDate < new Date() ? 
          faker.helpers.arrayElement(['completed', 'completed', 'completed', 'cancelled']) : 
          faker.helpers.arrayElement(['planned', 'in_progress'])
      ]);
      routes.push(result.rows[0]);
    }
  }

  return routes;
}

async function generateSales(trucks, employees, routes, companies) {
  console.log('💰 Creating sales data...');
  
  for (const truck of trucks.filter(t => t.status === 'active')) {
    const company = [...companies.iceCompanies, ...companies.burgerCompanies]
      .find(c => c.id === truck.company_id);
    
    const truckEmployees = employees.filter(e => 
      e.company_id === truck.company_id && e.status === 'active'
    );
    
    const truckRoutes = routes.filter(r => 
      r.truck_id === truck.id && r.status === 'completed'
    );
    
    const numSales = faker.number.int({ min: 50, max: 200 });
    
    for (let i = 0; i < numSales; i++) {
      const employee = truckEmployees.length > 0 ? faker.helpers.arrayElement(truckEmployees) : null;
      const route = truckRoutes.length > 0 ? faker.helpers.arrayElement(truckRoutes) : null;
      
      const saleDate = faker.date.between({ 
        from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), 
        to: new Date() 
      });
      
      const baseAmount = company.business_type === 'ice_cream' ? 
        faker.number.float({ min: 2.00, max: 15.00, fractionDigits: 2 }) :
        faker.number.float({ min: 8.99, max: 35.00, fractionDigits: 2 });
      
      await pool.query(`
        INSERT INTO sales (
          truck_id, employee_id, route_id, sale_date, sale_time,
          total_amount, payment_method, location_lat, location_lng
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        truck.id,
        employee?.id || null,
        route?.id || null,
        saleDate.toISOString().split('T')[0],
        faker.date.recent({ days: 1 }).toTimeString().split(' ')[0],
        baseAmount,
        faker.helpers.arrayElement(['cash', 'card', 'mobile']),
        company.state === 'Washington' ? 
          faker.location.latitude({ min: 45.5, max: 49.0 }) : 
          faker.location.latitude({ min: 32.5, max: 42.0 }),
        company.state === 'Washington' ? 
          faker.location.longitude({ min: -124.7, max: -116.9 }) : 
          faker.location.longitude({ min: -124.4, max: -114.1 })
      ]);
    }
    
    console.log(`   Created sales for truck ${truck.truck_number}`);
  }
}

async function main() {
  try {
    console.log('🌱 Starting data seeding...');
    
    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await pool.query('TRUNCATE TABLE sales, inventory, routes, trucks, employees, locations, companies CASCADE');
    
    // Generate data
    const companies = await generateCompanies();
    const locations = await generateLocations(companies);
    const employees = await generateEmployees(companies, locations);
    const trucks = await generateTrucks(companies, locations);
    await generateInventory(trucks, companies);
    const routes = await generateRoutes(trucks, employees);
    await generateSales(trucks, employees, routes, companies);
    
    console.log('✅ Data seeding completed successfully!');
    console.log(`
📊 Summary:
   - Companies: ${companies.iceCompanies.length + companies.burgerCompanies.length}
   - Locations: ${locations.length}
   - Employees: 1000
   - Trucks: ${trucks.length}
   - Ice Cream Companies (Washington): ${companies.iceCompanies.length}
   - Burger Companies (California): ${companies.burgerCompanies.length}
    `);
    
  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main };