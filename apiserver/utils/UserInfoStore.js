
var userInfo = {
    token: null,
    tokenName: null,
    nameOrEmail: null,
    JSESSIONID:null
};


function setUserInfo(_userInfo) {
    Object.assign(userInfo, _userInfo);
}


function getUserInfo() {
    return userInfo;
}


module.exports = {
    setUserInfo: setUserInfo,
    getUserInfo: getUserInfo
};