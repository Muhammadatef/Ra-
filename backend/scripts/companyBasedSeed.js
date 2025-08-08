const bcrypt = require('bcryptjs');
const pool = require('../config/database');

const companyBasedSeed = async () => {
  try {
    console.log('🚀 Starting comprehensive company-based seeding...');

    // Clear existing data
    await pool.query('TRUNCATE users, truck_sessions, sales, routes, inventory, trucks, employees, locations, companies RESTART IDENTITY CASCADE');
    console.log('📝 Cleared existing data');

    // Seed Companies
    const companies = [
      {
        name: 'Golden State Ice Cream Co.',
        business_type: 'ice_cream',
        state: 'California',
        contact_email: 'admin@goldenstate-ic.com'
      },
      {
        name: 'Texas Burger Express',
        business_type: 'burger',
        state: 'Texas',
        contact_email: 'admin@texasburger.com'
      },
      {
        name: 'Northeast Ice Cream Co.',
        business_type: 'ice_cream',
        state: 'New York',
        contact_email: 'admin@northeast-ice.com'
      }
    ];

    const companyIds = {};
    for (const company of companies) {
      const result = await pool.query(`
        INSERT INTO companies (name, business_type, state, contact_email)
        VALUES ($1, $2, $3, $4)
        RETURNING id
      `, [company.name, company.business_type, company.state, company.contact_email]);
      companyIds[company.name] = result.rows[0].id;
      console.log(`✅ Created company: ${company.name}`);
    }

    // Create admin users for each company
    const adminUsers = [
      {
        companyName: 'Golden State Ice Cream Co.',
        username: 'admin_golden',
        email: 'admin@goldenstate-ic.com',
        password: 'admin123',
        firstName: 'John',
        lastName: 'Martinez'
      },
      {
        companyName: 'Texas Burger Express',
        username: 'admin_texas',
        email: 'admin@texasburger.com',
        password: 'admin123',
        firstName: 'Sarah',
        lastName: 'Johnson'
      },
      {
        companyName: 'Northeast Ice Cream Co.',
        username: 'admin_northeast',
        email: 'admin@northeast-ice.com',
        password: 'admin123',
        firstName: 'Mike',
        lastName: 'Thompson'
      }
    ];

    const userIds = {};
    for (const user of adminUsers) {
      const passwordHash = await bcrypt.hash(user.password, 12);
      const result = await pool.query(`
        INSERT INTO users (company_id, username, email, password_hash, first_name, last_name, role)
        VALUES ($1, $2, $3, $4, $5, $6, 'admin')
        RETURNING id
      `, [companyIds[user.companyName], user.username, user.email, passwordHash, user.firstName, user.lastName]);
      userIds[user.username] = result.rows[0].id;
      console.log(`👤 Created admin user: ${user.username} for ${user.companyName}`);
    }

    // Seed Locations for each company
    const locations = [
      // Golden State Ice Cream Co.
      {
        companyName: 'Golden State Ice Cream Co.',
        name: 'Downtown LA Hub',
        address: '123 Main St',
        city: 'Los Angeles',
        state: 'California',
        zip_code: '90001'
      },
      {
        companyName: 'Golden State Ice Cream Co.',
        name: 'San Diego Branch',
        address: '456 Beach Ave',
        city: 'San Diego',
        state: 'California',
        zip_code: '92101'
      },
      // Texas Burger Express
      {
        companyName: 'Texas Burger Express',
        name: 'Dallas Central',
        address: '789 Cowboy Way',
        city: 'Dallas',
        state: 'Texas',
        zip_code: '75201'
      },
      {
        companyName: 'Texas Burger Express',
        name: 'Houston Hub',
        address: '321 Oil St',
        city: 'Houston',
        state: 'Texas',
        zip_code: '77001'
      },
      // Northeast Ice Cream Co.
      {
        companyName: 'Northeast Ice Cream Co.',
        name: 'Manhattan Central',
        address: '654 Broadway',
        city: 'New York',
        state: 'New York',
        zip_code: '10001'
      }
    ];

    const locationIds = {};
    for (const location of locations) {
      const result = await pool.query(`
        INSERT INTO locations (company_id, name, address, city, state, zip_code)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
      `, [companyIds[location.companyName], location.name, location.address, location.city, location.state, location.zip_code]);
      locationIds[`${location.companyName}_${location.name}`] = result.rows[0].id;
      console.log(`📍 Created location: ${location.name} for ${location.companyName}`);
    }

    // Seed Employees for each company
    const employees = [
      // Golden State Ice Cream Co. employees
      {
        companyName: 'Golden State Ice Cream Co.',
        locationName: 'Downtown LA Hub',
        employee_id: 'GS001',
        first_name: 'Maria',
        last_name: 'Rodriguez',
        email: 'maria@goldenstate-ic.com',
        phone: '555-0101',
        position: 'Ice Cream Driver',
        hire_date: '2023-03-15',
        salary: 45000
      },
      {
        companyName: 'Golden State Ice Cream Co.',
        locationName: 'Downtown LA Hub',
        employee_id: 'GS002',
        first_name: 'David',
        last_name: 'Chen',
        email: 'david@goldenstate-ic.com',
        phone: '555-0102',
        position: 'Route Manager',
        hire_date: '2023-01-20',
        salary: 55000
      },
      {
        companyName: 'Golden State Ice Cream Co.',
        locationName: 'San Diego Branch',
        employee_id: 'GS003',
        first_name: 'Lisa',
        last_name: 'Wilson',
        email: 'lisa@goldenstate-ic.com',
        phone: '555-0103',
        position: 'Ice Cream Driver',
        hire_date: '2023-04-10',
        salary: 42000
      },
      {
        companyName: 'Golden State Ice Cream Co.',
        locationName: 'San Diego Branch',
        employee_id: 'GS004',
        first_name: 'Carlos',
        last_name: 'Mendez',
        email: 'carlos@goldenstate-ic.com',
        phone: '555-0104',
        position: 'Ice Cream Driver',
        hire_date: '2023-05-01',
        salary: 44000
      },

      // Texas Burger Express employees
      {
        companyName: 'Texas Burger Express',
        locationName: 'Dallas Central',
        employee_id: 'TB001',
        first_name: 'Jake',
        last_name: 'Thompson',
        email: 'jake@texasburger.com',
        phone: '555-0201',
        position: 'Burger Truck Driver',
        hire_date: '2023-02-01',
        salary: 48000
      },
      {
        companyName: 'Texas Burger Express',
        locationName: 'Dallas Central',
        employee_id: 'TB002',
        first_name: 'Emily',
        last_name: 'Davis',
        email: 'emily@texasburger.com',
        phone: '555-0202',
        position: 'Kitchen Manager',
        hire_date: '2023-01-15',
        salary: 52000
      },
      {
        companyName: 'Texas Burger Express',
        locationName: 'Houston Hub',
        employee_id: 'TB003',
        first_name: 'Michael',
        last_name: 'Brown',
        email: 'michael@texasburger.com',
        phone: '555-0203',
        position: 'Burger Truck Driver',
        hire_date: '2023-03-01',
        salary: 46000
      },
      {
        companyName: 'Texas Burger Express',
        locationName: 'Houston Hub',
        employee_id: 'TB004',
        first_name: 'Ashley',
        last_name: 'Garcia',
        email: 'ashley@texasburger.com',
        phone: '555-0204',
        position: 'Burger Truck Driver',
        hire_date: '2023-04-15',
        salary: 47000
      },

      // Northeast Ice Cream Co. employees
      {
        companyName: 'Northeast Ice Cream Co.',
        locationName: 'Manhattan Central',
        employee_id: 'NE001',
        first_name: 'Robert',
        last_name: 'Smith',
        email: 'robert@northeast-ice.com',
        phone: '555-0301',
        position: 'Ice Cream Driver',
        hire_date: '2023-01-10',
        salary: 50000
      },
      {
        companyName: 'Northeast Ice Cream Co.',
        locationName: 'Manhattan Central',
        employee_id: 'NE002',
        first_name: 'Jennifer',
        last_name: 'Lee',
        email: 'jennifer@northeast-ice.com',
        phone: '555-0302',
        position: 'Route Supervisor',
        hire_date: '2022-12-01',
        salary: 58000
      },
      {
        companyName: 'Northeast Ice Cream Co.',
        locationName: 'Manhattan Central',
        employee_id: 'NE003',
        first_name: 'Antonio',
        last_name: 'Rossi',
        email: 'antonio@northeast-ice.com',
        phone: '555-0303',
        position: 'Ice Cream Driver',
        hire_date: '2023-02-15',
        salary: 49000
      }
    ];

    const employeeIds = {};
    for (const employee of employees) {
      const locationId = locationIds[`${employee.companyName}_${employee.locationName}`];
      const result = await pool.query(`
        INSERT INTO employees (company_id, location_id, employee_id, first_name, last_name, email, phone, position, hire_date, salary, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'active')
        RETURNING id
      `, [companyIds[employee.companyName], locationId, employee.employee_id, employee.first_name, employee.last_name, employee.email, employee.phone, employee.position, employee.hire_date, employee.salary]);
      employeeIds[employee.employee_id] = result.rows[0].id;
      console.log(`👷 Created employee: ${employee.first_name} ${employee.last_name} (${employee.employee_id})`);
    }

    // Seed Trucks for each company
    const trucks = [
      // Golden State Ice Cream Co. trucks
      {
        companyName: 'Golden State Ice Cream Co.',
        locationName: 'Downtown LA Hub',
        truck_number: 'GS-ICE-001',
        license_plate: 'CA-ICE001',
        model: 'Ford Ice Cream Van',
        year: 2022,
        capacity: 500
      },
      {
        companyName: 'Golden State Ice Cream Co.',
        locationName: 'Downtown LA Hub',
        truck_number: 'GS-ICE-002',
        license_plate: 'CA-ICE002',
        model: 'Chevy Ice Cream Truck',
        year: 2021,
        capacity: 450
      },
      {
        companyName: 'Golden State Ice Cream Co.',
        locationName: 'San Diego Branch',
        truck_number: 'GS-ICE-003',
        license_plate: 'CA-ICE003',
        model: 'Ford Ice Cream Van',
        year: 2023,
        capacity: 550
      },

      // Texas Burger Express trucks
      {
        companyName: 'Texas Burger Express',
        locationName: 'Dallas Central',
        truck_number: 'TX-BUR-001',
        license_plate: 'TX-BUR001',
        model: 'Ford Food Truck',
        year: 2022,
        capacity: 300
      },
      {
        companyName: 'Texas Burger Express',
        locationName: 'Dallas Central',
        truck_number: 'TX-BUR-002',
        license_plate: 'TX-BUR002',
        model: 'Mercedes Food Truck',
        year: 2023,
        capacity: 350
      },
      {
        companyName: 'Texas Burger Express',
        locationName: 'Houston Hub',
        truck_number: 'TX-BUR-003',
        license_plate: 'TX-BUR003',
        model: 'Ford Food Truck',
        year: 2021,
        capacity: 280
      },

      // Northeast Ice Cream Co. trucks
      {
        companyName: 'Northeast Ice Cream Co.',
        locationName: 'Manhattan Central',
        truck_number: 'NY-ICE-001',
        license_plate: 'NY-ICE001',
        model: 'Ford Ice Cream Van',
        year: 2023,
        capacity: 600
      },
      {
        companyName: 'Northeast Ice Cream Co.',
        locationName: 'Manhattan Central',
        truck_number: 'NY-ICE-002',
        license_plate: 'NY-ICE002',
        model: 'Isuzu Ice Cream Truck',
        year: 2022,
        capacity: 580
      }
    ];

    const truckIds = {};
    for (const truck of trucks) {
      const locationId = locationIds[`${truck.companyName}_${truck.locationName}`];
      const result = await pool.query(`
        INSERT INTO trucks (company_id, location_id, truck_number, license_plate, model, year, capacity, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'active')
        RETURNING id
      `, [companyIds[truck.companyName], locationId, truck.truck_number, truck.license_plate, truck.model, truck.year, truck.capacity]);
      truckIds[truck.truck_number] = result.rows[0].id;
      console.log(`🚛 Created truck: ${truck.truck_number} for ${truck.companyName}`);
    }

    // Generate Sales Data for the last 6 months for each company
    console.log('💰 Generating sales data...');
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 6);

    const salesData = [];
    
    // Golden State Ice Cream Co. sales patterns
    const goldernStateEmployees = ['GS001', 'GS002', 'GS003', 'GS004'];
    const goldenStateTrucks = ['GS-ICE-001', 'GS-ICE-002', 'GS-ICE-003'];
    
    for (let i = 0; i < 180; i++) { // 6 months of data
      const saleDate = new Date(startDate);
      saleDate.setDate(startDate.getDate() + i);
      
      // Generate 3-8 sales per day per truck for Golden State
      for (const truckNumber of goldenStateTrucks) {
        const dailySales = Math.floor(Math.random() * 6) + 3;
        for (let j = 0; j < dailySales; j++) {
          const saleTime = `${Math.floor(Math.random() * 10) + 9}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}:00`;
          const totalAmount = Math.floor(Math.random() * 30) + 5; // $5-$35
          const tipAmount = Math.floor(Math.random() * 8) + 1; // $1-$8 tips
          const paymentMethod = Math.random() > 0.6 ? 'card' : 'cash';
          const cashAmount = paymentMethod === 'cash' ? totalAmount : 0;
          const cardAmount = paymentMethod === 'card' ? totalAmount : 0;
          
          salesData.push({
            truck_id: truckIds[truckNumber],
            employee_id: employeeIds[goldernStateEmployees[Math.floor(Math.random() * goldernStateEmployees.length)]],
            sale_date: saleDate.toISOString().split('T')[0],
            sale_time: saleTime,
            total_amount: totalAmount,
            tips_amount: tipAmount,
            cash_amount: cashAmount,
            card_amount: cardAmount,
            payment_method: paymentMethod
          });
        }
      }
    }

    // Texas Burger Express sales patterns (higher volume, higher prices)
    const texasEmployees = ['TB001', 'TB002', 'TB003', 'TB004'];
    const texasTrucks = ['TX-BUR-001', 'TX-BUR-002', 'TX-BUR-003'];
    
    for (let i = 0; i < 180; i++) {
      const saleDate = new Date(startDate);
      saleDate.setDate(startDate.getDate() + i);
      
      for (const truckNumber of texasTrucks) {
        const dailySales = Math.floor(Math.random() * 8) + 5; // 5-12 sales per day
        for (let j = 0; j < dailySales; j++) {
          const saleTime = `${Math.floor(Math.random() * 8) + 11}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}:00`;
          const totalAmount = Math.floor(Math.random() * 25) + 15; // $15-$40 (burgers cost more)
          const tipAmount = Math.floor(Math.random() * 5) + 2; // $2-$6 tips
          const paymentMethod = Math.random() > 0.4 ? 'card' : 'cash';
          const cashAmount = paymentMethod === 'cash' ? totalAmount : 0;
          const cardAmount = paymentMethod === 'card' ? totalAmount : 0;
          
          salesData.push({
            truck_id: truckIds[truckNumber],
            employee_id: employeeIds[texasEmployees[Math.floor(Math.random() * texasEmployees.length)]],
            sale_date: saleDate.toISOString().split('T')[0],
            sale_time: saleTime,
            total_amount: totalAmount,
            tips_amount: tipAmount,
            cash_amount: cashAmount,
            card_amount: cardAmount,
            payment_method: paymentMethod
          });
        }
      }
    }

    // Northeast Ice Cream Co. sales patterns (premium pricing)
    const northeastEmployees = ['NE001', 'NE002', 'NE003'];
    const northeastTrucks = ['NY-ICE-001', 'NY-ICE-002'];
    
    for (let i = 0; i < 180; i++) {
      const saleDate = new Date(startDate);
      saleDate.setDate(startDate.getDate() + i);
      
      for (const truckNumber of northeastTrucks) {
        const dailySales = Math.floor(Math.random() * 7) + 4; // 4-10 sales per day
        for (let j = 0; j < dailySales; j++) {
          const saleTime = `${Math.floor(Math.random() * 9) + 10}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}:00`;
          const totalAmount = Math.floor(Math.random() * 40) + 8; // $8-$48 (premium NYC pricing)
          const tipAmount = Math.floor(Math.random() * 12) + 2; // $2-$13 tips (NYC tips higher)
          const paymentMethod = Math.random() > 0.3 ? 'card' : 'cash'; // NYC uses more cards
          const cashAmount = paymentMethod === 'cash' ? totalAmount : 0;
          const cardAmount = paymentMethod === 'card' ? totalAmount : 0;
          
          salesData.push({
            truck_id: truckIds[truckNumber],
            employee_id: employeeIds[northeastEmployees[Math.floor(Math.random() * northeastEmployees.length)]],
            sale_date: saleDate.toISOString().split('T')[0],
            sale_time: saleTime,
            total_amount: totalAmount,
            tips_amount: tipAmount,
            cash_amount: cashAmount,
            card_amount: cardAmount,
            payment_method: paymentMethod
          });
        }
      }
    }

    // Insert all sales data
    for (const sale of salesData) {
      await pool.query(`
        INSERT INTO sales (truck_id, employee_id, sale_date, sale_time, total_amount, tips_amount, cash_amount, card_amount, payment_method)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [sale.truck_id, sale.employee_id, sale.sale_date, sale.sale_time, sale.total_amount, sale.tips_amount, sale.cash_amount, sale.card_amount, sale.payment_method]);
    }

    console.log(`💰 Generated ${salesData.length} sales records`);

    // Generate some basic inventory for each truck
    const inventoryItems = {
      ice_cream: [
        { name: 'Vanilla Ice Cream Bars', category: 'Ice Cream', price: 3.50 },
        { name: 'Chocolate Ice Cream Sandwiches', category: 'Ice Cream', price: 4.00 },
        { name: 'Strawberry Popsicles', category: 'Popsicles', price: 2.50 },
        { name: 'Orange Creamsicles', category: 'Popsicles', price: 2.75 },
        { name: 'Ice Cream Cones', category: 'Supplies', price: 0.50 }
      ],
      burger: [
        { name: 'Beef Burger Patties', category: 'Meat', price: 2.50 },
        { name: 'Chicken Breast', category: 'Meat', price: 3.00 },
        { name: 'Burger Buns', category: 'Supplies', price: 0.75 },
        { name: 'French Fries', category: 'Sides', price: 1.50 },
        { name: 'Soda Cans', category: 'Beverages', price: 1.00 }
      ]
    };

    // Add inventory for each truck based on business type
    for (const [truckNumber, truckId] of Object.entries(truckIds)) {
      let businessType;
      if (truckNumber.includes('ICE')) {
        businessType = 'ice_cream';
      } else if (truckNumber.includes('BUR')) {
        businessType = 'burger';
      }

      const items = inventoryItems[businessType] || [];
      for (const item of items) {
        const quantity = Math.floor(Math.random() * 50) + 10; // 10-59 items
        await pool.query(`
          INSERT INTO inventory (truck_id, item_name, category, quantity, unit_price, reorder_level)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [truckId, item.name, item.category, quantity, item.price, 15]);
      }
    }

    console.log('📦 Generated inventory data');
    console.log('🎉 Company-based seeding completed successfully!');
    
    console.log('\n📋 Summary:');
    console.log(`- Created ${companies.length} companies`);
    console.log(`- Created ${adminUsers.length} admin users`);
    console.log(`- Created ${locations.length} locations`);
    console.log(`- Created ${employees.length} employees`);
    console.log(`- Created ${trucks.length} trucks`);
    console.log(`- Generated ${salesData.length} sales records`);
    
    console.log('\n🔐 Admin Login Credentials:');
    adminUsers.forEach(user => {
      console.log(`${user.companyName}:`);
      console.log(`  Username: ${user.username}`);
      console.log(`  Password: ${user.password}`);
      console.log(`  Email: ${user.email}`);
    });

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
};

// Run if called directly
if (require.main === module) {
  companyBasedSeed()
    .then(() => {
      console.log('✅ Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = companyBasedSeed;