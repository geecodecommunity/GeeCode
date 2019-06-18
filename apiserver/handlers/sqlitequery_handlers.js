// var db_init = require('../db/SqliteDbInit');
//
//
// function pickJsonField(rows, field_name) {
//     var result = [];
//     for (var i = 0; i < rows.length; i++) {
//         var obj = rows[i];
//         if(obj){
//             var filed_value = obj[field_name];
//             try {
//                 var json_obj = JSON.parse(filed_value);
//                 result.push(json_obj);
//             }catch (e){
//                 result.push(filed_value);
//             }
//         }
//     }
//     return result;
// }
//
// async function handleReadMembers(req, res) {
//     var full_api = req.query['full_api'];
//     var sql = "select members from python_code_doc where full_api=?";
//     var doc_db = db_init.getPythonCodeDocDbInstance();
//     var result =  await doc_db.sql(sql,full_api,"all");
//     res.send(pickJsonField(result,"members"));
// }
//
//
// async function handleReadDoc(req, res) {
//     var full_api = req.query['full_api'];
//     var sql = "select doc from python_code_doc where full_api=?";
//     var doc_db = db_init.getPythonCodeDocDbInstance();
//     var result =  await doc_db.sql(sql,full_api,"all");
//     res.send(pickJsonField(result,"doc"));
// }
//
//
// function orderByKeyword(str_list, keyword) {
//     keyword = keyword.toLowerCase();
//     var keyword1 = keyword + ".";
//
//     return str_list.sort(function (a,b) {
//
//         a = a.toLowerCase();
//         b = b.toLowerCase();
//
//         if(a === keyword && b!==keyword){
//             return -1;
//         }
//
//         if(a !== keyword && b===keyword){
//             return 1;
//         }
//
//         if(a.indexOf(keyword1) === 0  && b.indexOf(keyword1)!==0){
//             return -1;
//         }
//
//         if(a.indexOf(keyword1) !== 0  && b.indexOf(keyword1)===0){
//             return 1;
//         }
//
//
//         var a1 = a.indexOf(keyword);
//         var b1 = b.indexOf(keyword);
//
//         return a1 - b1;
//     });
// }
//
// async function handleSearchApi(req, res) {
//     var keyword = req.query['keyword'];
//     var sql = "select full_api,count from python_code_doc where full_api like '%'||?||'%' order by count desc limit 100";
//     var doc_db = db_init.getPythonCodeDocDbInstance();
//     var result =  await doc_db.sql(sql,keyword,"all");
//     res.send(result);
//     // res.send(orderByKeyword(pickJsonField(result,"full_api"),keyword));
// }
//
//
// function miniData(ddd) {
//     var result = [];
//     for (var i = 0; i < ddd.length; i++) {
//         var obj = ddd[i];
//         result.push([obj.full_api,obj.count,JSON.parse(obj.members)])
//     }
//     return result;
// }
//
//
//
// async function handleAllApiAndCount(req, res) {
//     try {
//         var sql = "select full_api,count,members from python_code_doc";
//         var doc_db = db_init.getPythonCodeDocDbInstance();
//         var result =  await doc_db.sql(sql,[],"all");
//         res.send(miniData(result));
//     }catch (e){
//         res.send(e.toString());
//     }
// }
//
// module.exports = {
//     handleReadMembers:handleReadMembers,
//     handleReadDoc:handleReadDoc,
//     handleSearchApi:handleSearchApi,
//     handleAllApiAndCount:handleAllApiAndCount
// };