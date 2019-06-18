var PyLangUtils = require('./PyLangUtils');
var PyTrieTree = require('./PyTrieTree');
var TrieTree = require('./TrieTree');


var startWith = PyLangUtils.startWith;
var endWith = PyLangUtils.endWith;
var includeStr = PyLangUtils.includeStr;
var removeEmptyItem = PyLangUtils.removeEmptyItem;


function createCompletionItem(full_name, insert, hint) {
    return {
        display: full_name, //"component",
        documentation_html: full_name,
        documentation_text: full_name,
        hint: hint, //"function",
        insert: insert,// display_name, //jediItem['complete'],//"component",
        smart: false,
        symbol: {
            value: [{
                repr: "GeeCall"
            }]
        }
    }
}

function stringResultToCompletionItems(search_result, type) {
    var completions = [];

    for (var i = 0; i < search_result.length; i++) {
        var obj = search_result[i];
        var obj_name = obj[1];
        completions.push(createCompletionItem(obj_name, obj_name, type))
    }

    return completions;
}


function filterNameStartWith(search_result, start_str) {
    var result = [];
    for (var i = 0; i < search_result.length; i++) {
        var obj = search_result[i];
        var obj_name = obj[1];
        if (startWith(obj_name, start_str)) {
            result.push(obj);
        }
    }
    return result;
}


function appendNameStr(search_result, str) {
    var result = [];
    for (var i = 0; i < search_result.length; i++) {
        var obj = search_result[i];
        var obj_name = obj[1];
        var obj2 = [].concat(obj);
        obj2[1] = obj_name + str;
        result.push(obj2);
    }
    return result;
}


function importCompletionAsAlias_appendImportAs(as_list, prefix) {
    var result = [];
    for (var i = 0; i < as_list.length; i++) {
        var obj = as_list[i];
        var kk = prefix + obj;
        result.push(createCompletionItem(kk, kk, 'string'))
    }
    return result;
}


var importAsAliasList = {
    'argparse':'ap',
    'collections':'python',
    'datetime':'dt',
    'logging':'log',
    'matplotlib.pyplot':'plt',
    'matplotlib':'plt',
    'multiprocessing':'mp',
    'numpy':'np',
    'networkx':'nx',
    'operator':'op',
    'openpyxl':'px',
    'pandas':'pd',
    'pprint':'pp',
    'pygame':'pg',
    'pylab':'pl',
    'queue':'q',
    'qpid':'qd',
    'random':'rd',
    'sqlalchemy':'sa',
    'scipy':'sp',
    'xml':'ET'
};




function importCompletionAsAlias(line_words, prefix) {
    var asAliasList = [];
    var ss = line_words[1];
    var importAsAliasObj = importAsAliasList[ss];
    if (importAsAliasObj) {
        asAliasList = [importAsAliasObj]
    }
    else if (ss.length < 5) {
        asAliasList = [ss]
    }
    return importCompletionAsAlias_appendImportAs(asAliasList, prefix);
}

function getImportModuleAs(full_name) {
    var importAsAliasObj = importAsAliasList[full_name];
    if(importAsAliasObj){
        return full_name + " as " + importAsAliasObj;
    }
    return null;
}


function importCompletionModule(line_words, suffix) {
    suffix = suffix || "";
    var search_name = line_words[1] || "";
    var search_result = PyTrieTree.findFromLib(search_name, "module");
    //[0,"werkzeug.debug.repr",31735,"module",74]
    if (search_result.length > 0) {
        var completion_items = [];
        for (var i = 0; i < search_result.length; i++) {
            var obj = search_result[i];
            var obj_name = obj[1];
            var full_name = obj[1];
            if (search_name.indexOf('.') > 0) {
                var search_name1_dot = search_name.lastIndexOf(".");
                var search_name1 = search_name.substring(0, search_name1_dot);
                obj_name = obj_name.replace(search_name1 + ".", '');
            }

            if(!suffix){
                var importModuleAs = getImportModuleAs(full_name);
                if(importModuleAs){
                    completion_items.push(createCompletionItem(importModuleAs, importModuleAs, "module"))
                }
            }

            completion_items.push(createCompletionItem(full_name, obj_name + suffix, "module"))
        }
        return completion_items;
    }
    return [];
}


function fromImportSubs(line_words) {
    var cur_word_arr = line_words[line_words.length - 1].split(',');
    var cur_word = cur_word_arr[cur_word_arr.length - 1];

    var search_name = line_words[1] + " " + cur_word;
    var search_result = PyTrieTree.findFromLib(search_name, 'function');

    if (search_result.length > 0) {
        var completion_items = [];
        for (var i = 0; i < search_result.length; i++) {
            var obj = search_result[i];
            var obj_name = obj[1];
            var full_name = obj[1];
            var insert_name = obj_name.replace(line_words[1] + ".", '');
            completion_items.push(createCompletionItem(full_name, insert_name, "function"))
        }
        return completion_items;
    }
    return [];
}


