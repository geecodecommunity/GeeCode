var FsUtils = require('../../FsUtils')


function initPage(Vue) {
    return {
        template: FsUtils.getHtmlString(__dirname, "SearchPage.html"),
        data: function () {
            return {
                message: "hello searchpage"
            };
        }
    }
}


module.exports = {
    initPage: initPage
};