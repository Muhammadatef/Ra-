const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');
const csv = require('csv-parser');
const fs = require('fs');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Apply authentication - only admins can import data
router.use(authenticateToken);
router.use(requireRole(['admin']));

// Import employees from CSV
router.post('/employees', upload.single('csvFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'CSV file is required' });
    }

    const employees = [];
    const errors = [];
    let lineCount = 0;

    // Read and parse CSV
    await new Promise((resolve, reject) => {
      fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (row) => {
          lineCount++;
          try {
            // Validate required fields
            if (!row.first_name || !row.last_name || !row.email || !row.position) {
              errors.push(`Line ${lineCount}: Missing required fields (first_name, last_name, email, position)`);
              return;
            }

            // Generate employee ID
            const employee_id = `EMP${req.user.company_id.substring(0, 3)}${String(lineCount).padStart(3, '0')}`;

            employees.push({
              company_id: req.user.company_id,
              employee_id,
              first_name: row.first_name.trim(),
              last_name: row.last_name.trim(),
              email: row.email.trim().toLowerCase(),
              phone: row.phone ? row.phone.trim() : null,
              position: row.position.trim(),
              hire_date: row.hire_date ? new Date(row.hire_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
              salary: row.salary ? parseFloat(row.salary) : 40000,
              status: row.status || 'active'
            });
          } catch (error) {
            errors.push(`Line ${lineCount}: ${error.message}`);
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    if (errors.length > 0) {
      return res.status(400).json({ 
        error: 'CSV validation failed', 
        details: errors,
        validRows: employees.length 
      });
    }

    if (employees.length === 0) {
      return res.status(400).json({ error: 'No valid employees found in CSV' });
    }

    // Insert employees into database
    let successCount = 0;
    const insertErrors = [];

    for (const employee of employees) {
      try {
        await pool.query(`
          INSERT INTO employees (
            company_id, employee_id, first_name, last_name, email, phone,
            position, hire_date, salary, status
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `, [
          employee.company_id, employee.employee_id, employee.first_name,
          employee.last_name, employee.email, employee.phone, employee.position,
          employee.hire_date, employee.salary, employee.status
        ]);
        successCount++;
      } catch (error) {
        if (error.code === '23505') { // Unique constraint violation
          insertErrors.push(`Employee ${employee.first_name} ${employee.last_name}: Email or employee ID already exists`);
        } else {
          insertErrors.push(`Employee ${employee.first_name} ${employee.last_name}: ${error.message}`);
        }
      }
    }

    res.json({
      message: 'Employee import completed',
      totalRows: employees.length,
      successCount,
      errorCount: insertErrors.length,
      errors: insertErrors
    });

  } catch (error) {
    // Clean up file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Employee import error:', error);
    res.status(500).json({ error: 'Failed to import employees' });
  }
});

// Import trucks from CSV
router.post('/trucks', upload.single('csvFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'CSV file is required' });
    }

    const trucks = [];
    const errors = [];
    let lineCount = 0;

    // Read and parse CSV
    await new Promise((resolve, reject) => {
      fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (row) => {
          lineCount++;
          try {
            // Validate required fields
            if (!row.truck_number || !row.license_plate || !row.model || !row.year) {
              errors.push(`Line ${lineCount}: Missing required fields (truck_number, license_plate, model, year)`);
              return;
            }

            trucks.push({
              company_id: req.user.company_id,
              truck_number: row.truck_number.trim(),
              license_plate: row.license_plate.trim().toUpperCase(),
              model: row.model.trim(),
              year: parseInt(row.year),
              capacity: row.capacity ? parseInt(row.capacity) : 100,
              status: row.status || 'active',
              last_maintenance: row.last_maintenance ? new Date(row.last_maintenance).toISOString().split('T')[0] : null,
              next_maintenance: row.next_maintenance ? new Date(row.next_maintenance).toISOString().split('T')[0] : null
            });
          } catch (error) {
            errors.push(`Line ${lineCount}: ${error.message}`);
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    if (errors.length > 0) {
      return res.status(400).json({ 
        error: 'CSV validation failed', 
        details: errors,
        validRows: trucks.length 
      });
    }

    if (trucks.length === 0) {
      return res.status(400).json({ error: 'No valid trucks found in CSV' });
    }

    // Insert trucks into database
    let successCount = 0;
    const insertErrors = [];

    for (const truck of trucks) {
      try {
        await pool.query(`
          INSERT INTO trucks (
            company_id, truck_number, license_plate, model, year, capacity,
            status, last_maintenance, next_maintenance
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `, [
          truck.company_id, truck.truck_number, truck.license_plate,
          truck.model, truck.year, truck.capacity, truck.status,
          truck.last_maintenance, truck.next_maintenance
        ]);
        successCount++;
      } catch (error) {
        if (error.code === '23505') { // Unique constraint violation
          insertErrors.push(`Truck ${truck.truck_number}: Truck number or license plate already exists`);
        } else {
          insertErrors.push(`Truck ${truck.truck_number}: ${error.message}`);
        }
      }
    }

    res.json({
      message: 'Truck import completed',
      totalRows: trucks.length,
      successCount,
      errorCount: insertErrors.length,
      errors: insertErrors
    });

  } catch (error) {
    // Clean up file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Truck import error:', error);
    res.status(500).json({ error: 'Failed to import trucks' });
  }
});

// Get CSV template for employees
router.get('/templates/employees.csv', (req, res) => {
  const csvContent = `first_name,last_name,email,phone,position,hire_date,salary,status
John,Doe,john.doe@company.com,+1-555-0123,Driver,2023-01-15,45000,active
Jane,Smith,jane.smith@company.com,+1-555-0124,Manager,2022-05-10,60000,active`;

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="employees_template.csv"');
  res.send(csvContent);
});

// Get CSV template for trucks
router.get('/templates/trucks.csv', (req, res) => {
  const csvContent = `truck_number,license_plate,model,year,capacity,status,last_maintenance,next_maintenance
ICE-001,ABC123,Ford Ice Cream Van,2022,500,active,2024-01-15,2024-04-15
ICE-002,DEF456,Chevy Ice Cream Truck,2023,450,active,2024-02-01,2024-05-01`;

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="trucks_template.csv"');
  res.send(csvContent);
});

module.exports = router;