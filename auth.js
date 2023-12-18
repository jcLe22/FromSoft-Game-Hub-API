const jwt = require('jsonwebtoken');

const secret = 'VideoGameAPI';

module.exports.createAccessToken = (user) => {
    const data = {
        id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
        orderedProduct: user.orderedProduct
    };

    return jwt.sign(data, secret, {});
};

module.exports.verify = (req, res, next) => {

    let token = req.headers.authorization;

    if(typeof token == 'undefined') {
        return res.send({auth: "Authentication failed. No Token."});
    } else {
        
        token = token.slice(7, token.length);
        console.log(token);

        jwt.verify(token, secret, function(err, decodedToken) {
            if(err) {

                return res.send({
                    auth: "Failed",
                    message: err.message
                });

            } else {

                console.log(decodedToken);
                req.user = decodedToken;
                next();

            }
        })

    }
}

module.exports.verifyAdmin = (req, res, next) => {
    if(req.user.isAdmin) {
        next()
    } else {
        return res.send({
            auth: "Failed",
            message: "Action Forbidden!"
        })
    }
}