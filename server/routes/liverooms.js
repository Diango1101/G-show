const router = require('koa-router')()
const { createRooms, getLiveRooms, deleteRooms, getLiveRoom, StopRooms, TuijianRooms, UpdateRoom, JieFengRooms, getStopRooms, getUnTJRooms, getTJLiveRooms, UnTuijianRooms } = require('../controller/liverooms')
const { PositiveIntegerValidator, NotEmptyValidator } = require('./validators/validator')
const { getUser } = require('../controller/user')

router.prefix('/liverooms')



const jwt = require('jsonwebtoken');
const { TOKEN_SECRETKEY } = require('../config/secret')

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
 * 判断是否是主播
 * @param {*} loginName 
 */
async function isAnchor(loginName) {
    const userRes = await getUser({ username: loginName })
    if (userRes.status === 0) {
        return userRes.data.isAnchor
    }
    return false
}



function handleRes(ctx, next, res) {
    if (res.status === 0) {
        ctx.body = res
    } else {
        ctx.status = res.httpCode
        ctx.body = res
        // ctx.message = res.message   //本来想直接设置fetch的statusText，但是加了这句话请求就出错
    }
}

router.post('/create', async function (ctx, next) {

    const sessionId = ctx.cookies.get('sessionId')
    console.log(sessionId)
    const loginName = jwt.verify(sessionId, TOKEN_SECRETKEY).username
    const isAdminRes = await isAdmin(loginName)
    const isAnchorRes = await isAnchor(loginName)
    console.log(isAdminRes, isAnchorRes)
    if (!isAdminRes && !isAnchorRes) {
        let ErrorModel = {
            message: "权限不足",
            status: 1,
            httpCode: 500
        }
        handleRes(ctx, next, ErrorModel)

    }
    const res = await createRooms(ctx.request.body, loginName)
    handleRes(ctx, next, res)
})

router.get('/list', async function (ctx, next) {
    const res = await getLiveRooms()
    handleRes(ctx, next, res)
})

router.get('/Stopedlist', async function (ctx, next) {
    const res = await getStopRooms()
    handleRes(ctx, next, res)
})

router.get('/UnTJlist', async function (ctx, next) {
    const res = await getUnTJRooms()
    handleRes(ctx, next, res)
})

router.get('/TJlist', async function (ctx, next) {
    const res = await getTJLiveRooms()
    handleRes(ctx, next, res)
})

router.get('/:username/OnesLiveRoom', async function (ctx, next) {
    const v = await new NotEmptyValidator().validate(ctx, {
        title: 'username'
    })
    const username = v.get('path.username')
    const res = await getLiveRoom(username)
    handleRes(ctx, next, res)
})

router.post('/delete', async function (ctx, next) {
    const sessionId = ctx.cookies.get('sessionId')
    const loginName = jwt.verify(sessionId, TOKEN_SECRETKEY).username
    const isAdminRes = await isAdmin(loginName)
    if (!isAdminRes) {
        let ErrorModel = {
            message: "权限不足",
            status: 1,
            httpCode: 500
        }
        handleRes(ctx, next, ErrorModel)
    }
    const res = await deleteRooms(ctx.request.body, loginName)
    handleRes(ctx, next, res)
})

router.post('/stop', async function (ctx, next) {
    const sessionId = ctx.cookies.get('sessionId')
    const loginName = jwt.verify(sessionId, TOKEN_SECRETKEY).username
    const isAdminRes = await isAdmin(loginName)
    if (!isAdminRes) {
        let ErrorModel = {
            message: "权限不足",
            status: 1,
            httpCode: 500
        }
        handleRes(ctx, next, ErrorModel)
    }
    const res = await StopRooms(ctx.request.body, loginName)
    handleRes(ctx, next, res)
})

router.post('/jiefeng', async function (ctx, next) {
    const sessionId = ctx.cookies.get('sessionId')
    const loginName = jwt.verify(sessionId, TOKEN_SECRETKEY).username
    const isAdminRes = await isAdmin(loginName)
    if (!isAdminRes) {
        let ErrorModel = {
            message: "权限不足",
            status: 1,
            httpCode: 500
        }
        handleRes(ctx, next, ErrorModel)
    }
    const res = await JieFengRooms(ctx.request.body, loginName)
    handleRes(ctx, next, res)
})

router.post('/tuijian', async function (ctx, next) {
    const sessionId = ctx.cookies.get('sessionId')
    const loginName = jwt.verify(sessionId, TOKEN_SECRETKEY).username
    const isAdminRes = await isAdmin(loginName)
    if (!isAdminRes) {
        let ErrorModel = {
            message: "权限不足",
            status: 1,
            httpCode: 500
        }
        handleRes(ctx, next, ErrorModel)
    }
    const res = await TuijianRooms(ctx.request.body, loginName)
    handleRes(ctx, next, res)
})

router.post('/Untuijian', async function (ctx, next) {
    const sessionId = ctx.cookies.get('sessionId')
    const loginName = jwt.verify(sessionId, TOKEN_SECRETKEY).username
    const isAdminRes = await isAdmin(loginName)
    if (!isAdminRes) {
        let ErrorModel = {
            message: "权限不足",
            status: 1,
            httpCode: 500
        }
        handleRes(ctx, next, ErrorModel)
    }
    const res = await UnTuijianRooms(ctx.request.body, loginName)
    handleRes(ctx, next, res)
})

router.post('/updateRoom', async function (ctx, next) {

    const res = await UpdateRoom(ctx.request.body.room)
    handleRes(ctx, next, res)
})







module.exports = router
