/**
 * This file contains model defination for user schema
 */

module.exports = function (sequelize, Sequelize) {
    var user = sequelize.define('user', {
        id: { type: Sequelize.BIGINT, autoIncrement: true, primaryKey: true, allowNull: false },
        firstName: { type: Sequelize.STRING, allowNull: false },
        lastName: { type: Sequelize.STRING, allowNull: true },
        createdAt: { type: Sequelize.DATE, allowNull: false },
        lastModifiedAt: { type: Sequelize.DATE, allowNull: false },
        status: { type: Sequelize.INTEGER, allowNull: false },
        sessionId: { type: Sequelize.TEXT },
        email: { type: Sequelize.STRING, allowNull: false },
        password: { type: Sequelize.TEXT, allowNull: false },
        salt: { type: Sequelize.TEXT, allowNull: false },
    }, {
            tableName: 'user',
            underscored: false,
            timestamps: false
        });

    return user;
};