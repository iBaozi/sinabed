const fs = require("fs");
const http = require("http");
const https = require("https");
const zlib = require('zlib');

/**
 * @typedef {Object} Stats
 * @property {()=>Boolean} isFile
 * @property {()=>Boolean} isDirectory
 * @property {()=>Boolean} isBlockDevice
 * @property {()=>Boolean} isCharacterDevice
 * @property {()=>Boolean} isSymbolicLink
 * @property {()=>Boolean} isFIFO
 * @property {()=>Boolean} isSocket
 * @property {Number} dev
 * @property {Number} ino
 * @property {Number} mode
 * @property {Number} nlink
 * @property {Number} uid
 * @property {Number} gid
 * @property {Number} rdev
 * @property {Number} size
 * @property {Number} blksize
 * @property {Number} blocks
 * @property {Number} atimeMs
 * @property {Number} mtimeMs
 * @property {Number} ctimeMs
 * @property {Number} birthtimeMs
 * @property {Date} atime
 * @property {Date} mtime
 * @property {Date} ctime
 * @property {Date} birthtime
 */

/**
 * 读文件
 * @param {String|Number|Buffer|URL} path 
 * @param {String | { encoding?: string, mode?: string | number, flag?: string }} [options] 
 * @returns {Promise<String|Buffer>}
 */
exports.readFile = function(path, options) {
    return new Promise((resolve, reject) => fs.readFile(path, options, (err, data) => err ? reject(err) : resolve(data)));
};

/**
 * 写文件
 * @param {String|Number|Buffer|URL} path 
 * @param {Any} data 
 * @param {String | { encoding?: string, mode?: string | number, flag?: string }} [options] 
 */
exports.writeFile = function(path, data, options) {
    return new Promise((resolve, reject) => fs.writeFile(path, data, options, (err, data) => err ? reject(err) : resolve(data)));
};

/**
 * 追加写文件
 * @param {String|Number|Buffer|URL} path 
 * @param {Any} data 
 * @param {String | { encoding?: string, mode?: string | number, flag?: string }} [options] 
 */
exports.appendFile = function(path, data, options) {
    return new Promise((resolve, reject) => fs.appendFile(path, data, options, (err, data) => err ? reject(err) : resolve(data)));
};

/**
 * 将buffer数组合并成一个buffer
 * @param {Buffer[]} chunks 
 */
exports.join = function(chunks) {
	var data, size = chunks.reduce((a,b)=>a+b.length,0);
	switch(chunks.length) {  
		case 0: data = new Buffer(0);  
			break;  
		case 1: data = chunks[0];  
			break;  
		default:  
			data = new Buffer(size);  
			for (var i = 0, pos = 0, l = chunks.length; i < l; i++) {  
				var chunk = chunks[i];  
				chunk.copy(data, pos);  
				pos += chunk.length;  
			}  
			break;
	}  
	return data;
};

/**
 * 读取seek之前指定行数的文本
 * @param {string} path 文件路径
 * @param {number} n 读取行数
 * @param {number} seek 距离尾部偏移(读取seek之前的数据)
 * @param {number} [bufSize=255] 一次读多少字节
 */
exports.readLastLine = function(path, n, seek, bufSize) {
	return new Promise((resolve,reject) => {
		bufSize = bufSize || 255;
		let code = '\n'.charCodeAt(0);
		fs.stat(path, function(err, stat) {
			if(err) return reject(err);
			let size = stat.size - seek;
			let bufs = [];
			fs.open(path, 'r', function(err, fd) {
				if(err) return reject(err);
				function read() {
					fs.read(fd, new Buffer(bufSize), 0, size>bufSize?bufSize:size, size>bufSize?size-bufSize:0, function (err, bytesRead, buffer) {
						if(err) return reject(err);
						if(!bytesRead) return resolve(bufs);
						size -= bytesRead;
						if(size>0) {
							for (let i = bytesRead - 1; i >= 0; i--) {
								if(buffer[i]==code) {
									if(n--<=0) {
										buffer = buffer.slice(i+1, bytesRead);
										bufs.unshift(buffer);
										return resolve(bufs);
									}
								}
							}
						}
						buffer = buffer.slice(0, bytesRead);
						bufs.unshift(buffer);
						if(size<=0) return resolve(bufs);
						read();
					});
				}
				read();
			});
		});
	}).then(bufs=>exports.join(bufs));
};

/**
 * 文件信息
 * @param {String|Number|Buffer|URL} path 
 * @returns {Promise<Stats>}
 */
exports.stat = function(path) {
    return new Promise((resolve, reject) => fs.stat(path, (err, data) => err ? reject(err) : resolve(data)));
};

/**
 * 文件是否存在
 * @param {String|Number|Buffer|URL} path 
 * @returns {Promise<Boolean>}
 */
