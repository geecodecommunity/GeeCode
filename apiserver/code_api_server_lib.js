var http = require('http');
var path = require('path');
var express = require('express');
var ejs = require('ejs');
var bodyParser = require('body-parser');
var HttpClient = require('./utils/HttpClient');
var handleJediResult = require('./pyutils/handleJediResult');
var handleEspecialResult = require('./pyutils/handleEspecialResult');
var PyLangUtils = require('./pyutils/PyLangUtils');
var PyTrieTree = require('./pyutils/PyTrieTree');
var PyTrieNodeUtils = require('./pyutils/PyTrieNodeUtils');
var PyExampleTrieTree = require('./pyutils/PyExampleTrieTree');
var UserInfoStore = require('./utils/UserInfoStore');

var jsonParser = bodyParser.json();
var rawParser = bodyParser.raw();

var ipcMain = null;
var isClientAutoSearch = false;

var app = express();

app.engine('html', ejs.renderFile);
app.set('x-powered-by', false);
app.set('views', path.join(__dirname, "./assets"));
app.set('view engine', 'html');
app.set('view cache', false);//dev环境不使用缓存

var ASSETS_FOLDER_PATH = path.join(__dirname, '../assets');

app.use("/assets", express.static(ASSETS_FOLDER_PATH, {maxAge: 1000 * 60 * 60 * 24 * 365}));


function getLineAndColumn(text, cursor_runes) {
    text = text || "";

    var beforeText = text.substr(0, cursor_runes);

    var beforeLines = beforeText.split("\n");

    var curLineText = beforeLines[beforeLines.length - 1];

    var pos_line = beforeLines.length;
    var pos_column = curLineText.length;

    console.log("pos_line : " + pos_line + "  , pos_column: " + pos_column);

    var beforeVarNames = PyLangUtils.getBeforeVarNames(beforeLines);

    var all_doc_words = PyLangUtils.getAllDocWords(text);

    return {
        pos_line: pos_line,
        pos_column: pos_column,
        beforeLines: beforeLines,
        curLineText: curLineText,
        beforeVarNames: beforeVarNames,
        all_doc_words: all_doc_words
    }
}

app.use(function (req, res, next) {
    req.headers['content-type'] = "application/json";
    next();
});
//
// app.post('/clientapi/editor/completions', jsonParser, async function (req, res) {
//     var req_body = req.body;
//
//     var text = req_body['text'];
//     var filename = req_body['filename'];
//
//     var cursor_runes = req_body['cursor_runes'];
//
//     var lindAndColumn = getLineAndColumn(text, cursor_runes);
//
//     var pos_line = lindAndColumn['pos_line'];
//     var pos_column = lindAndColumn['pos_column'];
//     var beforeLines = lindAndColumn['beforeLines'];
//     var curLineText = lindAndColumn['curLineText'];
//     var beforeVarNames = lindAndColumn['beforeVarNames'];
//     var all_doc_words = lindAndColumn['all_doc_words'];
//
//
//     if (isClientAutoSearch) {
//         if (curLineText && curLineText[curLineText.length - 1] === '.') {
//             var cur_line_words = curLineText.split(/[\s]/);
//             var cur_word = cur_line_words[cur_line_words.length - 1];
//             if (cur_word) {
//                 handleAutoSearch(text, pos_line, pos_column - 1, filename);
//             }
//         }
//     }
//
//
//     //1.自己的算法，特殊处理
//     var especial_result = handleEspecialResult({
//         beforeLines: beforeLines,
//         curLineText: curLineText,
//         beforeVarNames: beforeVarNames,
//         text: text,
//         pos_line: pos_line,
//         pos_column: pos_column,
//         filename: filename,
//         all_doc_words: all_doc_words
//     });
//
//     if (especial_result) {
//         res.send({completions: especial_result});
//         console.log("especial_result.length", especial_result.length);
//         return;
//     }
//
//     //2.调用jedi处理
//     var result = await HttpClient.sendPostRequest("http://127.0.0.1:34341/completions", {
//         text: text,
//         pos_line: pos_line,
//         pos_column: pos_column,
//         filename: filename
//     });
//
//
//     //3.对jedi对结果二次处理
//     var result2 = await handleJediResult(result, {
//         pos_line: pos_line,
//         beforeLines: beforeLines,
//         curLineText: curLineText,
//         beforeVarNames: beforeVarNames
//     });
//
//     console.log("result2.length", result2.length);
//     var result3 = {completions: result2};
//     // console.log(result3);
//     res.send(result3);
//
// });

