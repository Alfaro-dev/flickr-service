const { User, Role, UserRoles, Permission } = require('../models');
const { hashPassword, verifyPassword, signToken } = require('../utils/jwt');

/**
 * Register a new user
 * @param {*} args 
 * @returns user
 */
const register = async (args) => {
    const hashedPassword = await hashPassword(args.password)

    const user = User.create({
        ...args,
        password: hashedPassword
    })

    // add role to user, default is Suscriber
    const role = await Role.findOne({ where: { name: 'Suscriber' } })
    
    await UserRoles.create({
        userId: user.id,
        roleId: role.id
    })

    return user
}

/**
 * Login user
 * @param {*} args 
 * @returns user and token
 */
const login = async ({ email, password }) => {
    // get user by email
    const user = await User.findOne({ where: { email: email } });

    if (!user) {
        throw new Error("Invalid email");
    }
  
    const isValidPassword = await verifyPassword(
        user.password, 
        password
    )
  
    if (!isValidPassword) {
      throw new Error("Invalid password");
    }

    const token = signToken({ userId: user.id })
  
    return {
      user: user,
      token: token
    }
}

/**
 * Get current user
 * @param {*} ctx
 * @returns user
 */
const me = async (ctx) => {
    return ctx.user
}

/**
 * Check if user has permission
 * @param {*} ctx 
 * @param {*} permissionName  
 * @returns permissionName and hasPermission
 */
const can = async (ctx, { permissionName }) => {
    const user = await User.findByPk(ctx.user.id, {
      include: {
        model: Role,
        include: [Permission]
      }
    });
    
    if (!user) {
      throw new Error('User not found');
    }
    
    const hasPermission = user.Roles.some(role => 
      role.Permissions.some(permission => permission.name === permissionName)
    )

    return {
      permissionName: permissionName,
      hasPermission: hasPermission,
    }
}

/**
 * Change user password
 * @param {*} ctx
 * @param {*} oldPassword
 * @param {*} newPassword
 * @returns user
 */

const changePassword = async (ctx, { oldPassword, newPassword }) => {
    const user = ctx.user
    
    const isPasswordValid = await verifyPassword(oldPassword, user.password)
    
    if (!isPasswordValid) {
      throw new Error('Old password is incorrect')
    }
    
    const hashedNewPassword = await hashPassword(newPassword);
    
    await user.update({ password: hashedNewPassword })
    
    return user
}

module.exports = {
  register,
  login,
  me,
  can,
  changePassword
}