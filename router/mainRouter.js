/**
 * This file contains main routers and controllers
 * Request validation and all crud operations logic
 */

var express = require('express');
var router = express.Router();
const dbOperations = require("../helpers/db/dbOperations");
const crypto = require("crypto");
const UUID = require("uuid");
const { sendEmail } = require("../helpers/emailHelper");

/**
 * This is the user create API
 * Request params -
 * @param {Object} - firstName(string), email(string), password(string min length 6)
 * This uses SHA256 to encrytpt the password and save that in database
 */
router.post("/createUser", async (req, res) => {
    try {
        var data = req.body;
        /* Request Validation */
        if (!data || !data.firstName || !data.email || !data.password) {
            return res.status(400).send({ message: "Missing request Parameters" });
        } else if (typeof (data.firstName) != "string" || typeof (data.email) != "string" || typeof (data.password) != "string") {
            return res.status(400).send({ message: "Invalid request Datatypes" });
        } else if (data.password.length < 6) {
            return res.status(400).send({ message: "Minimum password length is 6 characters" });
        } else {
            /* Check if email id in request is already in use */
            var checkEmail = await checkEmailAlreadyExist(data.email)
            if (!checkEmail) {
                return res.status(400).send({ message: "Email already exists" })
            } else {
                /* If email is free to use */
                var salt = "AAAABBBBCCCCDDDD" + Date.now();
                var encryptedPassword = encryptPassword(data.password, salt)
                /* user data to insert */
                var userInfo = {
                    firstName: data.firstName,
                    email: data.email,
                    status: 1,
                    salt: salt,
                    password: encryptedPassword,
                    createdAt: Date.now(),
                    lastModifiedAt: Date.now()
                };
                /* DB operation */
                var createdUser = await dbOperations.createRecord('user', userInfo);
                if (createdUser) {
                    return res.status(200).send({ message: "success", user: createdUser })
                } else {
                    return res.status(500).send({ message: "Something went wrong" })
                }
            }
        }
    } catch (error) {
        return res.send(500).send({ error: error })
    }
});

/**
 * This is the login API
 * Request params - 
 * @param {Object} - email(string), password(string)
 * @returns - session id
 */
router.post("/login", async (req, res) => {
    try {
        var data = req.body;
        /* request validation*/
        if (!data || !data.email || !data.password) {
            return res.status(400).send({ message: "Missing request Parameters" });
        } else if (typeof (data.email) != "string" || typeof (data.password) != "string") {
            return res.status(400).send({ message: "Invalid request Datatypes" });
        } else {
            /* Check if the user exists for requested email */
            var user = await dbOperations.getRawRecords('user', {
                where: {
                    email: data.email,
                    status: {
                        [dbOperations.db.Sequelize.Op.notIn]: 3
                    }
                },
                attributes: ['id', 'firstName', 'lastName', 'status', 'email', 'sessionId', 'salt', 'password']
            });
            /* If user doesnot exist */
            if (user.length < 1) {
                return res.status(400).send({ message: 'Not a valid user' })
            } else {
                var encryptedpwd = encryptPassword(data.password, user[0].salt)
                if (encryptedpwd != user[0].password.toLowerCase()) {
                    return res.status(400).send({ message: 'Not a valid password' })
                } else {
                    /* once user id and password matches created object to update user data */
                    var loginApiResponse = {
                        userId: user[0].id,
                        status: user[0].status,
                        sessionId: UUID(), //session id generated through UUID
                        lastModifiedAt: Date.now()
                    }
                    /* DB operation */
                    var updateUser = await dbOperations.updateRecord('user', {
                        where: {
                            id: user[0].id
                        }
                    }, loginApiResponse);
                    if (updateUser) {
                        return res.status(200).send({ message: "success", session: loginApiResponse.sessionId })
                    } else {
                        return res.status(500).send({ message: "Something went wrong" })
                    }
                }
            }
        }
    } catch (error) {
        return res.status(500).send({ message: error })
    }
})

/**
 * This is the reset password API
 * Request params - 
 * @param {Object} - email(string), oldPassword(string), newPassword(string)
 */
