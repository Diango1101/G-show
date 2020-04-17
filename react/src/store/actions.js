import React from 'react'
import { json } from '../utils/ajax'
import { notification, Avatar } from 'antd'
import { replaceImg } from '../utils/util'

export const SET_PANE = 'SET_PANE'
export function setPane(panes) {
    return {
        type: SET_PANE,
        panes
    }
}

//异步action
export function ReSetPane(param) {
    return async function (dispatch) {
        dispatch(setPane(param || {}))
    }
}

export const SET_ACTIVEPANE = 'SET_ACTIVEPANE'
export function setActivePane(activepane) {
    return {
        type: SET_ACTIVEPANE,
        activepane
    }
}

//异步action
export function ReSetActivePane(param) {
    return async function (dispatch) {
        dispatch(setActivePane(param || {}))
    }
}

// 虽然用户信息放在localStorage也可以全局使用，但是如果放在localStorage中，用户信息改变时页面不会实时更新
export const SET_USER = 'SET_USER'
export function setUser(user) {
    return {
        type: SET_USER,
        user
    }
}

//异步action，从后台获取用户信息
export function getUser(param) {
    return async function (dispatch) {
        const res = await json.get('/user/getUser', param)
        dispatch(setUser(res.data || {}))
    }
}

export const SET_WEBSOCKET = 'SET_WEBSOCKET'  //设置websocket对象
export function setWebsocket(websocket) {
    return {
        type: SET_WEBSOCKET,
        websocket
    }
}


export function initWebSocket(user) {    //初始化websocket对象
    return async function (dispatch) {
        let roomid = 1
        const websocket = new WebSocket("ws://" + window.location.hostname + ":8081")
        //建立连接时触发
        websocket.onopen = function () {
            const data = {
                id: user.id,
                username: user.username,
                avatar: user.avatar
            }
            //当用户第一次建立websocket链接时，发送用户信息到后台，告诉它是谁建立的链接
            websocket.send(JSON.stringify(data))
        }
        //监听服务端的消息事件
        websocket.onmessage = function (event) {
            const data = JSON.parse(event.data)
            //在线人数变化的消息
            if (data.type === 0) {
                dispatch(setOnlinelist(data.msg.onlineList))
                data.msg.text && notification.info({
                    message: '提示',
                    description: data.msg.text
                })
            }
            //聊天的消息
            if (data.type === 1) {
                dispatch(addChat(data.msg))
                notification.open({
                    message: data.msg.username,
                    description: <div style={{ wordBreak: 'break-all' }} dangerouslySetInnerHTML={{ __html: replaceImg(data.msg.content) }} />,
                    icon: <Avatar src={data.msg.userAvatar} />
                })
            }
            console.log('上线消息', data)
        }
        dispatch(setWebsocket(websocket))
        dispatch(initChatList(roomid))
    }
}

export const SET_ONLINELIST = 'SET_ONLINELIST'   //设置在线列表
export function setOnlinelist(onlineList) {
    return {
        type: SET_ONLINELIST,
        onlineList
    }
}

//异步action，初始化聊天记录列表
export function initChatList(roomid = 1) {
    return async function (dispatch) {
        const res = await json.get(`/chat/list/${roomid}`)
        dispatch(setChatList(res.data || []))
    }
}

export const SET_CHATLIST = 'SET_CHATLIST'
export function setChatList(chatList) {
    return {
        type: SET_CHATLIST,
        chatList
    }
}

export const ADD_CHAT = 'ADD_CHAT'
export function addChat(chat) {
    return {
        type: ADD_CHAT,
        chat
    }
}


// RoomWebSocket
export const SET_ROOMWEBSOCKET = 'SET_ROOMWEBSOCKET'  //设置wRoomebsocket对象
export function setRoomWebsocket(roomwebsocket) {
    return {
        type: SET_ROOMWEBSOCKET,
        roomwebsocket
    }
}


