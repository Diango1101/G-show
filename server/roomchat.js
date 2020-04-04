const ws = require('nodejs-websocket')
const { addChat } = require('./controller/chat')
const { addLives } = require('./controller/lives')
//当前在线列表
let onlineList = []
//信息类型
const msgType = {
    onlineInfo: 0,   //关于在线列表
    chatInfo: 1,    //关于聊天内容
    liveInfo: 2      //关于直播内容
}

//对象数组去重
function unique(arr) {
    const obj = {}
    const result = arr.reduce((total, cur) => {
        if (!obj[cur.id]) {
            obj[cur.id] = total.push(cur)
        }
        return total
    }, [])
    return result
}
// 对象数组根据房间号过滤
function filterFromroomId(roomid, arr) {
    let result = arr.filter(item => {
        return item.roomId == roomid
    })
    return result
}
// 原来传入结构
// { id: 92,
//     username: 'hmy',
//     avatar: 'http://localhost:8888/myUpload/order_org.png' }
// 需添加roomId ,isLives
const server = ws.createServer(function (connection) {
    connection.user = {}

    connection.on('text', function (str) {
        const info = JSON.parse(str)
        const isAnchor = info.IsAnchor || false
        const isLives = info.isLives || false
        if (!connection.user.id) {
            connection.user = info
            //防止同一个账号在同一个浏览器中的不同窗口重复上线
            const isExist = onlineList.find(item => item.id === connection.user.id)
            onlineList.push(info)
            let newOnlineList = filterFromroomId(connection.user.roomId, onlineList)
            const data = {
                onlineList: unique(newOnlineList),
                text: isExist ? '' : `用户${connection.user.username}已进入直播间`
            }
            broadcast(data, msgType.onlineInfo, connection.user.roomId)
            // 主播进入直播间
            if (isAnchor) {
                let Anchordata = {
                    onlineList: unique(newOnlineList),
                    text: isExist ? '' : `主播${connection.user.username}已进入直播间`
                }
                broadcast(Anchordata, msgType.onlineInfo, connection.user.roomId)
            }
        } else {
            //当用户修改头像或昵称时，修改connection.user,onlineList不用修改，因为userid不会变
            if (info.id) {
                connection.user = info
                return
            }
            const data = {
                userId: connection.user.id,
                username: connection.user.username,
                userAvatar: connection.user.avatar,
                createTime: Date.now(),
                content: info.content,
                roomId: connection.user.roomId || 1    //  新增  分房间号
            }
            if (!isLives) {
                addChat(data)
                broadcast(data, msgType.chatInfo, connection.user.roomId)
            } else {
                addLives(data)
                broadcast(data, msgType.liveInfo, connection.user.roomId)
            }
        }
    })
    // 断开连接
    connection.on('close', function (code, reason) {
        //当同一个账号在同个浏览器的多个窗口打开时，会有多个userId相同的连接，如果用filter就全部下线了，我们应该只删除当前窗口的连接
        // onlineList = onlineList.filter(item => item.id !== connection.user.id)
        const isAnchor = connection.user.IsAnchor || false
        const index = onlineList.findIndex(item => item.id === connection.user.id)
        onlineList.splice(index, 1)   //只删除一个连接
        const isExist = onlineList.find(item => item.id === connection.user.id)
        let newOnlineList = filterFromroomId(connection.user.roomId, onlineList)
        const data = {
            onlineList: unique(newOnlineList),
            text: isExist ? '' : `用户${connection.user.username}已离开直播间`
        }
        if (isAnchor) {
            let Anchordata = {
                onlineList: unique(newOnlineList),
                text: isExist ? '' : `主播${connection.user.username}已离开直播间`
            }
            broadcast(Anchordata, msgType.onlineInfo, connection.user.roomId)
        } else {
            broadcast(data, msgType.onlineInfo, connection.user.roomId)
        }
    })

    // 连接错误
    connection.on('error', function (error) {
        console.log(error)
    })

})


//广播
function broadcast(msg, type = msgType.chatInfo, roomId) {
    let RoomConnections = server.connections.filter(item => {
        return item.user.roomId == roomId
    })

    RoomConnections.forEach(function (connection) {
        connection.sendText(JSON.stringify({
            type,
            msg
        }))
    })
}

server.listen(8082)
