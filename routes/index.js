'use strict';

/**
 * 统一路由入口层
 * @type {[type]}
 */

const user = require('../controller/user');
const api = require('../controller/api');
const report = require('../controller/report');
const page = require('../controller/page')
const router = require('koa-router')();

/**
 * 页面路由设置
 */
router.get('/index.html', page.index);
router.get('/mobile.html', page.mobile);

router.get('/login.html', user.login)
router.get('/register.html', user.register);
router.get('/add-report.html', report.addReport);
router.get('/list-report.html', report.listReport);


/**
 * 上报数据数据展示
 */
router.get('/list-report-bad.html', report.listReportBad);
router.get('/count-report-bad.html', report.countReportBad);
router.get('/chart-report-bad.html', report.chartReportBad);

/**
 * api路由设置
 */
router.get('/v1/report', api.report);
router.get('/v1/device', api.addDevice);

router.post('/v1/register', api.register);
router.post('/v1/auth', api.auth);
router.post('/v1/logout', api.logout);
router.post('/v1/project', api.addProject);

router.get('/v1/test', api.test);

module.exports = router;