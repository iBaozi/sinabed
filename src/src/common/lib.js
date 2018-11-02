let lib = {
    uMap: {},
    getUser(id) {
        return lib.uMap[id] || {};
    },
    cacheUsers(users) {
        for (let user of users) {
            lib.uMap[user.id] = user;
        }
    },
    apis: [{
			"name": "上传图片到新浪图床",
			"url": "image",
            "method": "POST",
            "params": {
                "f": {
                    "lbl": "图片",
                    "type": "file",
                    "need": true
                },
                "qr": {
                    "lbl": "识别二维码",
                    "type": "int",
                    "opts": [
                        "不识别",
                        "识别",
                        "识别并必须",
                        "识别并裁剪"
                    ]
                },
                "token": {
                    "lbl": "身份信息",
                    "rem": "与上传的图片绑定,之后可以通过token查询上传的图片,不传则不绑定",
                    "len": [0, 37]
                },
                "username": {
                    "lbl": "新浪账号",
                    "rem": "不传则使用系统账号,用于登录新浪图床"
                },
                "passwd": {
                    "lbl": "新浪密码"
                }
            },
            "error": {
                "405": "只能上传图片",
                "406": "未识别到二维码",
                "407": "需要输入验证码"
            },
            "ret": {
                "no": 200,
                "data": {
                    "url": "https://ws1.sinaimg.cn/mw690/bfdf4e9fgy1fwtix4arf4j20u019idig",
                    "rect": { "left": 212, "top": 559, "width": 652, "height": 648 },
                    "data": "HTTPS://QR.ALIPAY.COM/FKX01934Z8IBCXZIUFLPB9"
                }
            }
        },
        {
            "name": "图片列表",
			"url": "list",
            "method": "get",
            "params": {
                "token": {
                    "lbl": "身份信息",
                    "len": [0, 37],
                    "need": true
                },
                "create_min": {
                    "lbl": "多久之后",
                    "type": "int"
                },
                "create_max": {
                    "lbl": "多久之前",
                    "type": "int"
                },
                "offset": {
                    "lbl": "偏移时间",
                    "type": "int",
                    "def": 0
                }
            },
            "ret": {
                "no": 200,
                "data": [
                    { "name": "微信收款.jpg", "create_at": 1541094540327, "data": "", "url": "https://ws1.sinaimg.cn/mw690/bfdf4e9fgy1fwt3d2keypj20jg0qodh7" },
                    { "name": "支付宝收款.jpg", "create_at": 1541126835665, "data": "HTTPS://QR.ALIPAY.COM/FKX01934Z8IBCXZIUFLPB9", "url": "https://ws1.sinaimg.cn/mw690/bfdf4e9fgy1fwtix4arf4j20u019idig" }
                ]
            }
        },
        {
            "name": "获取/输入验证码",
			"url": "code",
            "rem": "不传code参数代表获取验证码,传了code参数代表输入验证码",
            "method": "get",
            "params": {
                "username": {
                    "lbl": "用户名"
                },
                "code": {
                    "lbl": "验证码"
                }
            },
            "ret": {
                "no": 200
            }
        }
    ]
};

export default lib;