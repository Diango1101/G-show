const { exec } = require('../db/mysql')
const { SuccessModel, ErrorModel } = require('../model/resModel')


const getPort = async () => {
    const sql = `select max(port) as port from ports `
    const res = await exec(sql)
    const port = res[0].port
    return port
}
const insertPort = async (port) => {
    const sql = `insert into ports(port) values (${port})`
    const res = await exec(sql)
    if (res.affectedRows) {
        return new SuccessModel({
            data: { id: res.insertId },
            message: '该房间websocket创建成功'
        })
    } else {
        return new ErrorModel({
            message: '该房间websocket创建失败',
            httpCode: 500
        })
    }
}

module.exports = {
    getPort,
    insertPort
}