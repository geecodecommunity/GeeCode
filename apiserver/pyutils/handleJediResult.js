// {display,insert,hint,documentation_text}

var PyLangUtils = require('./PyLangUtils');
var PyTrieTree = require('./PyTrieTree');


var createCompletionItem = PyLangUtils.createCompletionItem;


function getlikeParams(obj, beforeVarNames) {
    var param_name = (obj['name'] || "").toLowerCase();
    for (var i = 0; i < beforeVarNames.length; i++) {
        var beforeVarName = beforeVarNames[i];
        var var_name_lower = (beforeVarName['var_name'] || "").toLowerCase();
        if (var_name_lower.indexOf(param_name) >= 0) {
            return beforeVarName;
        }
    }
    return null;
}


function getLikeNessaryVarNames(beforeVarNames, nessaryParams) {
    var result = [];
    for (var i = 0; i < nessaryParams.length; i++) {
        var obj = nessaryParams[i];
        var beforeVar = getlikeParams(obj, beforeVarNames);
        result.push({
            nessaryParam: obj,
            beforeVar: beforeVar
        });
    }

    return result;
}


function isUsedIn(likeNessaryVarNames, beforeVar) {
    for (var i = 0; i < likeNessaryVarNames.length; i++) {
        var obj = likeNessaryVarNames[i];
        if (obj.beforeVar && obj.beforeVar['var_name'] === beforeVar['var_name']) {
            return true;
        }
    }
    return false;
}


function getNotLikeBeforeVarNames(likeNessaryVarNames, beforeVarNames) {
    var result = [];

    for (var i = 0; i < beforeVarNames.length; i++) {
        var beforeVar = beforeVarNames[i];
        if (!isUsedIn(likeNessaryVarNames, beforeVar)) {
            result.push(beforeVar);
        }
    }

    return result;
}


function getBeforeVarNamesNeighbor(beforeVarNames, nessaryParams, pos_line) {

    var beforeVarNamesIn5 = [];
    for (var i = 0; i < beforeVarNames.length; i++) {
        var obj = beforeVarNames[i]; // var_name ,line
        if (pos_line - obj['line'] <= 5) {
            beforeVarNamesIn5.push(obj);
        }
    }

    if (beforeVarNamesIn5.length === 0) {
        return [];
    }

    var likeNessaryVarNames = getLikeNessaryVarNames(beforeVarNamesIn5, nessaryParams);
    var notLikeBeforeVarNames = getNotLikeBeforeVarNames(likeNessaryVarNames, beforeVarNamesIn5);
    var result = [];
    var notLikeUseIndex = 0;
    for (var i = 0; i < likeNessaryVarNames.length; i++) {
        var obj1 = likeNessaryVarNames[i];//{nessaryParam,beforeVar}
        if (obj1.beforeVar) {
            result.push(obj1.beforeVar['var_name'])
        } else {
            var sss = notLikeBeforeVarNames[notLikeUseIndex];
            result.push(sss['var_name']);
            notLikeUseIndex++;
        }
    }

    return result;
}

function createFunctionParamsItem(function_name, nessaryParams, beforeVarNames, contextObj) {


    var beforeVarNamesNeighbor = getBeforeVarNamesNeighbor(beforeVarNames, nessaryParams, contextObj['pos_line']);

    var params_names = [];
    for (var i = 0; i < nessaryParams.length; i++) {
        var obj = nessaryParams[i];
        var param_name = obj['name'];
        params_names.push(beforeVarNamesNeighbor[i] || param_name);
    }

    var insert_str = function_name + "(" + params_names.join(", ") + ")";
    return createCompletionItem(insert_str, insert_str, 'function');
}

function getNessaryParams(params) {
    var result = [];
    for (var i = 0; i < params.length; i++) {
        var obj = params[i];
        if (obj) {
            var param_desc = obj['description'] || '';
            if (param_desc && param_desc.indexOf('=') < 0) {
                result.push(obj);
            }
        }
    }
    return result;
}


function handleJediCompletionItem(jediItem, contextObj) {
    if (jediItem.name === 'NameError') {
        return [];
    }

    var beforeLines = contextObj['beforeLines'] || [];
    var curLineText = contextObj['curLineText'] || [];
    var beforeVarNames = contextObj['beforeVarNames'] || [];

    var item1 = createCompletionItem(jediItem['full_name'], jediItem['name'], jediItem['type']);

    var result = [item1];

    //item1.hint === "function" &&
    if (jediItem['type'] === "function") {
        //console.log(jediItem);
        var params = jediItem['params'] || [];
        if (params.length > 0) {
            var nessaryParams = getNessaryParams(params); //必填参数
            if (nessaryParams.length > 0) {
                result.push(createFunctionParamsItem(jediItem['name'], nessaryParams, beforeVarNames, contextObj))
            }
        }
    }

    return result
}


function sortJediResult(jediResult) {
    if (!jediResult) {
        return [];
    }
    // PyTrieTree.findFromLib();
    for (var i = 0; i < jediResult.length; i++) {
        var obj = jediResult[i];
        var fullname = obj['full_name'];
        if (fullname) {
            var fullname2 = fullname.replace('function_base.', '');//= fullname.split('.').join(" ");
            var treeValue = PyTrieTree.findFromLibByEqual(fullname2);
            obj.treeValue = treeValue;
        }
    }

    return jediResult.sort(function (a, b) {
        var a_treeValue = a.treeValue || {};
        var b_treeValue = b.treeValue || {};

        var a_node_datas = a_treeValue.node_datas || [];
        var b_node_datas = b_treeValue.node_datas || [];

        var a_data = (a_node_datas[0] || {})['data'] || [];
        var b_data = (b_node_datas[0] || {})['data'] || [];


        var count_a = a_data[4] || 0;
        var count_b = b_data[4] || 0;

        return count_b - count_a;
    });
}


function handleJediResult(jediResult, paramsObj) {
    var beforeLines = paramsObj['beforeLines'] || [];
    var curLineText = paramsObj['curLineText'] || "";
    var beforeVarNames = paramsObj['beforeVarNames'] || [];
    var pos_line = paramsObj['pos_line'] || 0;

    jediResult = sortJediResult(jediResult);

    var result = [];
    for (var i = 0; i < jediResult.length; i++) {
        var obj = jediResult[i];
        var itemArray = handleJediCompletionItem(obj, paramsObj);
        result = result.concat(itemArray);
    }
    return result;
}


module.exports = handleJediResult;