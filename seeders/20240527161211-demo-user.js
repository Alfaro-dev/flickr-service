'use strict';

const { hashPassword } = require('../src/utils/jwt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, _) {
    
    // Insert Admin user
    await queryInterface.bulkInsert('Users', [{
      email: 'admin@admin.com',
      password: await hashPassword('admin'),
      name: 'Admin',
      lastname: 'Admin',
      birthdate: new Date(),
      createdBy: 1,
      createdAt: new Date(),
      updatedBy: 1,
      updatedAt: new Date()
    }], {});

    // Insert role Admin, Suscriber
    await queryInterface.bulkInsert('Roles', [
      { 
        name: 'Admin', 
        description: 'Administrator role',
        createdBy: 1,
        createdAt: new Date(),
        updatedBy: 1,
        updatedAt: new Date()
      },
      { 
        name: 'Suscriber', 
        description: 'Suscriber role',
        createdBy: 1,
        createdAt: new Date(),
        updatedBy: 1,
        updatedAt: new Date()
      }
    ], {});

    // Assign role Admin to user Admin
    await queryInterface.bulkInsert('UserRoles', [
      { 
        userId: 1, 
        roleId: 1,
        createdBy: 1,
        createdAt: new Date(),
        updatedBy: 1,
        updatedAt: new Date()
      }
    ], {});

    // Insert permissions
    await queryInterface.bulkInsert('Permissions', [
      { 
        name: 'can_create_user', 
        description: 'Can create user',
        createdBy: 1,
        createdAt: new Date(),
        updatedBy: 1,
        updatedAt: new Date()
      },
      { 
        name: 'can_update_user', 
        description: 'Can update user',
        createdBy: 1,
        createdAt: new Date(),
        updatedBy: 1,
        updatedAt: new Date()
      },
      { 
        name: 'can_delete_user', 
        description: 'Can delete user',
        createdBy: 1,
        createdAt: new Date(),
        updatedBy: 1,
        updatedAt: new Date()
      }
    ], {});

    // Insert role Admin permissions
    await queryInterface.bulkInsert('RolePermissions', [
      { 
        roleId: 1, 
        permissionId: 1,
        createdBy: 1,
        createdAt: new Date(),
        updatedBy: 1,
        updatedAt: new Date()
      },
      { 
        roleId: 1, 
        permissionId: 2,
        createdBy: 1,
        createdAt: new Date(),
        updatedBy: 1,
        updatedAt: new Date()
      },
      { 
        roleId: 1, 
        permissionId: 3,
        createdBy: 1,
        createdAt: new Date(),
        updatedBy: 1,
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', null, {})
  }
}
