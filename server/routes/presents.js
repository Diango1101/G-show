const router = require('koa-router')()
const { addPresent, getAllPresents, deletePresent, getPresents, getAllPresentsRecords, getPresentTypes, updatePresents, getRecordPresentTypes } = require('../controller/presents')
const { PositiveIntegerValidator, NotEmptyValidator } = require('./validators/validator')
const { getUser } = require('../controller/user')

const jwt = require('jsonwebtoken');
const { TOKEN_SECRETKEY } = require('../config/secret')

router.prefix('/presents')


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
    }
}

router.post('/addPresent', async (ctx, next) => {
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
    const res = await addPresent(ctx.request.body)
    handleRes(ctx, next, res)
})

router.get('/getAllPresents', async (ctx, next) => {

    const res = await getAllPresents(ctx.query)
    handleRes(ctx, next, res)
})

router.post('/deletePresent', async (ctx, next) => {
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
    const res = await deletePresent(ctx.request.body)
    handleRes(ctx, next, res)
})

router.post('/getPresents', async (ctx, next) => {
    const res = await getPresents(ctx.request.body.present, ctx.request.body.userid)
    handleRes(ctx, next, res)
})

router.get('/getAllPresentsRecords', async (ctx, next) => {
    const res = await getAllPresentsRecords(ctx.query)
    handleRes(ctx, next, res)

})

router.get('/getPresentsType', async (ctx, next) => {
    const res = await getPresentTypes()
    handleRes(ctx, next, res)
})

router.get('/getRecordPresentType', async (ctx, next) => {
    const res = await getRecordPresentTypes()
    handleRes(ctx, next, res)

})

router.post('/updatePresent', async (ctx, next) => {
    const res = await updatePresents(ctx.request.body)
    handleRes(ctx, next, res)
})
module.exports = router