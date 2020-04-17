const { exec } = require('../db/mysql')
const { SuccessModel, ErrorModel } = require('../model/resModel')

/**
 * 添加图文直播记录
 * @param {*} param 
 */
const addLives = async (param) => {
    const { userId, roomId, username, userAvatar, createTime, content } = param
    const sql = `insert into lives (userId,roomId,username,userAvatar,createTime,content) values 
        (${userId},'${roomId}','${username}','${userAvatar}',${createTime},'${content}')
    `
    const res = await exec(sql)
    return new SuccessModel({
        data: {
            id: res.insertId
        }
    })
}

/**
 * 获取最新直播记录前100条
 */
const getLiveList = async (roomid) => {
    const sql = `select * from lives where roomId='${roomid}' order by createTime DESC limit 100`
    const res = await exec(sql)
    return new SuccessModel({
        data: res.reverse()
    })
}



module.exports = {
    addLives,
    getLiveList
}