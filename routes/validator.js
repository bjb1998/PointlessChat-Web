//express is the framework we're going to use to handle requests
const express = require('express')
const {pool, generateSalt, generateHash, sendEmail} = require("../utilities");
const {isStringProvided} = require("../utilities/validationUtils");

//retrieve the router object from express
var router = express.Router()

/**
 * @api {get} /weather sends a simple get request message for now
 * @apiName GetWeather
 * @apiGroup Weather
 *
 * @apiSuccess {String} simple welcome message
 */
router.post('/password', (request, response, next) => {
    //Retrieve data from query params
    const password = request.body.password
    //Verify that the caller supplied all the parameters
    //In js, empty strings or null values evaluate to false
    if (isStringProvided(password)) {
        if (password.length <= 3) {
            response.status(400).send({
                message: "Password too short"
            })
            return
        }
        if (!containsUpperCase(password)) {
            response.status(400).send({
                message: "Password lacking Capital letter"
            })
            return
        }
        if (!containsNumber(password)) {
            response.status(400).send({
                message: "Password lacking Number"
            })
            return
        }
        if (!containsSpecialChars(password)) {
            response.status(400).send({
                message: "Password lacking special character"
            })
            return
        }
    } else {
        response.status(400).send({
            message: "Password not provided"
        })
        return
    }
})

router.post('/email', (request, response, next) => {
    //Retrieve data from query params
    const email = request.body.email
    //Verify that the caller supplied all the parameters
    //In js, empty strings or null values evaluate to false
    if(isStringProvided(email)) {
        if(email.length <= 3){
            response.status(400).send({
                message: "Email too short"
            })
            return
        }
        if(!containsAt(email) || !containsValidDomain(email)){
            response.status(400).send({
                message: "Invalid Email"
            })
            return
        }
    } else {
        response.status(400).send({
            message: "email not provided"
        })
        return
    }

    //We successfully added the user!
    response.status(201).send({
        success: true,
        message: "Email Accepted"
    })
})

function containsAt(str){
    const specialChars = /[`@]/;
    return specialChars.test(str);
}

function containsValidDomain(str){
    const domain = str.substring(str.indexOf('@') + 1)
    const specialChars = /[`!#$%^&*()_+\-=\[\]{};':"\\|,<>\/?~]/;
    const period = /[.]/
    //check if the email domain has all these wacky characters
    if(specialChars.test(domain)){
        return false;
    }else{ //otherwise, check if it ends with a dot
        return !period.test(domain.charAt(domain.length - 1));
    }
}

function containsSpecialChars(str) {
    const specialChars = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
    return specialChars.test(str);
}

function containsNumber(str) {
    const specialChars = /[1234567890]/;
    return specialChars.test(str);
}

function containsUpperCase(str) {
    const specialChars = /[ABCDEFGHIJKLMNOPQRSTUVWXYZ]/;
    return specialChars.test(str);
}


module.exports = router