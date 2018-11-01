let Mock;
try { Mock = require("mockjs"); } catch (error) {}

if (Mock) {
    const constellations = ['白羊座', '金牛座', '双子座', '巨蟹座', '狮子座', '处女座', '天秤座', '天蝎座', '射手座', '摩羯座', '水瓶座', '双鱼座'];

    Mock.Random.extend({
        constellation: function() {
            return this.pick(constellations);
        }
    });

    Mock.Random.extend({
        regex: function() {
            const data = [].join.call(arguments, ",");
            if (data == null) return "";
            return Mock.mock(new RegExp(data));
        }
    });
} else {
    Mock = { mock: x => x };
}

module.exports = Mock;