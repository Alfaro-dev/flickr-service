'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class History extends Model {
        static associate(models) {
            History.belongsTo(models.User, { foreignKey: 'userId' });
        }
    }

    History.init({
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        action: {
            type: DataTypes.STRING,
            allowNull: false
        },
        value: {
            type: DataTypes.STRING,
            allowNull: false
        },
        entity: {
            type: DataTypes.STRING,
            allowNull: false
        },
        entityId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        createdBy: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        updatedBy: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        deletedBy: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
            deletedAt: {
            type: DataTypes.DATE
        }
    }, {
        sequelize,
        modelName: 'History',
        timestamps: true,
        paranoid: true
    });
    return History;
};