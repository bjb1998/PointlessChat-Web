const {isStringProvided} = require("../utilities/validationUtils");


//-----Validator Functions-----//
/**
 * @api validatePassword validates the inputted password
 * @apiName validatePassword
 * @apiGroup Validator
 *
 * @apiSuccess {Boolean} boolean stating whether the password is valid
 */
function validatePassword(password) {
    return !(!isStringProvided(password) || password.length <= 3 || !containsUpperCase(password) || !containsNumber(password) || !containsSpecialChars(password));
}

/**
 * @api validateEmail validates the inputted email
 * @apiName validateEmail
 * @apiGroup Validator
 *
 * @apiSuccess {Boolean} boolean stating whether the email is valid
 */
function validateEmail(email){
        return !(!isStringProvided(email) || email.length <= 3 || !containsAt(email) || !containsValidDomain(email));
}

/**
 * @api containsAt returns whether the string contains the '@' char
 * @apiName containsAt
 * @apiGroup Validator
 *
 * @apiSuccess {Boolean} boolean stating whether the string contains the '@' char
 */
function containsAt(str){
    const specialChars = /[`@]/;
    return specialChars.test(str);
}
//-----Validator Functions-----//


//-----Validator Helpers-----//
/**
 * @api containsValidDomain returns whether the email is a valid domain
 * @apiName containsValidDomain
 * @apiGroup Validator
 *
 * @apiSuccess {Boolean} boolean stating whether the email doesn't end in a '.' and doesn't have special chars
 */
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

/**
 * @api containsSpecialChars checks if password contains a special char
 * @apiName containsSpecialChars
 * @apiGroup Validator
 *
 * @apiSuccess {Boolean} boolean stating whether password has a special char (/[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/)
 */
function containsSpecialChars(str) {
    const specialChars = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
    return specialChars.test(str);
}

/**
 * @api containsNumber checks if password contains number
 * @apiName containsNumber
 * @apiGroup Validator
 *
 * @apiSuccess {Boolean} boolean stating whether password has any number (0 - 9)
 */
function containsNumber(str) {
    const specialChars = /[1234567890]/;
    return specialChars.test(str);
}

/**
 * @api containsUpperCase checks if password has a capitol letter
 * @apiName containsUpperCase
 * @apiGroup Validator
 *
 * @apiSuccess {Boolean} boolean stating whether the password has a capitol letter (A - Z)
 */
function containsUpperCase(str) {
    const specialChars = /[ABCDEFGHIJKLMNOPQRSTUVWXYZ]/;
    return specialChars.test(str);
}
//-----Validator Helpers-----//

exports.validateEmail = validateEmail
exports.validatePassword = validatePassword