
const { exec } = require('../db/mysql')
const jwt = require('jsonwebtoken');
const { TOKEN_SECRETKEY } = require('../config/secret')
const { SuccessModel, ErrorModel } = require('../model/resModel')
const { getUser } = require('./user')


/**
 * 判断是否是管理员
 * @param {*} loginName 
 */
async function isAdmin(loginName) {
    const userRes = await getUser({ username: loginName })
    if (userRes.status === 0) {
        return userRes.data.isAdmin
    }
    return false
}


/**
 * 验证是否已开设直播间
 */
const verifyOnly = async (author) => {
    const sql = `select * from liverooms where author='${author}'`
    const res = await exec(sql)
    if (res.length == 0) {
        return true
    } else {
        return false
    }
}
/**
 * 创建房间
 * @param {*} param 
 * @param {*} loginName 
 */
const createRooms = async (liveromms, loginName) => {
    // const { getPort, insertPort } = require('./port')
    // const { createRoomServer } = require('../roomchat')


    const { title, description, roomavatar } = liveromms
    const isOnly = await verifyOnly(loginName)
    if (isOnly) {
        const sql = `insert into liverooms (author,createTime,title,description, roomavatar) values
     ('${loginName}',${Date.now()},'${title}','${description}','${roomavatar}')`
        const res = await exec(sql)
        if (res.affectedRows) {
            // 本来写法  每开一新直播间 新开一端口  不合适  已修改
            // let lastport = await getPort()
            // let newport = lastport + 1
            // console.log(newport)
            // createRoomServer(newport)
            // await insertPort(newport)
            return new SuccessModel({
                data: { id: res.insertId },
                message: '创建成功'
            })
        } else {
            return new ErrorModel({
                message: '创建失败',
                httpCode: 500
            })
        }
    } else {
        return new ErrorModel({
            message: '已有直播间，不可重复创建',
            httpCode: 500
        })
    }

}
/**
 * 获取直播间列表
 */
const getLiveRooms = async () => {
    const sql = `select * from liverooms where status>0 order by status DESC`
    const res = await exec(sql)
    return new SuccessModel({
        data: res
    })
}
/**
 * 获取被封停直播间列表
 */
const getStopRooms = async () => {
    const sql = `select * from liverooms where status=0 order by id DESC`
    const res = await exec(sql)
    return new SuccessModel({
        data: res
    })
}
/**
 * 获取未被推荐直播间列表
 */
const getUnTJRooms = async () => {
    const sql = `select * from liverooms where status=1 order by id DESC`
    const res = await exec(sql)
    return new SuccessModel({
        data: res
    })
}
/**
 * 获取已推荐直播间列表
 */
const getTJLiveRooms = async () => {
    const sql = `select * from liverooms where status=2 order by id DESC`
    const res = await exec(sql)
    return new SuccessModel({
        data: res
    })
}

/**
 * 获取个人直播间信息
 */
const getLiveRoom = async (username) => {
    const sql = `select * from liverooms where author='${username}'`
    const res = await exec(sql)
    return new SuccessModel({
        data: res[0]
    })

}

/**
 * 删除直播间（可单个或多个）
 */
const deleteRooms = async (param) => {
    const ids = param.ids
    if (!Array.isArray(ids)) {
        return new ErrorModel({
            message: '参数异常',
            httpCode: 400
        })
    }
    const sql = `delete from liverooms where id in (${ids.join(',')})`
    const res = await exec(sql)
    return new SuccessModel({
        message: `成功删除${res.affectedRows}个直播间`
    })
}

/**
 * 封停直播间（可单个或多个）
 */
const StopRooms = async (param) => {
    const ids = param.ids
    if (!Array.isArray(ids)) {
        return new ErrorModel({
            message: '参数异常',
            httpCode: 400
        })
    }
    const sql = `update liverooms set status= 0 where id in (${ids.join(',')})`
    const res = await exec(sql)
    return new SuccessModel({
        message: `成功封停${res.affectedRows}个直播间`
    })
}

/**
 * 推荐直播间（可单个或多个）
 */
const TuijianRooms = async (param) => {
    const ids = param.ids
    if (!Array.isArray(ids)) {
        return new ErrorModel({
            message: '参数异常',
            httpCode: 400
        })
    }
    const sql = `update liverooms set status= 2 where id in (${ids.join(',')})`
    const res = await exec(sql)
    return new SuccessModel({
        message: `成功将${res.affectedRows}个直播间设为推荐`
    })
}
/**
 * 解除推荐直播间（可单个或多个）
 */
const UnTuijianRooms = async (param) => {
    const ids = param.ids
    if (!Array.isArray(ids)) {
        return new ErrorModel({
            message: '参数异常',
            httpCode: 400
        })
    }
    const sql = `update liverooms set status= 1 where id in (${ids.join(',')})`
    const res = await exec(sql)
    return new SuccessModel({
        message: `成功将${res.affectedRows}个直播间解除推荐`
    })
}

/**
 * 解封直播间（可单个或多个）
 */
const JieFengRooms = async (param) => {
    const ids = param.ids
    if (!Array.isArray(ids)) {
        return new ErrorModel({
            message: '参数异常',
            httpCode: 400
        })
    }
    const sql = `update liverooms set status= 1 where id in (${ids.join(',')})`
    const res = await exec(sql)
    return new SuccessModel({
        message: `成功将${res.affectedRows}个直播间解封`
    })
}

/**
 * 修改个人直播间设置
 */
const UpdateRoom = async (room) => {
    const { title, description, roomavatar = 'http://localhost:8888/public/images/liveroom.png', author } = room
    const sql = `update liverooms set title='${title}',description='${description}',roomavatar='${roomavatar}' where author='${author}'`
    console.log(sql)
    const res = await exec(sql)
    if (res.affectedRows) {
        return new SuccessModel({
            data: res,
            message: '设置成功'
        })
    } else {
        return new ErrorModel({
            message: '设置失败',
            httpCode: 500
        })
    }
}


module.exports = {
    createRooms,
    getLiveRooms,
    getStopRooms,
    getUnTJRooms,
    getTJLiveRooms,
    getLiveRoom,
    deleteRooms,
    StopRooms,
    TuijianRooms,
    UnTuijianRooms,
    UpdateRoom,
    JieFengRooms
}
