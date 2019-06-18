// var SQLite3 = require('sqlite3').verbose();
//
// /**
//  * 使用sqlite3持久化数据
//  * 需求：把一个数组中的每个对象,每个对象中的属性,存到xxx.db文件中去,像数据库一样的去操作它
//  * 功能：1. 创建数据库(数据库存在的话，那就直接打开)
//  *       2. 创建一个表(表存在的话就不用创建啦)
//  *       3. 有了数据库和表, 最最基础的功能就是：
//  *          插入数据(单个数据插入或者多个并行插入)
//  *          更新数据(根据不同的条件更新每列数据)
//  *          删除数据(根据不同的条件来删除每列数据)
//  *          查询数据(单个数据查询，多个数据查询)
//  */
// function SqliteHandleDB(options) {
//     this.databaseFile = options && options.databaseFile || `./data/test.db`;    // 数据库文件(文件路径+文件名)
//     this.tableName = options && options.tableName || `adsTable`;   // 表名
//     this.db = null;
// }
//
// // 连接数据库(不存在就创建,存在则打开)
// SqliteHandleDB.prototype.connectDataBase = function () {
//     var _self = this;
//     return new Promise(function (resolve, reject) {
//         _self.db = new SQLite3.Database(_self.databaseFile, function (err) {
//             if (err) reject(new Error(err));
//             resolve('数据库连接成功');
//         });
//     });
// };
//
// SqliteHandleDB.prototype.createTable = function (sentence) {
//     var _self = this;
//     return new Promise(function (resolve, reject) {
//         _self.db.exec(sentence, function (err) {
//             if (err) reject(new Error(err));
//             resolve(`表创建成功 / 已存在,不需要重新创建该表`);
//         });
//     });
// };
//
//
// SqliteHandleDB.prototype.sql = function (sql, param, mode) {
//     var _self = this;
//     mode = mode === 'all' ? 'all' : mode === 'get' ? 'get' : 'run';
//     return new Promise(function (resolve, reject) {
//         _self.db[mode](sql, param,
//             function (err, data) {
//                 if (err) {
//                     reject(new Error(err));
//                 } else {
//                     if (data) {
//                         resolve(data);
//                     } else {
//                         resolve('success');
//                     }
//                 }
//             }
//         );
//     });
// };
//
//
// module.exports = SqliteHandleDB;