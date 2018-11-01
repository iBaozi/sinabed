const bs = ["b", "Kb", "Mb", "Gb"];
const ts = [
    [86400e3 * 365, "年"],
    [86400e3 * 30, "月"],
    [86400e3, "天"],
    [3600e3, "小时"],
    [60e3, "分钟"],
    [1e3, "秒"],
];

let filter = {
    fromNow(v, digits, def) {
        digits = digits || 0;
        if (!v) return def || '未设置';
        if (typeof v === "number" && v < 1e12) {
            v *= 1e3;
        }
        v = new Date(v) - new Date();
        let s = filter.diff(Math.abs(v), digits, v > 0 ? '后' : '前');
        if (s) return s;
        return '现在';
    },
    diff(v, digits, suffix) {
        suffix = suffix || '';
        let s = '';
        for (let unit of ts) {
            let diff = v / unit[0];
            let tmp = Math.floor(diff);
            if (tmp) {
                if (digits) {
                    let n = Math.pow(10, digits);
                    s = Math.floor(v / unit[0] * n) / n;
                } else {
                    s = tmp;
                }
                s += unit[1];
                break;
            }
        }
        if (s) return s + suffix;
    },
    /**
     * @param {number} t 
     * @param {string} format 
     */
    format(t, format) {
        if (typeof t === "number" && t < 1e12) {
            t *= 1e3;
        }
        t = new Date(t);
        let Y = (t.getFullYear() + 1e4).toString().slice(1);
        return format.replace(/YYYY/g, Y)
            .replace(/YY/g, Y.slice(2))
            .replace(/MM/g, (t.getMonth() + 101).toString().slice(1))
            .replace(/DD/g, (t.getDate() + 100).toString().slice(1))
            .replace(/hh/g, (t.getHours() + 100).toString().slice(1))
            .replace(/mm/g, (t.getMinutes() + 100).toString().slice(1))
            .replace(/ss/g, (t.getSeconds() + 100).toString().slice(1));
    },
    date(value) {
        return filter.format(value, 'YYYY-MM-DD');
    },
    time(value) {
        return filter.format(value, 'HH:mm:ss');
    },
    traffic(v, i, n) {
        v = parseInt(v);
        n = n || 0;
        for (i = i || 0; i < 4; i++) {
            if (v < 1024) {
                return v + bs[i];
            }
            v = (v / 1024).toFixed(n);
        }
        return v + "GB";
    }
};

export default filter;