//express is the framework we're going to use to handle requests
const { response } = require('express')
const { request } = require('express')
const express = require('express')

//Access the connection to Heroku Database
const pool = require('../utilities').pool

const validation = require('../utilities').validation
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
router.post('/', (request, response) => {

    //Retrieve data from query params
    const MemberIdA = request.body.UserIdA
    const MemberIdB = request.body.UserIdB
    //Verify that the caller supplied all the parameters
    //In js, empty strings or null values evaluate to false
    //let theQuery = "INSERT INTO MEMBERS(FirstName, LastName, Username, Email) VALUES ($1, $2, $3, $4) RETURNING Email, MemberID"
    //let values = [first, last, username, email]
    if(isStringProvided(MemberIdA) && isStringProvided(MemberIdB)){
        let theQuery = "INSERT INTO CONTACTS(MemberID_A, MemberID_B, Verified) VALUES($1, $2, 0) RETURNING PrimaryKey, MemberID_A, MemberID_B";
        let values = [MemberIdA, MemberIdB]
        pool.query(theQuery, values)
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

router.post('/remove', (request, response) => {

    //Retrieve data from query params
    const MemberIdA = request.body.UserIdA
    const MemberIdB = request.body.UserIdB
    //Verify that the caller supplied all the parameters
    //In js, empty strings or null values evaluate to false
    //let theQuery = "INSERT INTO MEMBERS(FirstName, LastName, Username, Email) VALUES ($1, $2, $3, $4) RETURNING Email, MemberID"
    //let values = [first, last, username, email]
    if(isStringProvided(MemberIdA) && isStringProvided(MemberIdB)){
        let theQuery = "DELETE FROM CONTACTS WHERE (MemberID_A = ($1) AND MemberID_B = ($2))"
        let values = [MemberIdA, MemberIdB]
        pool.query(theQuery, values)
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