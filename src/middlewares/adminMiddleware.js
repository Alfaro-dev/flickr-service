const adminMiddleware = async (resolve, parent, args, context, info) => {
  const currentUser = context.user;

  if (!currentUser) {
    context.res.status(401);
    throw new Error('Not authenticated');
  }

  const roles = await currentUser.getRoles();

  const isAdmin = roles.some(role => role.name === 'admin');

  if (!isAdmin) {
    context.res.status(403);
    throw new Error('You do not have permission to perform this action');
  }

  return resolve(parent, args, context, info);
}

module.exports = adminMiddleware;