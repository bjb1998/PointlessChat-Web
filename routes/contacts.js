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
    const currentUserEmail = request.body.userEmail
    const otherUserEmail = request.body.otherEmail
    //Verify that the caller supplied all the parameters
    //In js, empty strings or null values evaluate to false
    if(isStringProvided(currentUserEmail) && isStringProvided(otherUserEmail)){
        let checkExistsQuery = "SELECT * FROM CONTACTS WHERE ((MemberID_A IN (SELECT memberid FROM Members WHERE email IN ($1, $2)) AND (MemberID_B IN (SELECT memberid FROM Members WHERE email IN ($1, $2)))))"
        let theQuery = "INSERT INTO CONTACTS(MemberID_A, MemberID_B, Verified) VALUES((SELECT memberid FROM Members WHERE email = $1), (SELECT memberid FROM Members WHERE email = $2), 0) RETURNING PrimaryKey, MemberID_A, MemberID_B";
        let values = [currentUserEmail, otherUserEmail]

        pool.query(checkExistsQuery, values)
            .then(result => {
                if (result.rowCount > 0) {
                    response.status(400).send({
                        message: 'Contact Already Exists'
                    })
                }else{
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
                }
            });
    } else {
        response.status(400).send({
            message: "Missing required information"
        })
    }
})

router.post('/get', (request, response) => {

    //Retrieve data from query params
    const currentUserEmail = request.body.userEmail
    const verified = request.body.verified
    //Verify that the caller supplied all the parameters
    //In js, empty strings or null values evaluate to false
    if(isStringProvided(currentUserEmail)){

        //This Query is complicated. In short, find all the connections with the users current email, then select the ID
        //Which isn't the current users, from there, get their info
        let theQuery = `SELECT username, email, firstname, lastname,
                        (MemberID_A = (SELECT memberid FROM Members WHERE email = $1)) AS DidSend 
                        FROM MEMBERS, CONTACTS WHERE memberid IN (SELECT
                        (CASE WHEN
                            (MemberID_A = (SELECT memberid FROM MEMBERS WHERE email = $1))
                                THEN MemberID_B
                                ELSE MemberID_A
                        END) WHERE (Verified = $2 
                        AND (
                            (MemberID_A = (SELECT memberid FROM MEMBERS WHERE email = $1) OR (MemberID_B = (SELECT memberid FROM MEMBERS WHERE email = $1)))
                        )))`
        let values = [currentUserEmail, verified]

        pool.query(theQuery, values)
            .then(result => {
                if (result.rowCount === 0) {
                    response.status(400).send({
                        message: 'You have no contacts'
                    })
                }else{
                    pool.query(theQuery, values)
                        .then(result => {
                            response.status(200).send({
                                message: result,
                                context: verified
                            })
                        })
                        .catch((error) => {
                            response.status(400).send({
                                message: "error, see detail",
                                detail: error.detail
                            })
                        })
                }
            });
    } else {
        response.status(400).send({
            message: "Missing required information"
        })
    }
})


router.post('/remove', (request, response) => {

    //Retrieve data from query params
    const currentUserEmail = request.body.userEmail
    const otherUserEmail = request.body.otherEmail
    //Verify that the caller supplied all the parameters
    //In js, empty strings or null values evaluate to false
    if(isStringProvided(currentUserEmail) && isStringProvided(otherUserEmail)){
        let checkExistsQuery = "SELECT * FROM CONTACTS WHERE ((MemberID_A IN (SELECT memberid FROM Members WHERE email IN ($1, $2)) AND (MemberID_B IN (SELECT memberid FROM Members WHERE email IN ($1, $2)))))"
        let theQuery = "DELETE FROM CONTACTS WHERE ((MemberID_A IN (SELECT memberid FROM Members WHERE email IN ($1, $2)) AND (MemberID_B IN (SELECT memberid FROM Members WHERE email IN ($1, $2)))))"
        let values = [currentUserEmail, otherUserEmail]

        pool.query(checkExistsQuery, values)
            .then(result => {
                if (result.rowCount === 0) {
                    response.status(400).send({
                        message: 'Contact Does Not Exist'
                    })
                }else{
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
                }
            });
    } else {
        response.status(400).send({
            message: "Missing required information"
        })
    }
})

router.post('/accept', (request, response) => {

    //Retrieve data from query params
    const currentUserEmail = request.body.userEmail
    const otherUserEmail = request.body.otherEmail
    //Verify that the caller supplied all the parameters
    //In js, empty strings or null values evaluate to false
    if(isStringProvided(currentUserEmail) && isStringProvided(otherUserEmail)){
        let checkExistsQuery = "SELECT * FROM CONTACTS WHERE ((MemberID_A IN (SELECT memberid FROM Members WHERE email IN ($1, $2)) AND (MemberID_B IN (SELECT memberid FROM Members WHERE email IN ($1, $2)))))"
        let theQuery = `UPDATE CONTACTS 
                        SET Verified = 1
                        WHERE (MemberID_A = (SELECT memberid FROM Members WHERE email = $1) AND MemberID_B = (SELECT memberid FROM Members WHERE email = $2))`
        let values = [currentUserEmail, otherUserEmail]

        pool.query(checkExistsQuery, values)
            .then(result => {
                if (result.rowCount === 0) {
                    response.status(400).send({
                        message: 'Contact Does Not Exist'
                    })
                }else{
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
                }
            });
    } else {
        response.status(400).send({
            message: "Missing required information"
        })
    }
})


module.exports = router