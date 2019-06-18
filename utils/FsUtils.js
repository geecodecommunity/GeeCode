var fs = require("fs");
var path = require("path");

function getHtmlString(xdirname,fileName) {
    var filePath = path.join(xdirname,fileName);
    var fileContent = fs.readFileSync(filePath, "utf-8");
    return fileContent;
}


module.exports = {
    getHtmlString:getHtmlString
};