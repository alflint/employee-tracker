import mysql from 'mysql2/promise';

// Initialize connection to local database
const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: ''
})


// Utility class to interact with local database
export class Database {
    constructor() {
        this.connection = connection;
        this.DB_NAME = 'employee_tracker';
        this.EMPLOYEE_TABLE = 'employee';
        this.DEPARTMENT_TABLE = 'department';
        this.ROLE_TABLE = 'role';

    }
    
    // Initialize the database and setup/populate tables
    async init() {
        await this.setupDB();
        await this.setupTables();
        await this.truncateTables();
        await this.populateTables();
    }

    // CREATE the database if doesn't exist and use new database
    async setupDB() {
        await this.connection.query(
            `CREATE DATABASE IF NOT EXISTS ${this.DB_NAME};`
        );
        await this.connection.query(
            `USE ${this.DB_NAME};`
        );
    }

    // CREATE tables if they don't exist
    async setupTables() {
        await this.connection.query(`
            CREATE TABLE IF NOT EXISTS ${this.DEPARTMENT_TABLE} (
                id INT(20) NOT NULL AUTO_INCREMENT,
                name VARCHAR(30) NOT NULL,
                 PRIMARY KEY (id)
            );
        `)

        await this.connection.query(`
            CREATE TABLE IF NOT EXISTS ${this.ROLE_TABLE} (
                id INT(20) NOT NULL AUTO_INCREMENT,
                title VARCHAR(30) NOT NULL,
                salary DECIMAL(20) NOT NULL,
                department_id INT(20) NOT NULL,
                PRIMARY KEY (id)
            );
        `)

        await this.connection.query(`
            CREATE TABLE IF NOT EXISTS ${this.EMPLOYEE_TABLE} (
                id INT(20) NOT NULL AUTO_INCREMENT,
                first_name VARCHAR(30) NOT NULL,
                last_name VARCHAR(30) NOT NULL,
                role_id INT(20) NOT NULL,
                manager_id INT(20),
                PRIMARY KEY (id)
            ); 
        `)
    }

    // TRUNCATE tables to clear data
    async truncateTables() {
        await this.connection.query(`
            TRUNCATE TABLE ${this.DEPARTMENT_TABLE};
        `)

        await this.connection.query(`
            TRUNCATE TABLE role;
        `)

        await this.connection.query(`
            TRUNCATE TABLE ${this.EMPLOYEE_TABLE};
        `)
    }
    
    // POPULATE tables
    async populateTables() {
        await this.connection.query(`
            INSERT INTO ${this.DEPARTMENT_TABLE} (name)
            VALUES ('Sales'),
                   ('Engineering'),
                   ('Finance'),
                   ('Legal');
        `)

        await this.connection.query(`
            INSERT INTO ${this.ROLE_TABLE} (title, salary, department_id)
            VALUES ('Sales Lead', 100000, 1),
                   ('Salesperson', 80000, 1),
                   ('Lead Engineer', 200000, 2),
                   ('Software Engineer', 180000, 2),
                   ('Accountant', 160000, 3),
                   ('Legal Team Lead', 200000, 4),
                   ('Lawyer', 180000, 4);
        `)

        await this.connection.query(`
            INSERT INTO ${this.EMPLOYEE_TABLE} (first_name, last_name, role_id, manager_id)
            VALUES ('Brian', 'Phillips', 1, NULL),
                   ('Mark', 'Doughty', 2, 1),
                   ('Harry', 'Styles', 3, NULL),
                   ('Mary', 'Walter', 4, 3),
                   ('Will', 'Smith', 5, 1),
                   ('Venus', 'Wright', 6, NULL),
                   ('Akim', 'Shakir', 7, 6),
                   ('Nigel', 'Parker', 4, 3);
        `)
    }

    // GET all employees
    async getAllEmployees(to_list = false){
        const employees = await this.connection.query(`
            SELECT
                ${this.EMPLOYEE_TABLE}.id,
                ${this.EMPLOYEE_TABLE}.first_name,
                ${this.EMPLOYEE_TABLE}.last_name,
                ${this.ROLE_TABLE}.title,
                ${this.DEPARTMENT_TABLE}.name as department,
                ${this.ROLE_TABLE}.salary,
                COALESCE(CONCAT(m.first_name, ' ', m.last_name), ' ') as manager 
            FROM
                ${this.EMPLOYEE_TABLE}
            JOIN 
                ${this.ROLE_TABLE}
            ON
                ${this.EMPLOYEE_TABLE}.role_id = ${this.ROLE_TABLE}.id
            JOIN
                ${this.DEPARTMENT_TABLE}
            ON
                ${this.ROLE_TABLE}.department_id = ${this.DEPARTMENT_TABLE}.id
            LEFT JOIN
                ${this.EMPLOYEE_TABLE} m
            ON
                ${this.EMPLOYEE_TABLE}.manager_id = m.id
        `)
        if(to_list){
            return employees[0].map(employee => {
                return {
                    value: employee.id,
                    name: `${employee.first_name} ${employee.last_name}`,
                }
            })
        } return employees
    }
    
    // GET all roles
    async getAllRoles(to_list = false){
        const roles = await this.connection.query(`
            SELECT 
                ${this.ROLE_TABLE}.id, 
                ${this.ROLE_TABLE}.title,
                ${this.DEPARTMENT_TABLE}.name as department,
                ${this.ROLE_TABLE}.salary
            FROM 
                ${this.ROLE_TABLE}
            JOIN 
                ${this.DEPARTMENT_TABLE}
            ON
                ${this.ROLE_TABLE}.department_id = ${this.DEPARTMENT_TABLE}.id
        `)
        if(to_list){
            return roles[0].map(role => {
                return {
                    value: role.id,
                    name: role.title,
                }
            })
        } return roles
    }

    // GET all departments
    async getAllDepartments(to_list = false){
        const departments = await this.connection.query(`
            SELECT * FROM ${this.DEPARTMENT_TABLE}
        `)
        if(to_list){
            return departments[0].map(department => {
                return {
                    value: department.id,
                    name: department.name,
                }
            })
        } return departments
    }

    // ADD new employee to employee table
    async addEmployee(first_name, last_name, role_id, manager_id){
        await this.connection.query(`
            INSERT INTO ${this.EMPLOYEE_TABLE} (first_name, last_name, role_id, manager_id)
            VALUES ('${first_name}', '${last_name}', ${role_id}, ${manager_id});
        `)
    }
    
    // UPDATE employee role
    async updateEmployeeRole(employee_id, role_id){
        await this.connection.query(`
            UPDATE ${this.EMPLOYEE_TABLE}
            SET role_id = ${role_id}
            WHERE id = ${employee_id};
        `)
    }

    // Add new role to role table
    async addRole(title, salary, department_id){
        await this.connection.query(`
            INSERT INTO ${this.ROLE_TABLE} (title, salary, department_id)
            VALUES ('${title}', ${salary}, ${department_id});
        `)
    }

    // Add new department to department table
    async addDepartment(name){
        await this.connection.query(`
            INSERT INTO ${this.DEPARTMENT_TABLE} (name)
            VALUES ('${name}');
        `)
    }
}