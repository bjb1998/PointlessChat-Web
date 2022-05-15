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
 * @api {post} /search search for users with the given parameters
 * @apiName ContactSearch
 * @apiGroup search
 *
 * @apiParam {String} name the string to search by
 * @apiParam {String} option the field to search by (email, username, firstname + lastname)
 *
 * @apiParamExample {json} Request-Body-Example:
 *  {
 *      "userEmail":"TheBestUsernameEver123",
 *      "otherEmail":"username"
 *  }
 *
 * @apiSuccess (Success 201) {boolean} return the search query results
 *
 * @apiError (400: Missing Parameters) {String} message "Missing required information"
 *
 * @apiError (400: Other Error) {String} message "other error, see detail"
 * @apiError (400: Other Error) {String} detail Information about the error
 *
 */
router.post('/', (request, response) => {

    //Retrieve data from query params
    const name = request.body.name
    const option = request.body.option
    //Verify that the caller supplied all the parameters
    //In js, empty strings or null values evaluate to false
    if(isStringProvided(name)){
        let theQuery = ""

        if(option === "Email"){
            theQuery = "SELECT * FROM MEMBERS WHERE Email LIKE '%'||$1||'%'"
        }else if(option === "Name"){
            theQuery = "SELECT * FROM MEMBERS WHERE CONCAT(FirstName, ' ', LastName)  LIKE '%'||$1||'%'"
        }else {
            theQuery = "SELECT * FROM MEMBERS WHERE Username LIKE '%'||$1||'%'"
        }

        let values = [name]

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