export function initRoomWebSocket(user, room, isOnlive) {    //初始化roomwebsocket对象
    return async function (dispatch) {
        let roomid = 1
        const websocket = new WebSocket("ws://" + window.location.hostname + ":8082")
        //建立连接时触发
        websocket.onopen = function () {
            const data = {
                id: user.id,
                username: user.username,
                avatar: user.avatar,
                isAnchor: user.isAnchor,
                roomId: room.roomid,
                isOnlive: isOnlive
            }
            //当用户第一次建立websocket链接时，发送用户信息到后台，告诉它是谁建立的链接
            websocket.send(JSON.stringify(data))
        }
        //监听服务端的消息事件
        websocket.onmessage = function (event) {
            const data = JSON.parse(event.data)
            //在线人数变化的消息
            if (data.type === 0) {
                dispatch(setRoomOnlinelist(data.msg.onlineList))
                data.msg.text && notification.info({
                    message: '提示',
                    description: data.msg.text
                })
            }
            //聊天的消息
            if (data.type === 1) {
                dispatch(addRoomChat(data.msg))
                // notification.open({
                //     message: data.msg.username,
                //     description: <div style={{ wordBreak: 'break-all' }} dangerouslySetInnerHTML={{ __html: replaceImg(data.msg.content) }} />,
                //     icon: <Avatar src={data.msg.userAvatar} />
                // })
            }
            if (data.type === 2) {
                dispatch(addRoomLive(data.msg))
                notification.open({
                    message: data.msg.username,
                    description: <div style={{ wordBreak: 'break-all' }} dangerouslySetInnerHTML={{ __html: replaceImg(data.msg.content) }} />,
                    icon: <Avatar src={data.msg.userAvatar} />
                })
            }
            console.log('个人直播间上线消息', data)
        }
        dispatch(setRoomWebsocket(websocket))
        dispatch(initRoomChatList(roomid))
        dispatch(initRoomLiveList(roomid))
    }
}

export const SET_ROOMONLINELIST = 'SET_ROOMONLINELIST'   //设置ROOM在线列表
export function setRoomOnlinelist(roomonlineList) {
    return {
        type: SET_ROOMONLINELIST,
        roomonlineList
    }
}

//异步action，初始化个人聊天室聊天记录列表
export function initRoomChatList(roomid) {
    String.prototype.replaceAll = function (reallyDo, replaceWith, ignoreCase) {
        if (!RegExp.prototype.isPrototypeOf(reallyDo)) {
            return this.replace(new RegExp(reallyDo, (ignoreCase ? "gi" : "g")), replaceWith);
        } else {
            return this.replace(reallyDo, replaceWith);
        }
    }
    return async function (dispatch) {
        const res = await json.get(`/chat/list/${roomid}`)
        // for (let item of res.data) {
        //     item.content = item.content.replaceAll('img', 'Zmage', true);
        // }
        console.log('私人直播间历史聊天信息', res.data, roomid)
        dispatch(setRoomChatList(res.data || []))
    }
}
//异步action，初始化个人聊天室直播记录列表
export function initRoomLiveList(roomid) {
    return async function (dispatch) {
        const res = await json.get(`/lives/list/${roomid}`)
        console.log('私人直播间图文直播信息', res.data, roomid)
        dispatch(setRoomLiveList(res.data || []))
    }
}

export const SET_ROOMCHATLIST = 'SET_ROOMCHATLIST'
export function setRoomChatList(roomchatList) {
    return {
        type: SET_ROOMCHATLIST,
        roomchatList
    }
}

export const SET_ROOMLIVELIST = 'SET_ROOMLIVELIST'
export function setRoomLiveList(roomliveList) {
    return {
        type: SET_ROOMLIVELIST,
        roomliveList
    }
}

export const ADD_ROOMCHAT = 'ADD_ROOMCHAT'
export function addRoomChat(roomchat) {
    return {
        type: ADD_ROOMCHAT,
        roomchat
    }
}
export const ADD_ROOMLIVE = 'ADD_ROOMLIVE'
export function addRoomLive(roomlive) {
    return {
        type: ADD_ROOMLIVE,
        roomlive
    }
}



