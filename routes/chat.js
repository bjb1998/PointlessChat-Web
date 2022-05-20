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
 * @api {post} /chat Create a new chat
 * @apiName ChatCreate
 * @apiGroup chat
 *
 * @apiParam {String} userEmail the current users email address
 * @apiParam {String} otherEmail the 2nd users email address
 *
 * @apiParamExample {json} Request-Body-Example:
 *  {
 *      "userEmail":"email1@test.com",
 *      "otherEmail":"email2@test.com"
 *  }
 *
 * @apiSuccess (Success 201) {boolean} return the created chat
 *
 * @apiError (400: Missing Parameters) {String} message "Missing required information"
 *
 * @apiError (400: Other Error) {String} message "other error, see detail"
 * @apiError (400: Other Error) {String} detail Information about the error
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

/**
 * @api {post} /chat get all the chats of a user
 * @apiName ChatGet
 * @apiGroup chat
 *
 * @apiParam {String} the current users email address
 *
 * @apiParamExample {json} Request-Body-Example:
 *  {
 *      "userEmail":"email1@test.com"
 *  }
 *
 * @apiSuccess (Success 201) {boolean} return the chats the user is in
 *
 * @apiError (400: Missing Parameters) {String} message "Missing required information"
 *
 * @apiError (400: Other Error) {String} message "other error, see detail"
 * @apiError (400: Other Error) {String} detail Information about the error
 *
 */
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

/**
 * @api {post} /chat delete a given chat ID
 * @apiName ChatDelete
 * @apiGroup chat
 *
 * @apiParam {Integer} the chat ID to delete
 *
 * @apiParamExample {json} Request-Body-Example:
 *  {
 *      "userEmail":"email1@test.com"
 *  }
 *
 * @apiSuccess (Success 201) {boolean} return the chats the user is in
 *
 * @apiError (400: Missing Parameters) {String} message "Missing required information"
 *
 * @apiError (400: Other Error) {String} message "other error, see detail"
 * @apiError (400: Other Error) {String} detail Information about the error
 *
 */
router.post('/delete', (request, response) => {

    //Retrieve data from query params
    const currentchatId= request.body.chatId
    //Verify that the caller supplied all the parameters
    //In js, empty strings or null values evaluate to false
    if(Number.isInteger(currentchatId)){

        let deleteMessageQuery = `DELETE FROM MESSAGES WHERE ChatID = $1`
        let deleteChatMembersQuery = `DELETE FROM ChatMembers WHERE ChatID = $1`
        let deleteChatQuery = `DELETE FROM Chats WHERE ChatID = $1`

        let value = [currentchatId];

        pool.query(deleteMessageQuery, value)
            .then(result => {
                pool.query(deleteChatMembersQuery, value)
                    .then(result => {
                        pool.query(deleteChatQuery, value)
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