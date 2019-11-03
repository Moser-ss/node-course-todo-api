
function sendError(res, statusCode, message, error) {
    const body = {
        ok: false,
    }
    if(message){
        body.message = message
    }
    if(error){
        body.error = error
    }
    res.status(statusCode).send(body);
}
module.exports = {
    sendError
};