//
// async function handleAutoSearch(text, pos_line, pos_column, filename) {
//     //2.调用jedi处理
//     var result = await HttpClient.sendPostRequest("http://127.0.0.1:34341/goto_assignments", {
//         text: text,
//         pos_line: pos_line,
//         pos_column: pos_column,
//         filename: filename
//     });
//
//     if (result && result.length > 0) {
//         var result0 = result[0];
//         var full_name = result0['full_name'] || '';
//         var p_name_s = result0['full_name'] || '';
//         //numpy.core.function_base.linspace  --> numpy.core.linspace
//         //numpy.core.multiarray.array  -->  numpy.core.array
//         var libresult = PyTrieTree.findFromLibByEqual(p_name_s);
//         if (libresult) {
//             console.log("EmitClientAutoSearch: " + p_name_s);
//             ipcMain.emit('ClientAutoSearch', p_name_s);
//             return;
//         }
//
//
//         var full_name_arr = full_name.split('.');
//         var file_name = full_name_arr[full_name_arr.length - 2];
//         p_name_s = full_name.replace(file_name+'.','');
//         var libresult = PyTrieTree.findFromLibByEqual(p_name_s);
//         if (libresult) {
//             console.log("EmitClientAutoSearch: " + p_name_s);
//             ipcMain.emit('ClientAutoSearch', p_name_s);
//             return;
//         }
//
//
//
//
//
//
//     }
// }

// ///clientapi/editor/event
// app.all('/clientapi/editor/event', jsonParser, async function (req, res) {
//
//     if (!isClientAutoSearch) {
//         console.log("clientapi/editor/event/isClientAutoSearch:false");
//         res.send("ok");
//         return;
//     }
//
//
//     var req_body = req.body;
//
//     var text = req_body['text'];
//     var source = req_body['source'];
//     var filename = req_body['filename'];
//     var selections = req_body['selections'];
//     var cursor_runes = req_body['cursor_runes'] || selections[0]['end'];
//     var lindAndColumn = getLineAndColumn(text, cursor_runes);
//     var pos_line = lindAndColumn['pos_line'];
//     var pos_column = lindAndColumn['pos_column'];
//     var curLineText = (lindAndColumn['curLineText'] || '').trim();
//
//     var selections0 = selections[0];
//
//     if (selections0) {
//         var selections0_start = selections0.start;
//         var selections0_end = selections0.end;
//         if (selections0_start < selections0_end) {
//             var selections0_word = text.substring(selections0_start, selections0_end);
//             if (PyLangUtils.startWith(curLineText, 'import')) {
//                 console.log(selections0_word)
//                 var libresult = PyTrieTree.findFromLibByEqual(selections0_word);
//                 if (libresult && libresult.node_datas && libresult.node_datas.length > 0) {
//                     var node_datas_best = PyTrieNodeUtils.findBestMatchNode(libresult.node_datas, selections0_word, curLineText);
//                     var p_name_s = selections0_word;
//                     if (node_datas_best) {
//                         p_name_s = node_datas_best['data_key'];
//                     }
//                     console.log("EmitClientAutoSearch: " + p_name_s);
//                     ipcMain.emit('ClientAutoSearch', p_name_s);
//                     return;
//                 }
//             }
//         }
//     }
//
//
//     await handleAutoSearch(text, pos_line, pos_column, filename);
//
//     res.send("ok")
// });



app.get('/clientapi/findExample',async function (req,res) {
    var full_api = req.query['full_api'];
    var result = PyExampleTrieTree.findExample(full_api);
    res.send(result);
});

app.get('/clientapi/findExampleHTML',async function (req,res) {
    var full_api = req.query['full_api'];
    console.log("findExampleHTML:" + full_api);
    var result = PyExampleTrieTree.findExample(full_api);
    var p = path.join(__dirname,'./htmls/findExampleHTML.html');
    res.render(p,{
        examples:result
    });
});




