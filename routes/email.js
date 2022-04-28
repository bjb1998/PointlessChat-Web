//express is the framework we're going to use to handle requests
const { response } = require('express')
const { request } = require('express')
const express = require('express')

const router = express.Router()

const {isStringProvided} = require("../utilities/validationUtils");
const {pool} = require("../utilities");
router.get('/email', (request, response) => {
    const userId = request.headers.userId
    const param = request.headers.hash
    //Verify that the caller supplied all the parameters
    //In js, empty strings or null values evaluate to false
    if(isStringProvided(param)) {
        let retrievalQuery = `SELECT * saltedhash FROM Credentials
                              INNER JOIN Members ON
                              Credentials.memberid=Members.memberid
                              WHERE Credentials.saltedhash=$1`
        let setVerifiedQuery = `UPDATE Members
                                SET Verification = 1
                                WHERE Members.memberid = $1`

        pool.query(retrievalQuery, param)
            .then(result => {
                console.log(result)
                if (result.rowCount == 0) {
                    response.status(404).send({
                        message: 'User not found'
                    })
                    return
                }

                pool.query(setVerifiedQuery, userId)
                    .then(result => {
                        console.log(result)
                        /*if (result.rowCount == 0) {
                            response.status(404).send({
                                message: 'User not found'
                            })
                            return
                        }*/

                        response.status(200).send({
                            message: "Email validated!"
                        })
                    })
            })
    }
})

module.exports = router