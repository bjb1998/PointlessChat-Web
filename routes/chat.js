//express is the framework we're going to use to handle requests
const express = require('express')

//retrieve the router object from express
var router = express.Router()

/**
 * @api {get} /chat sends a simple get request message for now
 * @apiName GetChat
 * @apiGroup Chat
 *
 * @apiSuccess {String} simple welcome message
 */
router.get("/", (request, response) => {
    response.send({
        message: "Welcome to chat"
    })
})

module.exports = router