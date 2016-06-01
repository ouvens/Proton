'use strict';
/**
 * 中间件加载
 * @type {[type]}
 */

const render = require('../lib/render');

const userDb = require('../models/user');
const md5 = require('../lib/md5');

/**
 * /
 * @param {[type]} req           [description]
 * @param {[type]} res           [description]
 * @yield {[type]} [description]
 */


const login = function*(req, res) {

    let ctx = this;
    let uin = ctx.cookies.get('uin');
    let token = ctx.cookies.get('token');

    ctx.session.csrf = md5(Math.random(0, 1).toString()).slice(5, 15);

    if (uin && token) {
        let result = yield userDb.findOne({
            userid: uin,
            pwd: token
        });

        if (result) {
            ctx.response.redirect('/list-report.html');
        }
    } else {

        ctx.body = yield render('user/login', {
            csrf: ctx.session.csrf
        });
    }


};

const register = function*() {

    let ctx = this;
    ctx.session.csrf = md5(Math.random(0, 1).toString()).slice(5, 15);
    ctx.body = yield render('user/register', {
        csrf: ctx.session.csrf
    });
}



module.exports = {
    login: login,
    register: register
}