exports.exists = function(path) {
    return new Promise(resolve => fs.exists(path, data => resolve(data)));
};

/**
 * 是否是普通文件
 * @param {String|Number|Buffer|URL} path 
 * @returns {Promise<Boolean>}
 */
exports.isFile = function(path) {
    return new Promise(resolve => fs.stat(path, (err, data) => err ? resolve(false) : resolve(data.isFile())));
};

/**
 * 是否是文件夹
 * @param {String|Number|Buffer|URL} path 
 * @returns {Promise<Boolean>}
 */
exports.isDirectory = function(path) {
    return new Promise(resolve => fs.stat(path, (err, data) => err ? resolve(false) : resolve(data.isDirectory())));
};

/**
 * @param {String} filePath 
 * @return {Promise<Object>}
 */
exports.readJson = function(filePath) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, function(err, data) {
            err ? reject(err) : resolve(new Function("return " + data)());
        });
    });
};

/**
 * @param {String} filePath 
 * @param {Object} data 
 * @param {Number} [space] 
 * @returns {Promise}
 */
exports.writeJson = function(filePath, data, space) {
    return new Promise((resolve, reject) => {
        fs.writeFile(filePath, space ? JSON.stringify(data, null, space) : JSON.stringify(data), function(err) {
            err ? reject(err) : resolve();
        });
    });
};

/**
 * @param {String} filePath 
 * @returns {Promise<String[]>}
 */
exports.readDir = function(filePath) {
    return new Promise((resolve, reject) => {
        fs.readdir(filePath, function(err, dirs) {
            err ? reject(err) : resolve(dirs);
        });
    });
};

/**
 * @param {String} filePath 要删除的文件/目录
 * @param {(filename:String,isDir:Boolean)=>Boolean} filter 是否删除
 * @returns {Promise}
 */
exports.rm = function rm(filePath, filter) {
    if (!filter) filter = x => true;
    return new Promise((resolve, reject) => {
        fs.stat(filePath, function(err, stat) {
            if (err) resolve();
            else if (stat.isFile())
                filter(filePath, false) ? fs.unlink(filePath, err => err ? reject(err) : resolve()) : resolve();
            else if (stat.isDirectory()) {
                fs.readdir(filePath, function(err, filenames) {
                    err ? reject(err) : Promise.all(filenames.map(x => rm(filePath + "/" + x, filter))).then(function() {
                        filter(filePath, true) ? fs.rmdir(filePath, err => err ? reject(err) : resolve()) : resolve();
                    }, reject).catch(reject);
                });
            }
        });
    });
};

/**
 * 移动文件/文件夹
 * @param {String} srcPath 源文件名
 * @param {String} src2dst 目标文件名
 * @returns {Promise}
 */
exports.mv = function mv(srcPath, dstPath) {
    return new Promise((resolve, reject) => fs.exists(srcPath, ok => ok ? fs.rename(srcPath, dstPath, err => err ? reject(err) : resolve()) : resolve()));
};

/**
 * @param {String} url 
 * @param {String} dstPath 
 * @returns {Promise}
 */
exports.download = function(url, dstPath) {
    return new Promise((resolve, reject) => {
        let HTTP = url.startsWith("https://") ? https : http;
        let req = HTTP.request(url, function(res) {
            res.pipe(fs.createWriteStream(dstPath));
            res.on("end", resolve);
        });
        req.on('error', reject);
        req.end();
    });
};

exports.createReadStream = fs.createReadStream;
exports.createWriteStream = fs.createWriteStream;

/**
 * 复制文件/文件夹
 * @param {String} srcPath 源文件名
 * @param {String|(filename:String,isDir:Boolean)=>String} src2dst 目标文件名/function(源文件名)=>目标文件名|空不复制
 * @param {Boolean} overwrite 是否覆盖
 * @returns {Promise}
 */
exports.cp = function cp(srcPath, src2dst, overwrite) {
    if (typeof src2dst != "function") {
        var tmp = src2dst;
        src2dst = x => x.replace(srcPath, tmp);
    }
    return new Promise((resolve, reject) => {
        fs.stat(srcPath, function(err, stat) {
            if (err) err.code == "ENOENT" ? resolve() : reject(err);
            else if (stat.isDirectory()) {
                let dstPath = src2dst(srcPath, true);
                if (!dstPath || srcPath == dstPath) resolve();
                else fs.exists(dstPath, function(ok) {
                    function copydir() {
                        fs.readdir(srcPath, function(err, filenames) {
                            err ? reject(err) : Promise.all(filenames.map(x => cp(srcPath + "/" + x, src2dst, overwrite))).then(resolve, reject).catch(reject);
                        });
                    }
                    ok ? copydir() : fs.mkdir(dstPath, err => err ? reject(err) : copydir());
                });
            } else if (stat.isFile()) {
                let dstPath = src2dst(srcPath, false);
                if (!dstPath || srcPath == dstPath) resolve();
                else {
                    function docopy() {
                        let r = fs.createReadStream(srcPath);
                        r.on("end", resolve);
                        r.on("error", reject);
                        r.pipe(fs.createWriteStream(dstPath));
                    }
                    overwrite ? docopy() : fs.exists(dstPath, ok => ok ? resolve() : docopy());
                }
            }
        });
    });
};

