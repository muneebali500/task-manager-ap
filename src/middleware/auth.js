const jwt = require(`jsonwebtoken`);        // we require it to get the token authenticated
const User = require(`../models/user`);     // we require it to find the token in database

const auth = async (req, res, next) => {
    try {
        const token = req.header(`Authorization`).replace(`Bearer `, ``); // to get the token from postman
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // to check if the token is valid
        const user = await User.findOne({ id: decoded._id, 'tokens.token': token }); // find the user in database with correct id, who has token stored in token array
        if(!user) {
            throw new Error();
        }
        // if the user is found, we need to do 2 things:
        // 1) we have to make sure that route handler runs as the user has proven his authetication; which means calling next()
        // 2) give the route handler access to user we fetched from database. we already have fetched the user above so there is no need to do this. instead we will add a property to req object so that route handlers can access that later

        req.token = token; // we will use this token in case of logout to delete token we got when authenticated
        req.user = user;
        next();
    } catch (e) {
        res.status(401).send({ error: `Please authenticate` });
    }
}

module.exports = auth;