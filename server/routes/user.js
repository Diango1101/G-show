const router = require('koa-router')()
const { register, checkName, getIpInfo, login, getUsers, getUser, updateUser, deleteUsers, getAllUsers, beAnchor, gettobeAnchor, AuthAnchor, notAuth } = require('../controller/user')
const { RegisterValidator, NotEmptyValidator } = require('./validators/validator')
const jwt = require('jsonwebtoken');
const { TOKEN_SECRETKEY } = require('../config/secret')
const { getPort, insertPort } = require('../controller/port')
router.prefix('/user')

/**
 * 判断是否是管理员
 * @param {*} loginName 
 */
async function isAdmin(loginName) {
    const { getUser } = require('../controller/user')
    const userRes = await getUser({ username: loginName })
    if (userRes.status === 0) {
        return userRes.data.isAdmin
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

router.post('/register', async function (ctx, next) {
    const v = await new RegisterValidator().validate(ctx)
    const username = v.get('body.username')
    const password = v.get('body.password')
    const res = await register(username, password, ctx)
    handleRes(ctx, next, res)
})

router.post('/login', async function (ctx, next) {
    const v = await new RegisterValidator().validate(ctx)
    const username = v.get('body.username')
    const password = v.get('body.password')
    const res = await login(username, password, ctx)
    handleRes(ctx, next, res)
})

router.get('/checkName', async function (ctx, next) {
    const { username } = ctx.query
    const res = await checkName(username)
    handleRes(ctx, next, res)
})

router.get('/getIpInfo', async function (ctx, next) {
    const res = await getIpInfo(ctx)
    handleRes(ctx, next, res)
})

router.get('/getUsers', async function (ctx, next) {
    const res = await getUsers(ctx.query)
    handleRes(ctx, next, res)
})

router.get('/getUser', async function (ctx, next) {
    const res = await getUser(ctx.query)
    handleRes(ctx, next, res)
})

router.post('/update', async function (ctx, next) {
    const sessionId = ctx.cookies.get('sessionId')
    const res = await updateUser(ctx.request.body, sessionId)
    handleRes(ctx, next, res)
})

router.post('/delete', async function (ctx, next) {
    const res = await deleteUsers(ctx.request.body)
    handleRes(ctx, next, res)
})

router.get('/getAllUsers', async function (ctx, next) {
    const res = await getAllUsers()
    handleRes(ctx, next, res)
})

router.post('/tobeAnchor', async function (ctx, next) {
    const userid = ctx.request.body.userid
    const room = ctx.request.body.room
    const res = await beAnchor(userid, room)
    handleRes(ctx, next, res)
})

router.get('/:userid/getToBeAnchor', async function (ctx, next) {
    const v = await new NotEmptyValidator().validate(ctx, {
        title: 'userid'
    })
    const userid = v.get('path.userid')
    const res = await gettobeAnchor(userid)
    handleRes(ctx, next, res)
})

router.post('/AuthAnchor', async function (ctx, next) {

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
    const userid = ctx.request.body.userid
    const room = ctx.request.body.room
    const res = await AuthAnchor(userid, room)
    handleRes(ctx, next, res)

})

router.post('/NotAuthAnchor', async function (ctx, next) {

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
    const userid = ctx.request.body.userid
    const res = await notAuth(userid)
    handleRes(ctx, next, res)

})
// router.get('/getport', async function (ctx, next) {
//     const port = await getPort()
//     console.log(port)
//     const res = {
//         status: 0,
//         port: port
//     }
//     handleRes(ctx, next, res)
// })

// router.post('/insertPort', async (ctx, next) => {
//     const port = ctx.request.body.port
//     const res = await insertPort(port)
//     handleRes(ctx, next, res)
// })

module.exports = router
