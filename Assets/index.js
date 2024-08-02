const inquirer = require('inquirer');
const { Client } = require('pg');


const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'employees_db',
  password: 'msmartinisgreat9',
  port: 5432,
});


function connectToDatabase(callback) {
  client.connect(err => {
    if (err) {
      console.error('Database connection error:', err.stack);
    } else {
      console.log('Connected to database');
      callback();
    }
  });
}


function displayOptions() {
  inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        'View all departments',
        'View all roles',
        'View all employees',
        'Add a department',
        'Add a role',
        'Add an employee',
        'Update an employee role',
        'Exit'
      ],
    }
  ]).then(answers => {
    switch (answers.action) {
      case 'View all departments':
        viewAllDepartments();
        break;
      case 'View all roles':
        viewAllRoles();
        break;
      case 'View all employees':
        viewAllEmployees();
        break;
      case 'Add a department':
        addDepartment();
        break;
      case 'Add a role':
        addRole();
        break;
      case 'Add an employee':
        addEmployee();
        break;
      case 'Update an employee role':
        updateEmployeeRole();
        break;
      case 'Exit':
        client.end();
        break;
      default:
        console.log('Invalid option');
        displayOptions();
        break;
    }
  });
}

// view all departments
function viewAllDepartments() {
  client.query('SELECT id, name FROM department', (err, res) => {
    if (err) {
      console.error('Error fetching departments:', err.stack);
    } else {
      console.table(res.rows);
      displayOptions();
    }
  });
}

//  view all roles
function viewAllRoles() {
  client.query(
    'SELECT r.id, r.title, r.salary, d.name AS department FROM role r JOIN department d ON r.department_id = d.id',
    (err, res) => {
      if (err) {
        console.error('Error fetching roles:', err.stack);
      } else {
        console.table(res.rows);
        displayOptions();
      }
    }
  );
}

//  view all employees
function viewAllEmployees() {
  client.query(
    'SELECT e.id, e.first_name, e.last_name, r.title AS role, d.name AS department, r.salary, m.first_name AS manager FROM employee e LEFT JOIN role r ON e.role_id = r.id LEFT JOIN department d ON r.department_id = d.id LEFT JOIN employee m ON e.manager_id = m.id',
    (err, res) => {
      if (err) {
        console.error('Error fetching employees:', err.stack);
      } else {
        console.table(res.rows);
        displayOptions();
      }
    }
  );
}

// add a department
function addDepartment() {
  inquirer.prompt([
    {
      type: 'input',
      name: 'departmentName',
      message: 'Enter the name of the department:',
    }
  ]).then(answers => {
    client.query('INSERT INTO department (name) VALUES ($1)', [answers.departmentName], (err) => {
      if (err) {
        console.error('Error adding department:', err.stack);
      } else {
        console.log('Department added successfully');
      }
      displayOptions();
    });
  });
}

//add a role
function addRole() {
  inquirer.prompt([
    {
      type: 'input',
      name: 'roleTitle',
      message: 'Enter the role title:',
    },
    {
      type: 'input',
      name: 'roleSalary',
      message: 'Enter the role salary:',
    },
    {
      type: 'input',
      name: 'departmentId',
      message: 'Enter the department ID for this role:',
    }
  ]).then(answers => {
    client.query(
      'INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3)',
      [answers.roleTitle, answers.roleSalary, answers.departmentId],
      (err) => {
        if (err) {
          console.error('Error adding role:', err.stack);
        } else {
          console.log('Role added successfully');
        }
        displayOptions();
      }
    );
  });
}

//  add an employee
function addEmployee() {
  inquirer.prompt([
    {
      type: 'input',
      name: 'firstName',
      message: 'Enter the employee’s first name:',
    },
    {
      type: 'input',
      name: 'lastName',
      message: 'Enter the employee’s last name:',
    },
    {
      type: 'input',
      name: 'roleId',
      message: 'Enter the role ID for this employee:',
    },
    {
      type: 'input',
      name: 'managerId',
      message: 'Enter the manager’s employee ID (leave blank if none):',
    }
  ]).then(answers => {
    const managerId = answers.managerId || null;
    client.query(
      'INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)',
      [answers.firstName, answers.lastName, answers.roleId, managerId],
      (err) => {
        if (err) {
          console.error('Error adding employee:', err.stack);
        } else {
          console.log('Employee added successfully');
        }
        displayOptions();
      }
    );
  });
}

// update an employee's role
function updateEmployeeRole() {
  inquirer.prompt([
    {
      type: 'input',
      name: 'employeeId',
      message: 'Enter the ID of the employee to update:',
    },
    {
      type: 'input',
      name: 'newRoleId',
      message: 'Enter the new role ID for this employee:',
    }
  ]).then(answers => {
    client.query(
      'UPDATE employee SET role_id = $1 WHERE id = $2',
      [answers.newRoleId, answers.employeeId],
      (err) => {
        if (err) {
          console.error('Error updating employee role:', err.stack);
        } else {
          console.log('Employee role updated successfully');
        }
        displayOptions();
      }
    );
  });
}


connectToDatabase(displayOptions);