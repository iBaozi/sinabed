function val(v) {
    if (v == null) return 'null';
    if (typeof v === 'string') return `'${v.replace(/'/g, "\\'")}'`;
    if (typeof v === 'number') return v;
    return `'${JSON.stringify(v).replace(/'/g, "\\'")}'`;
}

function use(str) {
    return '`' + (str || '').replace(/,/g, '`,`') + '`';
}

class Field {
    /**
     * @param {string} name 
     * @param {string} type 
     */
    constructor(name, type) {
        this._name = name;
        this._type = type;
        this._null = true;
        this._inc = false;
    }
    table(table) {
        this._table = table;
        return this;
    }
    notNull() {
        this._null = false;
        return this;
    }
    auto_increment() {
        this._inc = true;
        return this;
    }
    /**
     * @param {string} def
     **/
    default (def) {
        this._default = def;
        return this;
    }
    /**
     * @param {string} charset
     **/
    charset(charset) {
        this._charset = charset;
        return this;
    }
    /**
     * @param {string} comment
     **/
    comment(comment) {
        this._comment = comment;
        return this;
    }
    toString() {
        let s = [use(this._name), this._type];
        if (!this._null) s.push('NOT NULL');
        if (this._inc) s.push('AUTO_INCREMENT');
        if (this._charset) s.push('CHARACTER SET ' + this._charset);
        if (this._default != null) s.push(`DEFAULT ${val(this._default)}`);
        if (this._comment) s.push(`COMMENT '${this._comment.replace(/'/g, "\\'")}'`);
        return s.join(' ');
    }
    param() {
        let v = { lbl: '' };
        if (this._comment) v.rem = this._comment;
        if (this._type.indexOf('int') >= 0) v.type = 'int';
        if (this._default != null) v.def = this._default;
        let data = {};
        data[this._name] = v;
        return data;
    }
    typescript() {
        let type = 'string';
        let comment = '';
        if (this._type.indexOf('int') >= 0) type = 'number';
        if (this._comment) comment = ` // ${this._comment}`;
        return `${this._name}: ${type}, ${comment}`;
    }
    /**
     * @param {string} str 
     */
    parse(str) {
        let m = /^(\S+) (\S+( unsigned)?) /.exec(str);
        if (m) {
            this._name = m[1].replace(/`/g, '');
            this._type = m[2].replace(/`/g, '');
            this._type = this._type.replace('int(10) unsigned', 'int unsigned');
            this._type = this._type.replace('int(11)', 'int');
            this._type = this._type.replace('bigint(20)', 'bigint');
        }
        str.replace(/ CHARACTER SET (\S+)/, (x0, x1) => {
            this._charset = x1;
        }).replace(/ DEFAULT (\S+)/, (x0, x1) => {
            if (x1 == 'NULL')
                this._default = null;
            else if (x1.startsWith("'"))
                this._default = x1.slice(1, -1).replace(/(?<!\\)\\'/g, "'");
            else
                this._default = x1;
        }).replace(/ AUTO_INCREMENT/, (x0, x1) => {
            this._inc = true;
        }).replace(/ NOT NULL/, (x0, x1) => {
            this._null = false;
        }).replace(/ COMMENT '([\S\s]*)'/, (x0, x1) => {
            this._comment = x1.replace(/(?<!\\)\\'/, "'");
        });
        return this;
    }
    /**
     * @param {Field} b 
     */
    eq(b) {
        return this._name == b._name;
    }
    /**
     * @param {Field} b 
     */
    equal(b) {
        return this._type == b._type && this._default == b._default && this._charset == b._charset && this._comment == b._comment && this._inc == b._inc && this._null == b._null;
    }
}

class Constraint {
    constructor(type, field, table) {
        this._type = type || '';
        this._field = field ? field.replace(/\s+/g, '') : '';
        this._table = table;
    }
    name(name) {
        if (name != null)
            this._name = name;
        if (!this._name)
            this._name = (this._table ? this._table + '__' : '') + this._field.replace(/,/g, '_');
        return this;
    }
    table(table) {
        this._table = table;
        return this;
    }
    references(table, field) {
        this._ref_table = table;
        this._ref_field = field;
        return this;
    }
    toString() {
        let s;
        this.name();
        if (this._type === 'FOREIGN') {
            s = ['CONSTRAINT', use(this._name), 'FOREIGN KEY', `(${use(this._field)})`, 'REFERENCES', use(this._ref_table), `(${use(this._ref_field)})`];
        } else if (this._type === 'PRIMARY') {
            s = ['PRIMARY KEY', `(${use(this._field)})`];
        } else if (this._type === 'UNIQUE') {
            s = ['UNIQUE KEY', use(this._name), `(${use(this._field)})`];
        } else {
            s = ['KEY', use(this._name), `(${use(this._field)})`];
        }
        return s.join(' ');
    }
    /**
     * @param {string} str 
     */
    parse(str) {
        let m = /^(CONSTRAINT (\S+) )?(\S+ )?KEY([^\(\)]*)\(([^\)]+)\)( REFERENCES (\S+) \((\S+)\))?/.exec(str);
        if (m) {
            this._type = m[3] ? m[3].trim() : '';
            this._field = m[5].replace(/`/g, '').trim();
            if (m[4]) this._name = m[4].replace(/`/g, '').trim();
            if (m[2]) this._name = m[2].replace(/`/g, '').trim();
            if (m[7]) this._ref_table = m[7].replace(/`/g, '').trim();
            if (m[8]) this._ref_field = m[8].replace(/`/g, '').trim();
        }
        return this;
    }
    /**
     * @param {Constraint} b 
     */
    eq(b) {
        if (this._type != b._type) return false;
        if (this._type == 'FOREIGN') return this._field == b._field && this._ref_field == b._ref_field && this._ref_table == b._ref_table;
        return this._field == b._field;
    }
    /**
     * @param {Constraint} b 
     */
    equal(b) {
        return this.eq(b);
    }
}

class Table {
    /**
     * @param {string} name 
     * @param {Array<Field|Constraint>} fields 
     */
    constructor(name, fields) {
        this._name = name;
        this._fields = fields || [];
        for (let field of this._fields) {
            field.table(name);
        }
    }
    /**
     * @param {string} comment
     **/
    comment(comment) {
        this._comment = comment;
        return this;
    }
    /**
     * @param {string} charset
     **/
    engine(engine) {
        this._engine = engine; // 'innodb' 'myisam'
        return this;
    }
    /**
     * @param {string} charset
     **/
    charset(charset) {
        this._charset = charset;
        return this;
    }
    auto_increment(n) {
        this._inc = n;
        return this;
    }
    toString() {
        let tail = [')'];
        if (this._engine) tail.push('ENGINE=' + this._engine);
        if (this._inc) tail.push('AUTO_INCREMENT=' + this._inc);
        if (this._charset) tail.push('DEFAULT CHARACTER SET ' + this._charset);
        if (this._comment) tail.push('COMMENT=' + this._comment);
        let sql = [
            `CREATE TABLE \`${this._name}\` (`,
            this._fields.map(x => '\t' + x).join(',\n'),
            tail.join(' ') + ';',
        ];
        return sql.join('\n');
    }
    params() {
        let params = {};
        for (let item of this._fields) {
            if (item.param) Object.assign(params, item.param());
        }
        return params;
    }
    typescript() {
        let ss = [`interface ${this._name.slice(0,1).toUpperCase()+this._name.slice(1)} {`];
        for (let item of this._fields) {
            if (item.typescript) ss.push('\t' + item.typescript());
        }
        ss.push('}');
        return ss.join('\n');
    }
    /**
     * 从 show create table 字符串恢复成Table对象
     * @param {string} str 
     */
    parse(str) {
        str = str.trim();
        let m = /CREATE TABLE (\S+) \(([\s\S]+)\)([^\)]+)/.exec(str);
        if (!m) return;
        this._name = m[1].replace(/`/g, '');
        let tail = m[3].trim();
        tail.replace(/ENGINE=(\w+)/, (x0, x1) => {
            this._engine = x1;
        }).replace(/AUTO_INCREMENT=(\d+)/, (x0, x1) => {
            this._inc = x1;
        }).replace(/DEFAULT CHARSET=(\w+)/, (x0, x1) => {
            this._charset = x1;
        }).replace(/DEFAULT CHARACTER SET (\S+( COLLATE \S+)?)/, (x0, x1) => {
            this._charset = x1;
        }).replace(/COMMENT='([\s\S]*)'/, (x0, x1) => {
            this._comment = x1.replace(/(?<!\\)\\'/g, "'");
        });
        let lines = m[2].split('\n').map(x => x.trim()).filter(x => x);
        this._fields = lines.map(line => {
            if (line.startsWith('`'))
                return new Field().table(this._name).parse(line);
            return new Constraint().table(this._name).parse(line);
        });
        return this;
    }
    /**
     * 升级数据库
     * @param {MysqlEngine} db 
     * @param {boolean} run 是否执行
     */
    merge(db, run) {
        return db.execSQL(`show create table ${use(this._name)}`, true).then(rows => {
            let table = new Table().parse(rows[0]['Create Table']);
            let sqls = [];
            for (let f1 of this._fields) {
                let f0;
                for (let i = table._fields.length - 1; i >= 0; i--) {
                    let f = table._fields[i];
                    if (f.constructor == f1.constructor && f1.eq(f)) {
                        f0 = f;
                        table._fields.splice(i, 1);
                        break;
                    }
                }
                if (f0) { // 有同一个字段
                    if (!f1.equal(f0)) // 如果字段发生改变
                        sqls.push(`alter table ${use(this._name)} modify column ${f1.toString()};`);
                } else { // 多了个字段
                    if (f1 instanceof Field)
                        sqls.push(`alter table ${use(this._name)} add column ${f1.toString()};`);
                    else
                        sqls.push(`alter table ${use(this._name)} add ${f1.toString()};`);
                }
            }
            for (let f of table._fields) {
                if (f instanceof Field)
                    sqls.unshift(`alter table ${use(this._name)} drop column ${use(f._name)}`);
                else if (f._type == 'PRIMARY')
                    sqls.unshift(`alter table ${use(this._name)} drop PRIMARY KEY`);
                else if (f._type == 'FOREIGN')
                    sqls.unshift(`alter table ${use(this._name)} drop FOREIGN KEY ${use(f._name)}`);
                else {
                    let ok = true;
                    for (let f1 of this._fields) {
                        if (f1 instanceof Constraint && f1._field == f._field && f1._type == 'FOREIGN') {
                            ok = false;
                            break;
                        }
                    }
                    if (ok)
                        sqls.unshift(`alter table ${use(this._name)} drop INDEX ${use(f._name)}`);
                }
            }
            if (run) return db.execSQL(sqls);
            return sqls;
        }, err => {
            if (err.errno == 1146) { // table 不存在
                if (run) return db.execSQL(this.toString());
                return [this.toString()];
            }
            return Promise.reject(err);
        });
    }
}