/**
 * 创建文件夹
 * @param {String} dir 
 * @param {Promise}
 */
exports.mkdirs = function mkdirs(dir) {
    var dirs = dir.split(/[\/\\]/);
    let pms = Promise.resolve();
    for (var i = 1; i <= dirs.length; i++) {
		let tmp = dirs.slice(0, i).join("/");
		if(tmp) pms = pms.then(() => new Promise((resolve, reject) => fs.exists(tmp, ok => ok ? resolve() : fs.mkdir(tmp, err => err ? reject(err) : resolve()))));
    }
    return pms;
};

/**
 * 遍历文件夹
 * @param {string} dir 
 * @param {(filename:string,stat:Stats)=>boolean} fn 
 */
exports.walk = function(dir, fn) {
    return new Promise((resolve, reject) => {
        fs.readdir(dir, function(err, filenames) {
            if (err) reject(err);
            else {
                let task = Promise.resolve();
                for (let filename of filenames) {
                    filename = dir + "/" + filename;
                    task = task.then(x => new Promise((resolve, reject) => {
                        fs.stat(filename, function(err, stat) {
                            if (stat.isDirectory()) {
                                resolve(Promise.resolve(fn(filename, stat)).then(x => x || exports.walk(filename, fn)));
                            } else {
                                resolve(fn(filename, stat));
                            }
                        });
                    }));
                }
                resolve(task);
            }
        });
    });
};

/**
 * 返回文件,并且支持 304 及 gz
 * @param {string} filename 文件路径
 * @param {string|number|Date} modtime 上次修改时间,if-modified-since
 * @param {http.ServerResponse} res
 * @param {number} [delay=7200] 单位(秒),gz延时,文件修改时间超过多久再生成gz,小于0时不生成gz
 * @param {number} [maxAge=365] 单位(天),过期时间
 */
exports.sendFileOr304 = function(filename, modtime, res, delay, maxAge) {
    delay = typeof delay === 'number' ? delay : 7200;
    maxAge = typeof maxAge === 'number' ? maxAge : 365;
    maxAge = maxAge * 86400e3;
    if (modtime instanceof Date) modtime = modtime.getTime();
    else try {
        modtime = new Date(modtime || 0).getTime();
    } catch (e) {
        modtime = 0;
    }
    return Promise.all([
        exports.stat(filename).then(x => Math.floor(x.mtime.getTime() / 1000) * 1e3, () => Promise.reject(404)),
        exports.stat(filename + ".gz").then(x => Math.floor(x.mtime.getTime() / 1000) * 1e3, () => 0)
    ]).then((ts) => {
        // 304
        if (modtime >= ts[0]) {
            // 不存在gz || (gz修改时间<json修改时间 && 当前时间-json修改时间>delay
            if (delay > 0 && ts[1] < ts[0] && new Date().getTime() - ts[0] > delay) {
                fs.createReadStream(filename).pipe(zlib.createGzip()).pipe(fs.createWriteStream(filename + ".gz"));
            }
            res.writeHead(304);
            res.end('Not Modified');
            return 304;
        }
        // gz 没有过期
        if (ts[1] >= ts[0]) {
            res.removeHeader('Pragma');
            res.writeHead(200, {
                'last-modified': new Date(ts[0]).toUTCString(),
                'cache-control': 'max-age=' + maxAge,
                'expires': new Date(maxAge + new Date()).toUTCString(),
            });
            res.setHeader('content-encoding', 'gzip');
            fs.createReadStream(filename + ".gz").pipe(res);
            return filename + ".gz";
        }
        if (delay > 0 && ts[1] < ts[0] && new Date().getTime() - ts[0] > delay) {
            fs.createReadStream(filename).pipe(zlib.createGzip()).pipe(fs.createWriteStream(filename + ".gz"));
        }
        res.removeHeader('Pragma');
        res.writeHead(200, {
            'last-modified': new Date(ts[0]).toUTCString(),
            'cache-control': 'max-age=' + maxAge,
            'expires': new Date(maxAge + new Date()).toUTCString(),
        });
        fs.createReadStream(filename).pipe(res);
        return 200;
    }, code => {
        res.writeHead(404);
        res.end('Not Found');
        return 404;
    });
};
