const sendJsonResponse = (req, res, code, data) => {
    if (res.headersSent) {
        return console.error('Response headers already sent.  Will not attempt to re-send response', data);
    }
    res.status(code).json(data);
};

export {
    sendJsonResponse
}