router.post("/resetPassword", async (req, res) => {
    try {
        var data = req.body;
        /*Request validation*/
        if (!data || !data.email || !data.oldPassword || !data.newPassword) {
            return res.status(400).send({ message: "Missing request Parameters" });
        } else if (typeof (data.email) != "string" || typeof (data.oldPassword) != "string" || typeof (data.newPassword) != "string") {
            return res.status(400).send({ message: "Invalid request Datatypes" });
        } else if (data.newPassword.length < 6) {
            return res.status(400).send({ message: "Minimum password length is 6 characters" });
        } else {
            /* Check if the user exists with request email */
            var user = await dbOperations.getRawRecords('user', {
                where: {
                    email: data.email,
                    status: {
                        [dbOperations.db.Sequelize.Op.notIn]: 3
                    }
                },
                attributes: ['id', 'firstName', 'lastName', 'status', 'email', 'sessionId', 'salt', 'password']
            });
            if (!user || user.length == 0) {
                return res.status(400).send({ message: "User doesnot exist for requested email" })
            } else {
                /* Check if old password matches user's password in database */
                var encryptedOldPwd = encryptPassword(data.oldPassword, user[0].salt);
                if (encryptedOldPwd != user[0].password.toLowerCase()) {
                    return res.status(400).send({ message: "Incorrect old password" })
                } else {
                    /* encrypt new password and update in DB */
                    var newSalt = "AAAABBBBCCCCDDDD" + Date.now();
                    var encryptedNewPassword = encryptPassword(data.newPassword, newSalt);
                    var newUserObject = {
                        salt: newSalt,
                        password: encryptedNewPassword,
                        sessionId: null,
                        lastModifiedAt: Date.now()
                    }
                    /* DB operation */
                    var updateUser = await dbOperations.updateRecord('user', {
                        where: {
                            id: user[0].id
                        }
                    }, newUserObject);
                    if (updateUser) {
                        return res.status(200).send({ message: "Password reset succesful, please login again to enable session" })
                    } else {
                        return res.status(500).send({ message: "Something went wrong" });
                    }
                }
            }
        }
    } catch (error) {
        return res.status(500).send({ message: error })
    }
})

/**
 * This is forgot password API
 * Request params - 
 * @param - email (string)
 * @returns - Sends email to user with temporary password
 */
router.post("/forgotPassword", async (req, res) => {
    try {
        var data = req.body;
        /* Request validation */
        if (!data || !data.email) {
            return res.status(400).send({ message: "Missing request Parameters" });
        } else if (typeof (data.email) != "string") {
            return res.status(400).send({ message: "Invalid request Datatypes" });
        } else {
            /* Check if user exists with request email id */
            var user = await dbOperations.getRawRecords('user', {
                where: {
                    email: data.email,
                    status: {
                        [dbOperations.db.Sequelize.Op.notIn]: 3
                    }
                },
                attributes: ['id', 'firstName', 'lastName', 'status', 'email', 'sessionId', 'salt', 'password']
            });
            if (!user || user.length == 0) {
                return res.status(400).send({ message: "User doesnot exist for requested email" })
            } else {
                /* Generate temporary password */
                var newSalt = "AAAABBBBCCCCDDDD" + Date.now();
                var tempPwd = createTempPassword();
                var encryptedNewPassword = encryptPassword(tempPwd, newSalt);
                var newUserObject = {
                    salt: newSalt,
                    password: encryptedNewPassword,
                    sessionId: null,
                    lastModifiedAt: Date.now()
                }
                /* send temporary password in email */
                var text = "Hi! " + user[0].firstName + "\n\nYour temporary password to reset the password is " + tempPwd + "\n\nPlease use this password to reset the password of your choice.\n\nThank you.";
                var emailSent = sendEmail(user[0].email, 'Temporary Password', text)
                /* DB operation */
                var updateUser = await dbOperations.updateRecord('user', {
                    where: {
                        id: user[0].id
                    }
                }, newUserObject);
                if (updateUser) {
                    return res.status(200).send({ message: "Password reset succesful, please login again to enable session" })
                } else {
                    return res.status(500).send({ message: "Something went wrong" });
                }
            }
        }
    } catch (error) {
        return res.status(500).send({ message: error })
    }
})

/**
 * This function checks if the email in the request is associated with any user or not
 * @param {String} email 
 * @returns false if email exists in db, true if not
 */
const checkEmailAlreadyExist = async (email) => {
    try {
        /* DB operation */
        var record = await dbOperations.getRawRecords('user', {
            where: {
                email: email,
                status: {
                    [dbOperations.db.Sequelize.Op.ne]: 3
                }
            }
        });
        if (record && record.length) {
            return false
        } else {
            return true;
        }
    } catch (e) {
        throw e;
    }
}

/**
 * This function encrypts the string in SHA256
 * @param {String} password 
 * @param {String} salt 
 * @returns - encrypted password
 */
const encryptPassword = function (password, salt) {
    password = password + salt;
    var hash = crypto.createHash('sha256');
    hash.update(password);
    var encryptedpwd = hash.digest('hex');
    return encryptedpwd;
}

/**
 * This function generates temporary password of length 6
 * @returns - temporary password
 */
var createTempPassword = function () {
    var stringRandom = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
    var result = '';
    for (var i = 6; i > 0; --i)
        result += stringRandom[Math.floor(Math.random() * stringRandom.length)];
    return result;
}

module.exports = router;