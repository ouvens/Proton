'use strict';
/**
 * 中间件加载
 * @type {[type]}
 */

const session = require('koa-session-redis3');
const render = require('../lib/render');
const util = require('../lib/util');
const status = require('./common/status');

const projectDb = require('../models/project');
const reportDb = require('../models/report');


const addReport = function*(req, res) {
    status.authCheck(this);

    let ctx = this;
    ctx.body = yield render('report/add-report', {});
}

/**
 * 列出所有上报项目
 * @param {[type]} req           [description]
 * @param {[type]} res           [description]
 * @yield {[type]} [description]
 */
const listReport = function*(req, res) {
    status.authCheck(this);

    let ctx = this;
    let userid = ctx.cookies.get('uin');
    let type = ctx.query.type;
    let viewName;

    // 不同上报类型分不同的模板
    switch (type) {
        case 'bad':
            viewName = 'report/list-bad';
            break;
        case 'speed':
            viewName = 'report/list-speed';
            break;
        case 'statis':
            viewName = 'report/list-statis';
            break;
        default:
            viewName = 'report/list';
            break;
    }

    let result = yield projectDb.find({
        userid: userid,
        type: type
    });
    res = yield render(viewName, {
        data: result
    });

    ctx.body = res;
}

/**
 * 列出上报错误的列表
 * @param {[type]} req           [description]
 * @param {[type]} res           [description]
 * @yield {[type]} [description]
 */
const listReportBad = function*(req, res) {
    status.authCheck(this);

    let ctx = this;
    let reportid = ctx.query.id;
    let msg = decodeURIComponent(ctx.query.msg);

    let condition = {};

    if (reportid && msg) {
        let msgResult = yield reportDb.find({
            id: reportid,
            type: 'bad'
        }, {
            limit: 40
        });

        let reportResult = yield projectDb.findOne({
            id: reportid
        });

        if (reportResult) {
            res = yield render('report/list-report-bad', {
                data: msgResult,
                info: reportResult // 设置全局信息，复用第一个元素的信息
            });
        } else {
            res = {
                code: 404,
                msg: '没有数据'
            };
        }
    } else {
        res = {
            code: 404,
            msg: '没有数据'
        };
    }

    ctx.body = res;
}

/**
 * 错误量统计页面
 * @param {[type]} req           [description]
 * @param {[type]} res           [description]
 * @yield {[type]} [description]
 */
const countReportBad = function*(req, res) {
    status.authCheck(this);

    let ctx = this;
    let reportid = ctx.query.id;

    let condition = {};
    let dataArr = [];

    if (reportid) {
        let msgResult = yield reportDb.distinct('msg', {
            id: reportid
        });
        let count;
        for (let msg of msgResult) {
            count = yield reportDb.count({
                msg: msg
            });

            dataArr.push({
                count: count,
                msg: msg
            })
        }

        let reportResult = yield projectDb.findOne({
            id: reportid
        });

        if (reportResult) {
            res = yield render('report/count-report-bad', {
                data: msgResult,
                info: reportResult, // 设置全局信息，复用第一个元素的信息
                countData: dataArr
            });
        } else {
            res = {
                code: 404,
                msg: '没有数据'
            };
        }

    } else {
        res = {
            code: 404,
            msg: '没有数据'
        };
    }

    ctx.body = res;
}

/**
 * 错误量报表页面
 * @param {[type]} req           [description]
 * @param {[type]} res           [description]
 * @yield {[type]} [description]
 */
const chartReportBad = function*(req, res) {
    status.authCheck(this);

    let ctx = this;

    let reportid = ctx.query.id;
    let now = +new Date();
    let timeMatch = 'yy-mm-dd';
    let timeRang = 1000 * 3600 * 24;

    let count, date;
    let dataArr = [],
        dateArr = [];

    if (reportid) {
        /**
         * 逐个查询每天的上报量生成报表
         */
        for (let i = 0; i < 9; i++) {
            date = util.time.format(timeMatch, now - timeRang * i)
            count = yield reportDb.count({
                id: reportid,
                time: new RegExp(date)
            });
            dateArr.unshift(date);
            dataArr.unshift(count);
        }

        let reportResult = yield projectDb.findOne({
            id: reportid
        });

        if (reportResult) {
            res = yield render('report/chart-report-bad', {
                info: reportResult, // 设置全局信息，复用第一个元素的信息
                dateArr: dateArr,
                dataArr: dataArr
            });
        } else {
            res = {
                code: 404,
                msg: '没有数据'
            };
        }
    } else {
        res = {
            code: 404,
            msg: '没有数据'
        };
    }

    ctx.body = res;
}

module.exports = {
    listReport: listReport,
    addReport: addReport,
    listReportBad: listReportBad,
    countReportBad: countReportBad,
    chartReportBad: chartReportBad
}