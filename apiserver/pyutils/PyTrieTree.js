var python_code_doc_json = require('../db/python_code_doc.json');
var TrieTree = require('./TrieTree');


//[0,"werkzeug.debug.repr",31735,"module",74]
function buildTrieTreeFromLib() {
    var ALPHABET_LIST = "abcdefghijklmnopqrstuvwxyz0123456789._ ";
    var trieTreeObj = new TrieTree(ALPHABET_LIST);
    for (var i = 0; i < python_code_doc_json.length; i++) {
        var code_item = python_code_doc_json[i];
        var full_api = code_item[1];
        if (full_api) {

            trieTreeObj.insert(full_api, full_api, code_item);

            var full_api_word_arr = full_api.split('.');
            for (var j = 0; j < full_api_word_arr.length; j++) {
                var full_api_word = full_api_word_arr[j];
                var full_api_word_lower = full_api_word.toLowerCase();
                trieTreeObj.insert(full_api_word_lower, full_api, code_item);
            }
        }
    }
    return trieTreeObj;
}


function buildTrieTreeFromKeyWord() {
    var ALPHABET_LIST = "abcdefghijklmnopqrstuvwxyz0123456789._ ";
    var trieTreeObj = new TrieTree(ALPHABET_LIST);
    var keywords = ["and", "as", "assert", "break", "class", "continue", "def", "del", "elif", "else", "except", "exec", "finally", "for", "from", "global", "if", "import", "in", "is", "lambda", "None", "not", "or", "pass", "print", "raise", "return", "self", "try", "while", "with", "yield", "int", "float", "long", "complex", "hex", "abs", "all", "any", "apply", "basestring", "bin", "bool", "buffer", "bytearray", "callable", "chr", "classmethod", "cmp", "coerce", "compile", "complex", "delattr", "dict", "dir", "divmod", "enumerate", "eval", "execfile", "file", "filter", "format", "frozenset", "getattr", "globals", "hasattr", "hash", "help", "id", "input", "intern", "isinstance", "issubclass", "iter", "len", "locals", "list", "map", "max", "memoryview", "min", "next", "object", "oct", "open", "ord", "pow", "print", "property", "reversed", "range", "raw_input", "reduce", "reload", "repr", "reversed", "round", "set", "setattr", "slice", "sorted", "staticmethod", "str", "sum", "super", "tuple", "type", "unichr", "unicode", "vars", "xrange", "zip", "True", "False", "__dict__", "__methods__", "__members__", "__class__", "__bases__", "__name__", "__mro__", "__subclasses__", "__init__", "__import__"]
    for (var i = 0; i < keywords.length; i++) {
        var keyword = keywords[i];
        //[0,"werkzeug.debug.repr",31735,"module",74]
        trieTreeObj.insert(keyword, keyword, [-1, keyword, -1, "keyword", 10000]);
    }
    return trieTreeObj;
}

function getMapDataValues(mapObj) {
    var result = [];
    for (var k in mapObj) {
        if (mapObj.hasOwnProperty(k)) {
            var v = mapObj[k];
            if (v && v.data) {
                result.push(v.data)
            }
        }
    }
    return result;
}


function sortByCount(arr) {
    //[0,"werkzeug.debug.repr",31735,"module",74]
    return arr.sort(function (a, b) {
        var a_count = a[4] || 0;
        var b_count = b[4] || 0;
        return b_count - a_count;
    });
}


function searchTrieTree(trieTreeObj, key) {
    var key_arr = key.split(/[\.\s]/);
    var result_map = trieTreeObj.find_multikey(key_arr);
    var result_arr = getMapDataValues(result_map);
    var result_arr2 = sortByCount(result_arr);
    return result_arr2;
}

function findByKind(item_list, kind) {
    var result = [];
    for (var i = 0; i < item_list.length; i++) {
        var obj = item_list[i];
        ////[0,"werkzeug.debug.repr",31735,"module",74]
        var obj_kind = obj[3];
        if(obj_kind === kind){
            result.push(obj)
        }
    }
    return result;
}


var trieTreeObj_json_lib = buildTrieTreeFromLib();
var trieTreeObj_keywords = buildTrieTreeFromKeyWord();


module.exports = {
    findFromLibByEqual:function (key) {
        return trieTreeObj_json_lib.search_root(key);
    },
    findFromLib: function (key,kind) {
        var item_list = searchTrieTree(trieTreeObj_json_lib, key);
        if(kind && kind.length > 0 ){
            item_list = findByKind(item_list,kind);
        }
        if (item_list.length > 10) {
            return item_list.slice(0, 10);
        }
        return item_list;
    },
    findFromKeyword: function (key) {
        return searchTrieTree(trieTreeObj_keywords, key);
    },
    getMapDataValues: function (mm) {
        return getMapDataValues(mm);
    }
};


//
// function main() {
//     var trieTreeObj = buildTrieTree();
//     var sss1 = trieTreeObj.find("json");
//     console.log(sss1);
//
//     var sss2 = searchTrieTree(trieTreeObj, "json.dump");
//     console.log(sss2);
//
//     var sss3 = searchTrieTree(trieTreeObj, "jso dump");
//     console.log(sss3);
// }
//
// main();