class Define {
    constructor() {
        /** @type {{[key: string]: Table}} */
        this.tables;
        this.tables = {};
    }
    /**
     * @param {string} name 
     * @param {Array<Field|Constraint>} fields 
     */
    table(name, fields) {
        return this.tables[name] = new Table(name, fields);
    }
    toString() {
        let tables = [];
        for (let k in this.tables) {
            let v = this.tables[k];
            tables.push(v.toString());
        }
        return tables.join('\n\n');
    }
    /**
     * 升级数据库
     * @param {MysqlEngine} db 
     * @param {boolean} run 是否执行
     */
    merge(db, run) {
        let tables = [];
        for (let k in this.tables) {
            let v = this.tables[k];
            tables.push(v.merge(db).then(sqls => ({ name: k, sqls })));
        }
        if (run) return Promise.all(tables).then(tables => {
            let sqls = [];
            for (let item of tables) {
                console.log('合并表格:', item.name);
                if (item.sqls.length) {
                    sqls = sqls.concat(item.sqls);
                }
            }
            return db.execSQL(sqls);
        });
        return Promise.all(tables);
    }
    // 字段
    field(name, type) {
        return new Field(name, type.toLowerCase());
    }
    varchar(name, len) {
        return this.field(name, `varchar(${len})`);
    }
    text(name) {
        return this.field(name, `text`);
    }
    json(name) {
        return this.field(name, `json`);
    }
    int(name) {
        return this.field(name, `int`);
    }
    bigint(name) {
        return this.field(name, `bigint`);
    }
    unsigned(name) {
        return this.field(name, `int unsigned`);
    }
    // 约束
    constraint(type, field) {
        return new Constraint(type.toUpperCase(), field);
    }
    primary(field) {
        return this.constraint('primary', field);
    }
    index(field) {
        return this.constraint('', field);
    }
    unique(field) {
        return this.constraint('unique', field);
    }
    foreign(field) {
        return this.constraint('foreign', field);
    }
}

module.exports = Define;