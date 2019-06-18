var fs = require("fs");
var path = require("path");
var TrieTree = require('./TrieTree');


var exampleJSONDataCache = null;
var isLoadingExampleJSONData = false;

function loadExampleJSONData() {
    if (exampleJSONDataCache) {
        return exampleJSONDataCache;
    }

    if (isLoadingExampleJSONData) {
        return null;
    }

    isLoadingExampleJSONData = true;
    const p = path.join(__dirname, '../db/example70mjson.json');
    fs.readFile(p, {encoding: 'utf-8'}, function (e, data) {
        isLoadingExampleJSONData = false;
        if (e) {
            return;
        }
        console.log(data.length);
        exampleJSONDataCache = JSON.parse(data);
        console.log(exampleJSONDataCache.rows.length);
    });
    return null;
}


function getColumnIndex(columns, name) {
    for (var i = 0; i < columns.length; i++) {
        var obj = columns[i];
        if (obj['name'] === name) {
            return i;
        }
    }
    return -1;
}

var python_code_json_columns = [];

function buildExampleTrieTree() {
    const python_code_json = loadExampleJSONData();
    if (!python_code_json) {
        return null;
    }

    const example_rows = python_code_json['rows'];
    python_code_json_columns = python_code_json['columns'];
    const FULL_API_INDEX = getColumnIndex(python_code_json['columns'], 'full_api');
    const ALPHABET_LIST = "abcdefghijklmnopqrstuvwxyz0123456789._ ";
    const trieTreeObj = new TrieTree(ALPHABET_LIST);

    for (var i = 0; i < example_rows.length; i++) {
        var code_item = example_rows[i];
        var full_api = code_item[FULL_API_INDEX];

        full_api = full_api.replace('(', '').replace(')', '');

        var data_key = full_api + "$$$$" + i;

        if (full_api) {
            trieTreeObj.insert(full_api, data_key, code_item);
            var full_api_word_arr = full_api.split('.');
            for (var j = 0; j < full_api_word_arr.length; j++) {
                var full_api_word = full_api_word_arr[j];
                var full_api_word_lower = full_api_word.toLowerCase();
                trieTreeObj.insert(full_api_word_lower, data_key, code_item);
            }
        }
    }
    // console.log(trieTreeObj);
    return trieTreeObj;
}


var exampleTrieTreeCache = null;

function getExampleTrieTree() {
    if (exampleTrieTreeCache) {
        return exampleTrieTreeCache;
    }
    exampleTrieTreeCache = buildExampleTrieTree();
    return exampleTrieTreeCache;
}


function toExampleItemList(xx) {
    var exampleItemList = [];
    for (var k in xx) {
        if (xx.hasOwnProperty(k)) {
            var item = xx[k];
            exampleItemList.push(item);
        }
    }
    return exampleItemList;
}

function filterExampleItemList(exampleItemList, startKey, endKey) {
    var result = [];

    for (var i = 0; i < exampleItemList.length; i++) {
        var item = exampleItemList[i];
        var data_key = item['data_key'] || '';

        var data_key_full_api = data_key.replace(/\$\$\$\$.+/gm, '');

        var data_key_array = data_key_full_api.split('.');
        var data_key_array0 = data_key_array[0];
        var data_key_array99 = data_key_array[data_key_array.length - 1];
        if (data_key_array0 === startKey && data_key_array99 === endKey) {
            result.push(item);
        }
    }

    return result;
}


function orderByVoteColumn(exampleItemList) {
    if (exampleItemList && exampleItemList.length > 0) {
        var VOTE_COLUMN_INDEX = getColumnIndex(python_code_json_columns, 'vote');
        return exampleItemList.sort(function (a, b) {
            var a_vote = a[VOTE_COLUMN_INDEX] || 0;
            var b_vote = b[VOTE_COLUMN_INDEX] || 0;
            return b_vote - a_vote;
        });
    }
    return [];
}

function getDataItemList(exampleItemList) {
    var exampleDataItemList = [];
    for (var i = 0; i < exampleItemList.length; i++) {
        var obj = exampleItemList[i];
        var obj_data = obj['data'];
        exampleDataItemList.push(obj_data);
    }
    return exampleDataItemList;
}



function toObjectItem(obj) {
    var resultObj = {};
    for (var i = 0; i < python_code_json_columns.length; i++) {
        var column_def = python_code_json_columns[i];
        var column_name = column_def['name'];
        var column_value = obj[i];
        resultObj[column_name] = column_value;
    }
    return resultObj;
}


function toObjectList(exampleItemList) {

    if (!exampleItemList || exampleItemList.length === 0) {
        return [];
    }

    var result = [];

    for (var i = 0; i < exampleItemList.length; i++) {
        var obj = exampleItemList[i];
        result.push(toObjectItem(obj))
    }

    return result;

}


function findExample(key) {
    key = key.toLowerCase();

    let keyArray = key.split('.');
    if (keyArray.length > 2) {
        keyArray = [keyArray[0], keyArray[keyArray.length - 1]];
    }

    let exampleTree = getExampleTrieTree();
    if (!exampleTree) {
        return [];
    }

    var xx = exampleTree.find_multikey(keyArray);
    var exampleItemList = toExampleItemList(xx);

    exampleItemList = filterExampleItemList(exampleItemList, keyArray[0], keyArray[1]);

    var exampleDataItemList = getDataItemList(exampleItemList);

    exampleDataItemList = orderByVoteColumn(exampleDataItemList);


    if (exampleDataItemList.length > 3) {
        return toObjectList(exampleDataItemList.slice(0, 3));
    }

    return toObjectList(exampleDataItemList);
}


setTimeout(function () {
    findExample("json.dump");
},10);

module.exports = {
    findExample: findExample
};