function autoFocusClient(full_name) {

    var p_name_s = full_name;

    if(p_name_s.indexOf('.') === -1){
        console.log("EmitClientAutoSearch: " + p_name_s);
        ipcMain.emit('ClientAutoSearch', p_name_s);
        return;
    }


    //numpy.core.function_base.linspace  --> numpy.core.linspace
    //numpy.core.multiarray.array  -->  numpy.core.array
    var libresult = PyTrieTree.findFromLibByEqual(p_name_s);
    if (libresult) {
        console.log("EmitClientAutoSearch: " + p_name_s);
        ipcMain.emit('ClientAutoSearch', p_name_s);
        return;
    }


    var full_name_arr = full_name.split('.');
    var file_name = full_name_arr[full_name_arr.length - 2];
    p_name_s = full_name.replace(file_name+'.','');
    var libresult = PyTrieTree.findFromLibByEqual(p_name_s);
    if (libresult) {
        console.log("EmitClientAutoSearch: " + p_name_s);
        ipcMain.emit('ClientAutoSearch', p_name_s);
        return;
    }

}

// axios.get(`http://127.0.0.1:34340/clientapi/autoFocusClient?full_name=${full_name}&kind=${kind}`);
app.get('/clientapi/autoFocusClient',async function (req,res) {
    var kind = req.query['kind'];
    var full_name = req.query['full_name'];
    autoFocusClient(full_name);
    res.send("ok");
});


function isBeginEndEqual(a, b) {
    var a_arr = a.split('.');
    var b_arr = b.split('.');
    if (a_arr[0] === b_arr[0] && a_arr[a_arr.length - 1] === b_arr[b_arr.length - 1]) {
        return true;
    }
    return false;
}


function get_full_api_weight(treeNode, full_api) {
    if (treeNode && treeNode.length > 0) {
        treeNode = treeNode.sort(function (a, b) {
            var a_name = a[1] || "";
            var b_name = b[1] || "";
            var a_weight = 0;
            var b_weight = 0;
            if (a_name === full_api) {
                a_weight = 99999999;
            }
            if (b_name === full_api) {
                b_weight = 99999999;
            }
            if (isBeginEndEqual(a_name, full_api)) {
                a_weight = 99999998;
            }
            if (isBeginEndEqual(b_name, full_api)) {
                b_weight = 99999998;
            }
            return b_weight - a_weight;
        });
        return treeNode[0][4];
    }
    return null;
}

app.post('/clientapi/getFullApiWeight', jsonParser, async function (req, res) {

    var req_body = req.body;
    var full_api_array = req_body['full_api_array'] || [];

    var result = {};
    for (var i = 0; i < full_api_array.length; i++) {
        var full_api = full_api_array[i];
        var full_api_split = full_api.split('.');
        var full_apix = full_api_split[0] + '.' + full_api_split[full_api_split.length - 1];
        var treeNode = PyTrieTree.findFromLib(full_apix);
        var full_api_weight  = get_full_api_weight(treeNode,full_api);
        result[full_api] = full_api_weight;
    }

    res.send(result);

});



app.post('/clientapiproxy/getClientUserInfo',  function (req, res) {
    var userInfo = UserInfoStore.getUserInfo();
    res.send(userInfo);
});


//
// app.get('/clientapi/ReadMembers',sqlitequery_handlers.handleReadMembers);
//
// app.get('/clientapi/ReadDoc',sqlitequery_handlers.handleReadDoc);
//
// app.get('/clientapi/SearchApi',sqlitequery_handlers.handleSearchApi);
//
// app.get('/clientapi/AllApiAndCount',sqlitequery_handlers.handleAllApiAndCount);
//
//



app.get("/clientapi/ping",function (req, res) {
    res.send("pong")
});



app.get('/*', function (req, res) {
    res.send("hello boys");
});




var api_server_port = 34340;

module.exports = {
    startApiServer: function (ipcMain0) {
        ipcMain = ipcMain0;


        ipcMain.on("ClientSetIsAutoSearch", function (e, isAutoSearch0) {
            isClientAutoSearch = !isAutoSearch0;
            console.log('ClientSetIsAutoSearch:' + isClientAutoSearch)
        });


        ipcMain.on("ClientSetUserInfo",function (e,userInfo) {
            UserInfoStore.setUserInfo(userInfo);
        });

        //46624
        try {
            http.createServer(app).listen(api_server_port); //just for test
        }catch (e){
            console.log("CreateServer Error")
        }
        // http.createServer(app).listen(34340);
        console.log('Server running at '+api_server_port);
    },

    setIsClientAutoSearch: function (isClientAutoSearch0) {
        isClientAutoSearch = isClientAutoSearch0;
    },

    setApiServerPort:function (p) {
        api_server_port = p;
    }

};
