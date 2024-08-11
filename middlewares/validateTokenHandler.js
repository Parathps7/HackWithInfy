const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');

const validateToken = asyncHandler(async (req, res, next) => {
    let token;
  
    // Check for token in Authorization header
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    }

    // Check for token in cookies
    if (!token) {
        token = req.cookies.accessToken; // Ensure you have a cookie parser middleware set up to populate req.cookies
    }

    if (token) {
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
            if (err) {
                res.status(401);
                throw new Error('User is not verified');
            }
            req.user = decoded.user;
            next();
        });
    } else {
        res.status(401);
        throw new Error('User is not authorized or token is missing in request');
    }
});

module.exports = {validateToken};
