var codeApiServer = require('./code_api_server_lib');

codeApiServer.setIsClientAutoSearch(true);
codeApiServer.setApiServerPort(46624);

codeApiServer.startApiServer({
    on:function () {

    },
    emit:function () {

    }
});