const router = require('koa-router')()
const uploadFile = require('../utils/upload')
const path = require('path')
const { getChatList } = require('../controller/chat')
const { getLiveList } = require('../controller/lives')
const { PositiveIntegerValidator } = require('./validators/validator')

function handleRes(ctx, next, res) {
    if (res.status === 0) {
        ctx.body = res
    } else {
        ctx.status = res.httpCode
        ctx.body = res
        // ctx.message = res.message   //本来想直接设置fetch的statusText，但是加了这句话请求就出错
    }
}

router.get('/', async (ctx, next) => {
    await ctx.render('index.html')
})

//上传接口
router.post('/upload', async (ctx, next) => {
    const { isImg, fileType } = ctx.query
    const serverFilePath = path.join(__dirname, '../public/upload-files')
    const res = await uploadFile(ctx, {
        fileType: fileType || 'myUpload', // common or album
        path: serverFilePath,
        isImg: !!isImg
    })
    handleRes(ctx, next, res)
})

router.get('/chat/list/:roomid', async (ctx, next) => {
    const v = await new PositiveIntegerValidator().validate(ctx, {
        id: 'roomid'
    })
    const roomid = v.get('path.roomid')
    const res = await getChatList(roomid)
    handleRes(ctx, next, res)
})

router.get('/lives/list/:roomid', async (ctx, next) => {
    const v = await new PositiveIntegerValidator().validate(ctx, {
        id: 'roomid'
    })
    const roomid = v.get('path.roomid')
    const res = await getLiveList(roomid)
    handleRes(ctx, next, res)
})

router.get('/json', async (ctx, next) => {
    console.log(ctx.cookies.get('sessionId'))
    ctx.body = {
        title: 'koa2 json'
    }
})

module.exports = router
