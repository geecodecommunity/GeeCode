function createTrieNode(alphabet_size, val) {
    var children = Array(alphabet_size);///
    return {
        isEndOfWord: false,
        children: children,
        node_datas: [],
        node_char: val
    }
}

function createTrieData(data_key, data) {
    return {
        data_key: data_key,
        data: data
    }
}


function collectTrieNode(n, result_map) {
    if (n) {
        if (n.node_datas && n.node_datas.length > 0) {
            var nodesss = n.node_datas;
            for (var i = 0; i < nodesss.length; i++) {
                var obj = nodesss[i];
                if (obj) {
                    result_map[obj['data_key']] = obj;
                }
            }
        }
        if (n.children) {
            var children = n.children;
            for (var i = 0; i < children.length; i++) {
                var child = children[i];
                if (child) {
                    collectTrieNode(child, result_map);
                }
            }
        }
    }
}

function TrieTree(ALPHABET_LIST) {
    this.ALPHABET_LIST = ALPHABET_LIST;
    this.ALPHABET_INDEX = (function () {
        var result = [];
        for (var i = 0; i < ALPHABET_LIST.length; i++) {
            var charCode = ALPHABET_LIST.charCodeAt(i);
            result[charCode] = i;
        }
        return result;
    })();
    this.alphabet_size = this.ALPHABET_LIST.length;
    this.rootNode = createTrieNode(this.alphabet_size, null);
}


TrieTree.prototype.getCharChildrenIndex = function (key, level) {
    var charCode = key.charCodeAt(level);
    var ALPHABET_INDEX = this.ALPHABET_INDEX;
    return ALPHABET_INDEX[charCode];
};

TrieTree.prototype.insert = function (key, data_key, data) {
    var level;
    var length = key.length;
    var index;

    var pCrawl = this.rootNode;
    for (level = 0; level < length; level++) {
        index = this.getCharChildrenIndex(key, level);
        var xchar = key.charAt(level);
        if (!pCrawl.children[index]) {
            pCrawl.children[index] = createTrieNode(this.alphabet_size, xchar);
        }
        pCrawl = pCrawl.children[index];
    }
    // mark last node as leaf
    pCrawl.isEndOfWord = true;
    pCrawl.node_datas.push(createTrieData(data_key, data));
};


TrieTree.prototype.search = function (key, pCrawl) {
    if (!pCrawl) {
        return null;
    }

    var level;
    var length = key.length;
    var index;

    for (level = 0; level < length; level++) {
        index = this.getCharChildrenIndex(key, level);
        if (!pCrawl.children[index]) {
            return null;
        }
        pCrawl = pCrawl.children[index];
    }
    return pCrawl;
};

TrieTree.prototype.search_root = function (key) {
    return this.search(key, this.rootNode);
};


TrieTree.prototype.search_end_of_word = function (key) {
    var pCrawl = this.search_root(key);
    return (pCrawl && pCrawl.isEndOfWord);
};


TrieTree.prototype.find = function (key) {
    var pCrawl = this.search_root(key);
    var result_map = {};
    collectTrieNode(pCrawl, result_map);
    return result_map;
};


TrieTree.prototype.find_multikey = function (key_array) {
    if (key_array && key_array.length > 0) {

        var t = this;
        var result = {};
        var isFirst = true;

        for (var i = 0; i < key_array.length; i++) {
            var searchKey = (key_array[i] || "").trim();
            if (searchKey.length > 0) {

                if (isFirst) {
                    result = t.find(searchKey);
                    isFirst = false;
                }
                else {
                    var merged = {};
                    var merged_count = 0;
                    var newResult = t.find(searchKey);
                    for (var key in newResult) {
                        if (newResult.hasOwnProperty(key)) {
                            if (result[key]) {
                                merged_count++;
                                merged[key] = newResult[key];
                            }
                        }
                    }
                    result = merged;
                    if (merged_count === 0) {
                        return null;
                    }
                }
            }
        }
        return result;
    }

    return {};
};



module.exports = TrieTree;

//
// function main() {
//     var ALPHABET_LIST = "abcdefghijklmnopqrstuvwxyz0123456789._ ";
//
//     var datas = ["hello", "world", "hello world","helwssd"];
//     var search = new TrieTree(ALPHABET_LIST);
//     for (var i = 0; i < datas.length; i++) {
//         var obj = datas[i];
//         search.insert(obj, obj);
//     }
//
//     console.log(search.search_all("hel"));
//     console.log(search.search_all("hello"));
// }
//
// main()