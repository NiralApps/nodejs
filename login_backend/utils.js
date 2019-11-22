var _ = require('underscore')._, 
    jwt = require('jwt-simple');
const AUTH_MECH = "SM-AUTH",
      APP_SECRET = "logApp";
_.mixin({
    decodeToken: function(token){
        return jwt.decode(token, APP_SECRET);
    },
    encodeToken: function(obj){
        return jwt.encode(obj, APP_SECRET);
    },
    parseHeader: function(header){
        if(header.startsWith(AUTH_MECH) && header.contains('token=')){
            return header.between('token="', '"').toString();
        }
        else{
            return header;
        }
    }
})
module.exports = {
    _: _
} 