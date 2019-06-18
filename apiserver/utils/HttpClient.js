var http = require('http');
var url = require('url');

function sendHttpRequest(http_method, path, postData) {

    var url_parsed = url.parse(path);
    var hostname = url_parsed['hostname'];
    var port = url_parsed['port'];
    var pathname = url_parsed['pathname'];

    return new Promise(function (resolve, reject) {

        var options = {
            hostname: hostname,
            port: port,
            path: pathname,
            method: http_method,
            headers: {
                'Content-Type': 'application/json;charset=UTF-8'
            }
        };

        if (postData) {
            options.headers['Content-Length'] = Buffer.byteLength(postData)
        }


        var httpClient = http.request(options, function (res) {
            var chunks = [];
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                chunk = chunk.toString('utf-8');
                chunks.push(chunk);
            });
            res.on('end', function () {
                try {
                    var buff = chunks.join("");
                    var x = JSON.parse(buff);
                    resolve(x);
                } catch (e) {
                    reject(e);
                }

            });
        });

        httpClient.on('error', function (e) {
            reject(e.message);
        });
        if (postData) {
            httpClient.write(postData);
        }
        httpClient.end();
    });
}

function sendGetRequest(path) {
    return sendHttpRequest("GET", path);
}

function sendPostRequest(path, postData) {
    postData = JSON.stringify(postData);
    return sendHttpRequest("POST", path, postData);
}

module.exports = {
    sendGetRequest: sendGetRequest,
    sendPostRequest: sendPostRequest
};