function buildAllDocWordTree(all_doc_words) {
    var ALPHABET_LIST = "abcdefghijklmnopqrstuvwxyz0123456789._ ";
    var trieTreeObj = new TrieTree(ALPHABET_LIST);
    for (var i = 0; i < all_doc_words.length; i++) {
        var word = all_doc_words[i];
        //[0,"werkzeug.debug.repr",31735,"module",74]
        trieTreeObj.insert(word, word, [-1, word, -1, "string", 10000]);
    }
    return trieTreeObj;
}

function searchAllDocWordTree(all_doc_words_tree, word, exceptWord) {
    var ss = all_doc_words_tree.find(word);
    ss = PyTrieTree.getMapDataValues(ss);
    var ss2 = [];
    if (exceptWord) {
        for (var i = 0; i < ss.length; i++) {
            var obj = ss[i];
            var ww = obj[1];
            if (ww !== exceptWord) {
                ss2.push(obj);
            }
        }
    } else {
        ss2 = ss;
    }
    return ss2;
}


function completionWithKeyAndABC(all_doc_words_tree, currentWord) {
    var currentWordSplit2 = currentWord.split(/[(\.]/);
    currentWordSplit2 = removeEmptyItem(currentWordSplit2);
    var currentWord2 = currentWordSplit2[currentWordSplit2.length - 1];
    console.log(currentWord2)
    var search_result = PyTrieTree.findFromKeyword(currentWord2);
    var search_result2 = searchAllDocWordTree(all_doc_words_tree, currentWord2, currentWord2);
    var search_result3 = PyTrieTree.findFromLib(currentWord2);
    var merge_result = search_result2.concat(search_result);
    merge_result = merge_result.concat(search_result3);
    if (merge_result.length > 0) {
        return stringResultToCompletionItems(merge_result, 'string');
    }
    return null;
}


function handleEspecialResult(paramsObj) {
    var text = paramsObj.text;
    var pos_line = paramsObj.pos_line;
    var pos_column = paramsObj.pos_column;
    var filename = paramsObj.filename;
    var beforeLines = paramsObj.beforeLines || [];
    var curLineText = (paramsObj['curLineText'] || "");
    var curLineTextTrim = (paramsObj['curLineText'] || "").trim();
    var all_doc_words = paramsObj['all_doc_words'] || [];
    var all_doc_words_tree = buildAllDocWordTree(all_doc_words);

    var line_words = curLineText.split(/[\s]/);
    line_words = removeEmptyItem(line_words);
    var currentWord = null;
    if (line_words.length > 0) {
        currentWord = line_words[line_words.length - 1];
    }

    if (startWith(curLineTextTrim, "import")) {
        if (line_words.length === 2) {
            return importCompletionModule(line_words, "");
        }
        else if (line_words.length === 3 && (line_words[2] === 'a' || line_words[2] === 'as')) {
            return importCompletionAsAlias(line_words, 'as ').concat([createCompletionItem("as", 'as', "keyword")]);
        }
        else if (line_words.length >= 3 && line_words[2] === 'as') {
            return importCompletionAsAlias(line_words, '');
        }
        return [];
    }

    else if (startWith(curLineTextTrim, "from")) {
        if (line_words.length === 2) {
            return importCompletionModule(line_words, " import ");
        }
        if (line_words.length === 3) {
            return [createCompletionItem('import', 'import', 'keyword')];
        }
        if (line_words.length >= 4) {
            return fromImportSubs(line_words);
        }
    }


    else if (line_words.length === 1) {
        if(currentWord.indexOf('.')=== -1){
            return completionWithKeyAndABC(all_doc_words_tree, currentWord);
        }
    }

    else if (line_words.length >= 2) {
        if (line_words[0] === 'def') {
            if (currentWord.startsWith("_")) {
                var search_result = PyTrieTree.findFromKeyword(line_words[1]);
                search_result = filterNameStartWith(search_result, '__');
                search_result = appendNameStr(search_result, "(self):");
                if (search_result.length > 0) {
                    return stringResultToCompletionItems(search_result, 'keyword');
                }
            }
            return completionWithKeyAndABC(all_doc_words_tree, currentWord);
        }

        else if (line_words[0] === 'class') {
            return completionWithKeyAndABC(all_doc_words_tree, currentWord);
        }
    }


    // //默认处理
    // if (line_words.length >= 1) {
    //     if (endWith(curLineTextTrim, '.')) {
    //         var last_line_word = line_words[line_words.length - 1];
    //         console.log(last_line_word);
    //         if(last_line_word.length > 1){
    //             var last_line_word_var = last_line_word.substring(0,last_line_word.length-1);
    //             console.log(last_line_word_var);
    //             var word_kind = searchWhatIsThisVar(beforeLines,last_line_word_var);
    //         }
    //     }
    // }

    return null;
}


module.exports = handleEspecialResult;