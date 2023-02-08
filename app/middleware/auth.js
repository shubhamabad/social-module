const jwt = require('jsonwebtoken');
const jwtKey = "my_secret_key"

const auth = (req, res, next) => {
    const Auth = req.headers.authorization
    if (Auth && Auth.split(' ')[0] === 'Bearer') {
        const token = Auth.split(' ')[1];
        if (token) {
            return jwt.verify(token, jwtKey, 'ss hh dd', function(err, decoded) {
                if (err) {
                    res.status(401).json({
                        status: false,
                        statusCode: 401,
                        message: 'Token expire Please login again...'
                    })
                } else {
                    req.user = {
                        id: decoded.id,
                        UserName: decoded.UserName,
                        FirstName: decoded.FirstName,
                        LastName: decoded.LastName,
                        exp: decoded.exp
                    }
                    next()
                }
            });
        } else {
            next()
        }
    } else {
        res.status(403).json({
            status: false,
            statusCode: 403,
            message: 'Token not providet'
        })
    }
}

module.exports = {
    auth
}