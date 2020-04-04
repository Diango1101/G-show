const router = require('koa-router')()
const { addPresent, getAllPresents, deletePresent, getPresents, getAllPresentsRecords } = require('../controller/presents')
const { PositiveIntegerValidator, NotEmptyValidator } = require('./validators/validator')
const { getUser } = require('./user')

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
        return new ErrorModel({
            message: '暂无权限'
        })
    }
    const res = await addPresent(ctx.request.body.present)
    handleRes(ctx, next, res)
})

router.post('/getAllPresents', async (ctx, next) => {

    const res = await getAllPresents(ctx.request.body.present)
    handleRes(ctx, next, res)
})

router.get('/:id/deletePresent', async (ctx, next) => {
    const sessionId = ctx.cookies.get('sessionId')
    const loginName = jwt.verify(sessionId, TOKEN_SECRETKEY).username
    const isAdminRes = await isAdmin(loginName)
    if (!isAdminRes) {
        return new ErrorModel({
            message: '暂无权限'
        })
    }
    const v = await new PositiveIntegerValidator().validate(ctx)
    const id = v.get('path.id')
    const res = await deletePresent(id)
    handleRes(ctx, next, res)
})

router.post('/getPresents', async (ctx, next) => {
    const res = await getPresents(ctx.request.body.present, ctx.request.body.userid)
    handleRes(ctx, next, res)
})

router.post('/getAllPresentsRecords', async (ctx, next) => {
    const res = await getAllPresentsRecords(ctx.request.body.presentsrecords)
    handleRes(ctx, next, res)

})
module.exports = router