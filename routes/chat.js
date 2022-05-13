//express is the framework we're going to use to handle requests
const { response } = require('express')
const { request } = require('express')
const express = require('express')

//Access the connection to Heroku Database
const pool = require('../utilities').pool

const validation = require('../utilities').validation
const {validateEmailInput, validatePassword} = require('./validator')
let isStringProvided = validation.isStringProvided

const router = express.Router()

/**
 * @api {post} /auth Request to register a user
 * @apiName PostAuth
 * @apiGroup Auth
 *
 * @apiParam {String} first a users first name
 * @apiParam {String} last a users last name
 * @apiParam {String} email a users email *unique
 * @apiParam {String} password a users password
 * @apiParam {String} [username] a username *unique, if none provided, email will be used
 *
 * @apiParamExample {json} Request-Body-Example:
 *  {
 *      "first":"Charles",
 *      "last":"Bryan",
 *      "email":"cfb3@fake.email",
 *      "password":"test12345"
 *  }
 *
 * @apiSuccess (Success 201) {boolean} success true when the name is inserted
 * @apiSuccess (Success 201) {String} email the email of the user inserted
 *
 * @apiError (400: Missing Parameters) {String} message "Missing required information"
 *
 * @apiError (400: Username exists) {String} message "Username exists"
 *
 * @apiError (400: Email exists) {String} message "Email exists"
 *
 * @apiError (400: Other Error) {String} message "other error, see detail"
 * @apiError (400: Other Error) {String} detail Information about the error
 *
 * @apiError (400: Invalid Password) {String} bad input for password
 * @apiError (400: Invalid Email) {String} bad input for email
 *
 */
router.post('/create', (request, response) => {

    //Retrieve data from query params
    const userEmail = request.body.userEmail
    const otherEmail = request.body.otherEmail
    let chatId = 0;
    //Verify that the caller supplied all the parameters
    //In js, empty strings or null values evaluate to false
    if(isStringProvided(userEmail) && isStringProvided(otherEmail)){
        let getNamesQuery = "SELECT username FROM MEMBERS WHERE EMAIL IN ($1, $2)"
        let values = [userEmail, otherEmail]

        pool.query(getNamesQuery, values)
            .then (result => {
                const chatName = 'Chat between ' + result.rows[0].username + ' and ' + result.rows[1].username
                let creationQuery = "INSERT INTO CHATS(name) VALUES($1) RETURNING chatid"
                let name = [chatName]
                pool.query(creationQuery, name)
                    .then(result => {
                        chatId = result.rows[0].chatid
                        let insertionQuery = `INSERT INTO 
                            ChatMembers(ChatId, MemberId)
                            SELECT $1, Members.MemberId
                            FROM Members
                            WHERE Members.Email=$2
                                OR Members.Email=$3
                            RETURNING *;`
                        let values = [chatId, userEmail, otherEmail]

                        pool.query(insertionQuery, values)
                            .then(result => {
                                response.status(200).send({
                                    message: result
                                })
                            })
                            .catch((error) => {
                                response.status(400).send({
                                    message: "error, see detail",
                                    detail: error.detail
                                })
                            })

                    })
                    .catch((error) => {
                        response.status(400).send({
                            message: "error, see detail",
                            detail: error.detail
                        })
                    })
            })
    }else{
        response.status(400).send({
            message: "Missing required information"
        })



    }
})

router.post('/get', (request, response) => {

    //Retrieve data from query params
    const userEmail = request.body.userEmail
    //Verify that the caller supplied all the parameters
    //In js, empty strings or null values evaluate to false
    if(isStringProvided(userEmail)){
        let findChatQuery = `SELECT ChatID, Name FROM Chats WHERE ChatID IN (
                                 SELECT ChatId FROM ChatMembers 
                                 WHERE MemberId = (
                                    SELECT MemberId FROM Members
                                    WHERE Email = $1
                                 )
                             )`
        let values = [userEmail];

        pool.query(findChatQuery, values)
            .then(result => {
                response.status(200).send({
                    message: result
                })
            })
            .catch((error) => {
                response.status(400).send({
                    message: "error, see detail",
                    detail: error.detail
                })
            })
    } else {
        response.status(400).send({
            message: "Missing required information"
        })
    }
})


module.exports = router