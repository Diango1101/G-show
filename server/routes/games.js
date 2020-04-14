const router = require('koa-router')()
const { getTeams, getAllTeams, getAllUserGames, getGameTeamsByDate, addGame, getAllGames, stopGame, setGameResult, UserBet, getAllGamedate, getInUsers, getTotalRecords } = require('../controller/games')
const { PositiveIntegerValidator, NotEmptyValidator } = require('./validators/validator')
router.prefix('/games')

function handleRes(ctx, next, res) {
    if (res.status === 0) {
        ctx.body = res
    } else {
        ctx.status = res.httpCode
        ctx.body = res
    }
}
router.get('/:id/getteams', async function (ctx, next) {
    const v = await new PositiveIntegerValidator().validate(ctx)
    const id = v.get('path.id')
    const res = await getTeams(id)
    handleRes(ctx, next, res)
})

router.get('/getAllTeams', async function (ctx, next) {
    const res = await getAllTeams()
    handleRes(ctx, next, res)
})

router.get('/getAllGamedate', async function (ctx, next) {
    const res = await getAllGamedate()
    handleRes(ctx, next, res)
})

router.get('/getGameTeamsByDate', async function (ctx, next) {
    const v = await new NotEmptyValidator().validate(ctx, {
        title: 'gamedate'
    })
    const gamedate = v.get('query.gamedate')
    const res = await getGameTeamsByDate(gamedate)
    handleRes(ctx, next, res)
})

router.post('/addGame', async function (ctx, next) {
    const res = await addGame(ctx.request.body)
    handleRes(ctx, next, res)
})

router.get('/getAllGames', async function (ctx, next) {
    const res = await getAllGames(ctx.query)
    handleRes(ctx, next, res)
})

router.post('/stopGame', async function (ctx, next) {

    const res = await stopGame(ctx.request.body)
    handleRes(ctx, next, res)
})

router.post('/userBet', async function (ctx, next) {
    const { userid, gameid, Values, team1, team2, preWinner } = ctx.request.body
    const res = await UserBet(userid, gameid, Values, team1, team2, preWinner)
    handleRes(ctx, next, res)
})

router.post('/setGameResult', async function (ctx, next) {
    const res = await setGameResult(ctx.request.body.game)
    handleRes(ctx, next, res)
})

router.get('/getAllUserGames', async function (ctx, next) {
    const res = await getAllUserGames(ctx.query)
    handleRes(ctx, next, res)
})

router.get('/getInUsers', async function (ctx, next) {
    const res = await getInUsers()
    handleRes(ctx, next, res)
})

router.get('/getTotals', async function (ctx, next) {
    console.log(ctx.query)
    const res = await getTotalRecords(ctx.query)
    handleRes(ctx, next, res)
})

module.exports = router