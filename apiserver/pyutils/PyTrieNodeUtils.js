var PyLangUtils = require('./PyLangUtils');



function findBestMatchNode(node_datas,selections0_word,curLineText) {
    var line_words = curLineText.split(/\s/);
    line_words = PyLangUtils.removeEmptyItem(line_words);


    var curword = null;
    for (var i = 0; i < line_words.length; i++) {
        var line_word = line_words[i];
        if(line_word.indexOf(selections0_word)>=0){
            curword = line_word
        }
    }



    for (var i = 0; i < node_datas.length; i++) {
        var obj = node_datas[i] || {};
        var data_key = obj['data_key'];
        if(data_key === curword){
            return obj;
        }
    }

    return null;
}




module.exports = {
    findBestMatchNode:findBestMatchNode
};