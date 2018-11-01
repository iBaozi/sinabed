/**
 * Created Date: 2017-09-26 13:39:50
 * Author: inu1255
 * E-Mail: 929909260@qq.com
 */
// router.js 业务代码
const express = require('express');
const router = express.Router();
const api = require("./api");

// 此处加载的中间件也可以自动更新
router.use(api);

router.version = function() {
    return "0.0.1";
};

module.exports = router;