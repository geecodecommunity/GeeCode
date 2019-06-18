
function startWith(str1, str2) {
    if (str1.length >= str2.length) {
        var str11 = str1.substring(0, str2.length);
        return str11 === str2;
    }
    return false;
}

function endWith(str1, str2) {
    if (str1.length >= str2.length) {
        var str11 = str1.substr(str1.length - str2.length, str2.length);
        return str11 === str2;
    }
    return false;
}


function includeStr(str1, target_str) {
    if(str1 && target_str){
        return str1.indexOf(target_str) >=0;
    }
    return false;
}


function removeEmptyItem(arr) {
    var result = [];
    for (var i = 0; i < arr.length; i++) {
        var obj = arr[i];
        if (obj) {
            result.push(obj);
        }
    }
    return result;
}




function createCompletionItem(full_name, name, hint) {

    return {
        display: name, //"component",
        documentation_html: full_name,
        documentation_text: full_name,
        hint: hint, //"function",
        insert: name,// display_name, //jediItem['complete'],//"component",
        smart: false,
        symbol: {
            value: [{
                repr: "GeeCall"
            }]
        }
    }
}





function getBeforeVarNames(beforeLines) {
    if (beforeLines.length < 2) {
        return [];
    }
    var result = [];
    for (var i = 0; i < beforeLines.length - 1; i++) {
        var obj = (beforeLines[i] || "").trim();
        var obj_arr = removeEmptyItem(obj.split(" "));
        if (obj_arr.length === 3 && obj_arr[1] === '=') {
            result.push({
                var_name:obj_arr[0],
                line:i+1
            })
        }
    }
    return result;
}


function getAllDocWords(text) {
    if(!text){
        return [];
    }
    var arr =  text.split(/[\n\s(\.]/);
    return removeEmptyItem(arr);
}


module.exports = {
    startWith:startWith,
    endWith:endWith,
    includeStr:includeStr,
    removeEmptyItem:removeEmptyItem,
    createCompletionItem:createCompletionItem,
    getBeforeVarNames:getBeforeVarNames,
    getAllDocWords:getAllDocWords
};