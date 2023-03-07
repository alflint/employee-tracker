import { Database } from "./lib/database.js";
import inquirer from "inquirer"
import("console.table");


console.log(
    `
    ============================================================================
    _______  _______  _______  _        _______           _______  _______   
    (  ____ \(       )(  ____ )( \      (  ___  )|\     /|(  ____ \(  ____ \  
    | (    \/| () () || (    )|| (      | (   ) |( \   / )| (    \/| (    \/  
    | (__    | || || || (____)|| |      | |   | | \ (_) / | (__    | (__      
    |  __)   | |(_)| ||  _____)| |      | |   | |  \   /  |  __)   |  __)     
    | (      | |   | || (      | |      | |   | |   ) (   | (      | (        
    | (____/\| )   ( || )      | (____/\| (___) |   | |   | (____/\| (____/\  
    (_______/|/     \||/       (_______/(_______)   \_/   (_______/(_______/  
                                                                              
     _______  _______  _        _______  _______  _______  _______            
    (       )(  ___  )( (    /|(  ___  )(  ____ \(  ____ \(  ____ )           
    | () () || (   ) ||  \  ( || (   ) || (    \/| (    \/| (    )|           
    | || || || (___) ||   \ | || (___) || |      | (__    | (____)|           
    | |(_)| ||  ___  || (\ \) ||  ___  || | ____ |  __)   |     __)           
    | |   | || (   ) || | \   || (   ) || | \_  )| (      | (\ (              
    | )   ( || )   ( || )  \  || )   ( || (___) || (____/\| ) \ \__           
    |/     \||/     \||/    )_)|/     \|(_______)(_______/|/   \__/ 
    ============================================================================
    \n
    `
);

const db = new Database();
await db.init()


const validateNames = async (input) => {
    if (input.length < 1 || input.length > 30){
        return "Please respond with 1 to 30 characters."
    } return true
}

const validateNumerical = async (input) => {

    if (input.length < 1 || isNaN(input)){
        return "Please respond with a numerical value."
    } return true
}



async function getResponses(){
    return inquirer.prompt(
        [
            {
                type: "list",
                name: "mainMenu",
                message: "What would you like to do?",
                choices: [
                    "View All Employees", 
                    "Add Employee", 
                    "Update Employee Role",
                    "View All Roles",
                    "Add Role",
                    "View All Departments",
                    "Add Department",
                    "Quit"
        
                ],
            },
            {
                type: "input",
                name: "employeeFirstName",
                message: "What is the employees first name?",
                when: (answers) => answers.mainMenu == "Add Employee",
                validate: validateNames
            },
            {
                type: "input",
                name: "employeeLastName",
                message: "What is the employees last name?",
                when: (answers) => answers.employeeFirstName != undefined,
                validate: validateNames
            },
            {
                type: "list",
                name: "employeeRole",
                message: "What is the employees role?",
                choices: await db.getAllRoles(true),
                when: (answers) => answers.employeeLastName != undefined
            },
            {
                type: "list",
                name: "employeeManager",
                message: "Who is the employee's manager?",
                choices: [{value: null, name: "None"}].concat(await db.getAllEmployees(true)),
                when: (answers) => answers.employeeRole != undefined
        
            },
            {
                type: "list",
                name: "updateEmployeeRoleName",
                message: "Which employee's role do you want to update?",
                choices: await db.getAllEmployees(true),
                when: (answers) => answers.mainMenu == "Update Employee Role"
            },
            {
                type: "list",
                name: "updateEmployeeRolePosition",
                message: "Which role do you want to assign to the selected employee?",
                choices: await db.getAllRoles(true),
                when: (answers) => answers.updateEmployeeRoleName != undefined
            },
            {
                type: "input",
                name: "roleName",
                message: "What is the name of the role?",
                when: (answers) => answers.mainMenu == "Add Role",
                validate: validateNames
            },
            {
                type: "input",
                name: "roleSalary",
                message: "What is the salary of the role?",
                when: (answers) => answers.roleName != undefined,
                validate: validateNumerical
            },
            {
                type: "list",
                name: "roleDepartment",
                message: "Which department does the role belong to?",
                choices: await db.getAllDepartments(true),
                when: (answers) => answers.roleSalary != undefined
            },
            {
                type: "input",
                name: "departmentName",
                message: "What is the name of the department?",
                when: (answers) => answers.mainMenu == "Add Department",
                validate: validateNames
            },
            
        
        ]
    ).then(async (answers) => {
        switch(answers.mainMenu){
            case "View All Employees":
                let employees = await db.getAllEmployees();
                console.table(employees[0]);
                break;
            case "Add Employee":
                await db.addEmployee(answers.employeeFirstName, answers.employeeLastName, answers.employeeRole, answers.employeeManager);
                break;
            case "Update Employee Role":
                    await db.updateEmployeeRole(answers.updateEmployeeRoleName, answers.updateEmployeeRolePosition);
                    break;
            case "View All Roles":
                let roles = await db.getAllRoles();
                console.table(roles[0]);
                break
            case "Add Role":
                await db.addRole(answers.roleName, answers.roleSalary, answers.roleDepartment);
                break;
            case "View All Departments":
                let departments = await db.getAllDepartments();
                console.table(departments[0]);
                break;
            case "Add Department":
                await db.addDepartment(answers.departmentName);
                break;
            default:
                console.log("Shutting down...")
                process.exit()
                break;
        }        
        return getResponses();
      });
}

getResponses()
  .then("SQL CMS shutting down...")
  .catch((error) => {});


