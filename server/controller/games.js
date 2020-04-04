const { exec } = require('../db/mysql')
const { SuccessModel, ErrorModel } = require('../model/resModel')





/**
 * 获得所有参赛队伍
 */
const getAllTeams = async function () {
    const sql = `select Team from teams order by RK`
    const res = await exec(sql)
    return new SuccessModel({
        data: res
        // data: res
    })
}

/**
 * 根据比赛日期获得队伍
 */
const getGameTeamsByDate = async function (gamedate) {
    const sql = `select win,lose from nba20forecasts where gamedate='${gamedate}'`
    const res = await exec(sql)
    return res
}

/**
 * 根据获胜率和最终结果得出赔率  内部方法
 */
const getOdds = function (platwin = true, probability) {
    let pro = probability
    var odds
    if (platwin) {
        if (0.5 <= pro <= 0.6) {
            odds = 0.9 + 0.38 * pro
        } if (0.6 < pro <= 0.7) {
            odds = 0.88 + 0.33 * pro
        } if (0.7 < pro < 0.9) {
            odds = 0.8 + 0.65 * pro
        } else {
            odds = 0.8 + 0.9 * pro
        }
    } else {
        odds = 5 + pro * 5
    }
    return odds

}

/**
 *   创建游戏  前端加条件仅超管和房管可添加
 */
const addGame = async function (game) {
    const teams = await getGameTeamsByDate(game.gamedate)
    var win, probability
    if (teams.length == 1) {
        const sql1 = `select win,probability from nba20forecasts where gamedate='${game.gamedate}'`
        const res1 = await exec(sql1)
        win = res1[0].win
        probability = res1[0].probability
    }
    if (teams.length > 1) {
        const testsql1 = `select win,probability from nba20forecasts where gamedate='${game.gamedate}' and win='${game.team1}' and lose='${game.team2}'`
        const testres1 = await exec(testsql1)
        if (testres1.length == 0) {
            const testsql2 = `select win,probability from nba20forecasts where gamedate='${game.gamedate}' and win='${game.team2}' and lose='${game.team1}'`
            const testres2 = await exec(testsql2)
            win = testres2[0].win
            probability = testres2[0].probability
        } else {
            console.log('testres1', testres1)
            win = testres1[0].win
            probability = testres1[0].probability
        }
    }
    const sql = `insert into games( team1,team2,gamedate,createTime,preWinner,probability ) values
    ('${game.team1}','${game.team2}','${game.gamedate}','${Date.now()}','${win}','${probability}')`
    const res = await exec(sql)
    if (res.affectedRows) {
        return new SuccessModel({
            // data: { gameId: res.insertId },
            data: res,
            message: '创建游戏成功'
        })
    } else {
        return new ErrorModel({
            message: '创建游戏失败',
            httpCode: 500
        })
    }
}
/**
 *   获取所有游戏信息
 */
const getAllGames = async function () {
    const sql = `select * from games order by status desc,gamedate desc,createTime desc`
    const res = await exec(sql)
    return new SuccessModel({
        data: res,
        message: '获取所有列表成功'
    })
}

/**
 *   结束某场游戏  前端加条件仅超管和房管可添加
 */
const stopGame = async function (gameid) {
    const sql = `update games set status = 0 where id=${gameid}`
    const res = await exec(sql)
    if (res.affectedRows) {
        return new SuccessModel({
            // data: { gameId: res.insertId },
            data: res,
            message: '设置成功'
        })
    } else {
        return new ErrorModel({
            message: '创建游戏失败',
            httpCode: 500
        })
    }
}
/**
 *   设置某场游戏最终结果  前端加条件仅超管和房管可添加   同时调用内部方法getOdds  设置赔率
 */
const setGameResult = async function (game) {
    const flag = (game.RealWinner == game.preWinner) ? true : false
    const odds = getOdds(flag, game.probability)
    game.odds = odds
    const sql = `update games set RealWinner ='${game.RealWinner}',status= 0,odds=${odds}  where id='${game.gameid}'`
    const res = await exec(sql)
    if (res.affectedRows) {
        SettlementRecords(game)
        return new SuccessModel({
            data: res,
            message: '设置成功'
        })
    } else {
        return new ErrorModel({
            message: '创建游戏失败',
            httpCode: 500
        })
    }
}

/**
*   setGameResult设置某场游戏最终结果后触发该方法自动结算   修改个人积分 需传入原积分
*/
const SettlementRecords = async function (game) {

    const sql1 = `update usergames set receiveValue=(${game.odds}*userValue) where gameId=${game.gameid}`
    const res1 = await exec(sql1)
    if (res1.affectedRows) {
        const sql2 = `update usergames a JOIN users b ON a.userId=b.id set b.records=(b.records+a.receiveValue) where a.gameId=${game.gameid}`
        const res2 = await exec(sql2)
        if (res2.affectedRows) {
            return new SuccessModel({
                data: res2,
                message: '结算成功'
            })
        } else {
            return new ErrorModel({
                message: '结算失败(第二步)',
                httpCode: 500
            })
        }
    } else {
        return new ErrorModel({
            message: '结算失败(第一步)',
            httpCode: 500
        })
    }

}

/**
*   参加游戏并下注  数据表usergames
*/
const UserBet = async function (userid, gameid, Values) {
    const remainrecors = await getUserRemainRecords(userid)
    if (remainrecors > 0) {
        if (remainrecors > Values) {
            const sql = `insert into usergames(userId,gameId,userValue,createTime) values
          ('${userid}','${gameid}','${Values}','${Date.now()}')`
            const res = await exec(sql)
            const sql2 = `update users set records=(records-${Values}) where id=${userid}`
            const res2 = await exec(sql2)
            if (res2.affectedRows) {
                return new SuccessModel({
                    data: res2,
                    message: '下注成功'
                })
            } else {
                return new ErrorModel({
                    message: '下注失败',
                    httpCode: 500,
                    data: res2,
                })
            }
        } else {
            return new ErrorModel({
                message: '剩余积分小于下注积分，下注失败',
                httpCode: 500,
            })
        }
    } else {
        return new ErrorModel({
            message: '积分为负下注失败，小赌怡情大赌伤身~',
            httpCode: 500,
        })
    }

}

/**
*   获取用户剩余积分
*/
const getUserRemainRecords = async function (userid) {
    const sql = `select records from users where id=${userid}`
    const res = await exec(sql)
    return res[0].records
}

/**
*   获得所有用户参赛情况
*/
const getAllUserGames = async function () {
    const sql = `select * from usergames order by createTime desc`
    const res = await exec(sql)
    return new SuccessModel({
        data: res,
        message: '查询成功'
    })
}

/**
* 根据gameid获得队伍
* @gameid  
*/
const getTeams = async function (gameid) {
    const sql = `select win,lose from nba20forecasts where id='${gameid}'`
    const res = await exec(sql)
    return new SuccessModel({
        data: { teams: [res[0].win, res[0].lose] }
        // data: res
    })
}
module.exports = {
    getTeams,
    getAllTeams,
    getAllUserGames,
    addGame,
    getGameTeamsByDate,
    getAllGames,
    stopGame,
    setGameResult,
    UserBet
}