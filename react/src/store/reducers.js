import { combineReducers } from 'redux'
import { SET_ACTIVEPANE, SET_PANE, SET_USER, SET_WEBSOCKET, SET_ONLINELIST, SET_CHATLIST, ADD_CHAT, SET_ROOMWEBSOCKET, SET_ROOMONLINELIST, SET_ROOMCHATLIST, ADD_ROOMCHAT, ADD_ROOMLIVE, SET_ROOMLIVELIST } from './actions'



/**
 * 标签活动页
 * @param {*} state 
 * @param {*} action 
 */
function activepane(state = {}, action) {
    switch (action.type) {
        case SET_ACTIVEPANE: {
            return action.activepane
        }
        default:
            return state
    }
}


/**
 * 标签栏信息
 * @param {*} state 
 * @param {*} action 
 */
function panes(state = [], action) {
    switch (action.type) {
        case SET_PANE: {
            return action.panes
        }
        default:
            return state
    }
}

/**
 * 用户信息
 * @param {*} state 
 * @param {*} action 
 */
function user(state = {}, action) {
    switch (action.type) {
        case SET_USER: {
            return action.user
        }
        default:
            return state
    }
}

/**
 * websocket对象
 * @param {*} state 
 * @param {*} action 
 */
function websocket(state = null, action) {
    switch (action.type) {
        case SET_WEBSOCKET: {
            return action.websocket
        }
        default:
            return state
    }
}

/**
 * 在线列表
 * @param {*} state 
 * @param {*} action 
 */
function onlineList(state = [], action) {
    switch (action.type) {
        case SET_ONLINELIST: {
            return action.onlineList
        }
        default:
            return state
    }
}

/**
 * 聊天记录
 * @param {*} state 
 * @param {*} action 
 */
function chatList(state = [], action) {
    switch (action.type) {
        case SET_CHATLIST: {
            return action.chatList
        }
        case ADD_CHAT: {
            return [...state, action.chat]
        }
        default:
            return state
    }
}

/**
 * roomwebsocket对象
 * @param {*} state 
 * @param {*} action 
 */
function roomwebsocket(state = null, action) {
    switch (action.type) {
        case SET_ROOMWEBSOCKET: {
            return action.roomwebsocket
        }
        default:
            return state
    }
}

/**
 * room在线列表
 * @param {*} state 
 * @param {*} action 
 */
function roomonlineList(state = [], action) {
    switch (action.type) {
        case SET_ROOMONLINELIST: {
            return action.roomonlineList
        }
        default:
            return state
    }
}

/**
 * room聊天记录
 * @param {*} state 
 * @param {*} action 
 */
function roomchatList(state = [], action) {
    switch (action.type) {
        case SET_ROOMCHATLIST: {
            return action.roomchatList
        }
        case ADD_ROOMCHAT: {
            return [...state, action.roomchat]
        }
        default:
            return state
    }
}

/**
 * room直播记录
 * @param {*} state 
 * @param {*} action 
 */
function roomliveList(state = [], action) {
    switch (action.type) {
        case SET_ROOMLIVELIST: {
            return action.roomliveList
        }
        case ADD_ROOMLIVE: {
            return [...state, action.roomlive]
        }
        default:
            return state
    }
}


const rootReducer = combineReducers({
    user,
    websocket,
    onlineList,
    chatList,
    panes,
    activepane,
    roomwebsocket,
    roomonlineList,
    roomchatList,
    roomliveList
})

export default rootReducer 