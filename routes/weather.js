//express is the framework we're going to use to handle requests
const express = require('express')

//retrieve the router object from express
var router = express.Router()

/**
 * @api {get} /weather sends a simple get request message for now
 * @apiName GetWeather
 * @apiGroup Weather
 *
 * @apiSuccess {String} simple welcome message
 */
router.get("/", (request, response) => {
    response.send({
        message: "Welcome to weather"
    })
})

module.exports = router