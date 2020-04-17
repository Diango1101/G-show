const { exec } = require('../db/mysql')
const { SuccessModel, ErrorModel } = require('../model/resModel')

/**
 * 添加聊天记录
 * @param {*} param 
 */
const addChat = async (param) => {
    const { userId, username, userAvatar, createTime, content, roomId } = param
    const sql = `insert into chats (userId,username,userAvatar,createTime,content,roomId) values 
        (${userId},'${username}','${userAvatar}',${createTime},'${content}','${roomId}')
    `
    const res = await exec(sql)
    return new SuccessModel({
        data: {
            id: res.insertId
        }
    })
}

/**
 * 获取最新聊天记录前100条
 */
const getChatList = async (roomid) => {
    let roomId = 1
    if (roomid) {
        roomId = roomid
    }
    const sql = `select * from chats where roomid='${roomId}' order by createTime DESC limit 100`
    console.log(sql, roomid)
    const res = await exec(sql)
    return new SuccessModel({
        data: res.reverse()
    })
}

module.exports = {
    addChat,
    getChatList
}