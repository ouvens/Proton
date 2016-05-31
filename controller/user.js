'use strict';
/**
 * 中间件加载
 * @type {[type]}
 */

const session = require('koa-session-redis3');
const render = require('../lib/render');

const userDb = require('../models/user');

/**
 * 认证认证接口
 * @yield {[type]} [description]
 */
// const auth = function*() {
//     let ctx = this;
//     let auth = yield coRequest({
//         url: "http://dev.xiaodao360.cn/auth/login",
//         method: "POST",
//         header: config.oAuthHeader,
//         form: {
//             'client_key': 'key',
//             'device_id': 'id',
//             'os': 'android',
//             'password': 'sdf',
//             'platform': '3', // android=1，ios=2，h5=3  string  
//             'username': '18565814531'
//         }
//     });

//     let response = auth;
//     let data = JSON.parse(result.body);

// }


const login = function*(req, res) {

    let ctx = this;
    let uin = ctx.cookies.get('uin');
    let token = ctx.cookies.get('token');

    let result = yield userDb.findOne({
        userid: uin,
        pwd: token
    });

    if (result) {

        ctx.response.redirect('/list-report.html');
    } else {
        ctx.body = yield render('user/login', {});

    }

};

const register = function*() {
    let ctx = this;
    ctx.body = yield render('user/register', {});
}



module.exports = {
    login: login,
    register: register
}