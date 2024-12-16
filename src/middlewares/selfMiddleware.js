const { User } = require('../models');

const selfMiddleware = async (resolve, parent, args, context, info) => {
    const userId = args.id;
    const currentUser = context.user;

    if (!currentUser) {
        context.res.status(401);
        throw new Error('Not authenticated');
    }

    if (currentUser.id !== userId) {
        context.res.status(403);
        throw new Error('This action is not allowed for this user');
    }

    return resolve(parent, args, context, info);
};

module.exports = selfMiddleware;