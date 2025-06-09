const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

class Database {
    constructor(userDataPath) {
        // 接收用户数据路径
        this.dbPath = path.join(userDataPath, 'app-database.db');
        this.db = null;
    }

    // 初始化数据库连接并执行初始化脚本
    async initialize(initSqlPath) {
        return new Promise((resolve, reject) => {
            // 先检查并处理数据库文件
            fs.access(this.dbPath, fs.constants.F_OK, (err) => {
                if (!err) {
                    this.db = new sqlite3.Database(this.dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
                        if (err) {
                            console.error('数据库连接失败:', err);
                            return reject(err);
                        }
                        console.log('成功创建/连接到 SQLite 数据库:', this.dbPath);
                    });
                    resolve();
                } else {
                    // 文件不存在，直接创建新数据库
                    this._createNewDatabase(initSqlPath, resolve, reject);
                }
            });
        });
    }

    // 创建新数据库并执行初始化脚本
    _createNewDatabase(initSqlPath, resolve, reject) {
        // 创建新数据库连接（会自动创建新文件）
        this.db = new sqlite3.Database(this.dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
            if (err) {
                console.error('数据库连接失败:', err);
                return reject(err);
            }

            console.log('成功创建/连接到 SQLite 数据库:', this.dbPath);

            // 执行初始化脚本
            this._executeSqlFile(initSqlPath)
                .then(() => resolve())
                .catch(err => reject(err));
        });
    }

    // 执行SQL文件
    async _executeSqlFile(filePath) {
        return new Promise((resolve, reject) => {
            fs.readFile(filePath, 'utf8', (err, sql) => {
                if (err) {
                    console.error('读取SQL文件失败:', err);
                    return reject(err);
                }

                const statements = sql.split(/;\s*\n/).filter(statement => statement.trim());
                const executeNext = (index) => {
                    if (index >= statements.length) {
                        console.log('数据库初始化完成');
                        return resolve();
                    }

                    const statement = statements[index].trim();
                    if (!statement) {
                        return executeNext(index + 1);
                    }

                    this.db.run(statement, (err) => {
                        if (err) {
                            console.error(`执行SQL语句失败 (${index + 1}/${statements.length}):`, err);
                            console.error('失败语句:', statement);
                            return reject(err);
                        }

                        if (process.env.NODE_ENV === 'development') {
                            console.log(`成功执行SQL语句 (${index + 1}/${statements.length}):`, statement);
                        }

                        executeNext(index + 1);
                    });
                };

                executeNext(0);
            });
        });
    }

    // 适配 server.js 中的 execute 方法
    async execute(sql, params = []) {
        if (!this.db) {
            throw new Error("数据库未连接");
        }


        return new Promise((resolve, reject) => {
            const sqlType = sql.trim().split(/\s+/)[0].toUpperCase();

            if (['SELECT', 'SHOW', 'DESCRIBE', 'EXPLAIN'].includes(sqlType)) {
                this.db.all(sql, params, (err, rows) => {
                    if (err) {
                        console.error('查询失败:', err);
                        return reject(err);
                    }
                    resolve([rows, []]);
                });
            } else {
                this.db.run(sql, params, function (err) {
                    if (err) {
                        console.error('执行失败:', err);
                        return reject(err);
                    }
                    resolve([{
                        affectedRows: this.changes,
                        insertId: this.lastID,
                        changedRows: this.changes
                    }]);
                });
            }
        });
    }

    async getConnection() {
        return {
            execute: this.execute.bind(this),
            beginTransaction: () => {
                return new Promise((resolve, reject) => {
                    this.db.run('BEGIN TRANSACTION', (err) => {
                        if (err) return reject(err);
                        resolve();
                    });
                });
            },
            commit: () => {
                return new Promise((resolve, reject) => {
                    this.db.run('COMMIT', (err) => {
                        if (err) return reject(err);
                        resolve();
                    });
                });
            },
            rollback: () => {
                return new Promise((resolve, reject) => {
                    this.db.run('ROLLBACK', (err) => {
                        if (err) return reject(err);
                        resolve();
                    });
                });
            },
            release: () => Promise.resolve()
        };
    }

    async end() {
        return new Promise((resolve) => {
            if (this.db) {
                this.db.close((err) => {
                    if (err) {
                        console.error('关闭数据库连接失败:', err);
                    } else {
                        console.log('数据库连接已关闭');
                    }
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }
}

// 导出初始化方法和数据库实例
module.exports = {
    createDatabaseInstance: (userDataPath) => new Database(userDataPath),
};