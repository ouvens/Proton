'use strict';
/**
 * 中间件加载
 * @type {[type]}
 */

const coRequest = require("co-request");
const session = require('koa-session-redis3');
const util = require('../lib/util');
const render = require('../lib/render');
const config = require('./common/config');

const index = function*(req, res) {

    let ctx = this;
    try {
        let result = yield coRequest("http://localhost:8085/mock/indexPage.json");
        let response = result;
        let data = JSON.parse(response.body).result;

        ctx.body = yield render('page/index', {
            pageMenu: data.pageMenu,
            keywords: data.keywords,
            banner2: data.banner2,
            banner3: data.banner3,
            slider: data.slider,
            tabRecmend: data.tabs.recmendList,
            tabMore: data.tabs.moreList,
            panel3: data.panel3
        });
    } catch (e) {
        ctx.body = 404;
        console.log(e);
    }
};


const mobile = function*(req, res) {

    let ctx = this;

    try {
        let result = yield coRequest("http://localhost:8085/mock/indexPage.json");
        let response = result;
        let data = JSON.parse(response.body).result;

        ctx.body = yield render('index', {
            pageMenu: data.pageMenu,
            keywords: data.keywords,
            banner2: data.banner2,
            banner3: data.banner3,
            slider: data.slider,
            tabRecmend: data.tabs.recmendList,
            tabMore: data.tabs.moreList,
            panel3: data.panel3
        });
    } catch (e) {
        ctx.body = 404;
        console.log(e);
    }
};


module.exports = {
    index: index,
    mobile: mobile
}