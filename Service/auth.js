// const sessionIDtoUserMap = new Map();
const jwt = require("jsonwebtoken");
const secretkey = "MYURL";

function setUser (/*id*/ user) {
    // sessionIDtoUserMap.set(id,user);
    
    return jwt.sign({
        _id:user._id,
        email:user.email,
        role:user.role,
    },secretkey);
}

function getUser (/*id*/ token) {
    if(!token) return null;
 
    // return sessionIDtoUserMap.get(id);
    // return jwt.verify(token, secretkey);
    
    try {
        return jwt.verify(token, secretkey);
    } catch (err) {
        return null;
    }
}

module.exports = {
    setUser,
    getUser,
}