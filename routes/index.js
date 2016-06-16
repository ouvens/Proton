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
router.get('/proton/mobile.html', page.mobile);

router.get('/proton/index.html', report.addReport);
router.get('/proton/login.html', user.login)
router.get('/proton/register.html', user.register);
router.get('/proton/add-report.html', report.addReport);
router.get('/proton/list-report.html', report.listReport);


/**
 * 上报数据数据展示
 */
router.get('/proton/list-report-bad.html', report.listReportBad);
router.get('/proton/count-report-bad.html', report.countReportBad);
router.get('/proton/chart-report-bad.html', report.chartReportBad);
router.get('/proton/my-report-bad.html', report.myReportBad);
router.get('/proton/count-report-statis.html', report.countReportStatis);
router.get('/proton/chart-report-statis.html', report.chartReportStatis);

/**
 * api路由设置
 */
// 上报错误接口
router.get('/proton/v1/report', api.reportBad);
// 上报统计量接口
router.get('/proton/v1/statis', api.reportStatis);

router.post('/proton/v1/register', api.register);
router.post('/proton/v1/auth', api.auth);
router.post('/proton/v1/logout', api.logout);
router.post('/proton/v1/project', api.addProject);

router.post('/proton/v1/attention', api.addAttention);

router.delete('/proton/v1/attention/:reportid/:csrf', api.cancelAttention);
router.delete('/proton/v1/project/:id/:csrf', api.delProject);
router.delete('/proton/v1/report/:id/:csrf', api.delReport);
router.delete('/proton/v1/statis/:id/:csrf', api.delStatis);

router.delete('/proton/v1/one/report/:reportid/:csrf', api.delOneReport);

router.get('/proton/v1/test', api.test);

module.exports = router;