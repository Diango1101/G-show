const { exec } = require('../db/mysql')
const { SuccessModel, ErrorModel } = require('../model/resModel')





/**
 * 获得所有参赛队伍
 */
const getAllTeams = async function () {
    const sql = `select distinct Team from teams order by RK`
    const res = await exec(sql)
    return new SuccessModel({
        data: res
        // data: res
    })
}
/**
 * 获得所有比赛日期
 */
const getAllGamedate = async function () {
    const sql = `select distinct gamedate from nba20forecasts`
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
    return new SuccessModel({
        data: res[0]
        // data: res
    })
}

/**
 * 根据比赛日期获得队伍  内部使用
 */
const getGameTeamsByDateIn = async function (gamedate) {
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
            odds = 0.9 + 0.58 * pro
        } if (0.6 < pro <= 0.7) {
            odds = 0.8 + 0.78 * pro
        } if (0.7 < pro < 0.9) {
            odds = 0.7 + 0.95 * pro
        } else {
            odds = 0.7 + 0.98 * pro
        }
    } else {
        odds = 1 + pro * 3
    }
    return odds

}
/**
 *   创建游戏  前端加条件仅超管和房管可添加
 */
const addGame = async function (game) {
    const teams = await getGameTeamsByDateIn(game.gamedate)
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
 *   获取所有游戏信息  可分页
 */
const getAllGames = async function (games) {
    const { current = 0, pageSize = 10, team1, team2, gamedate1, gamedate2, status = 1 } = games
    let sql = `select SQL_CALC_FOUND_ROWS * from games where  gamedate between ${gamedate1} and ${gamedate2} `
    if (team1) {
        sql += ` and team1 like '%${team1}%' `
    }
    if (team2) {
        sql += ` and team2 like '%${team2}%' `
    }
    if (status) {
        sql += ` and status = '${status}' `
    }
    sql += ` order by status desc,gamedate desc,createTime desc limit ${current * pageSize},${pageSize}`
    // const sql = `select * from games order by status desc,gamedate desc,createTime desc`
    console.log(sql)
    const res = await exec(sql)
    const sql2 = 'select found_rows() as total'
    const res2 = await exec(sql2)
    return new SuccessModel({
        data: {
            list: res,
            current: parseInt(current),
            pageSize: parseInt(pageSize),
            total: res2[0].total
        }
    })
}

/**
 *   结束某场游戏  前端加条件仅超管可添加
 */
const stopGame = async function (param) {
    const result = await getIsSet(param)
    if (result) {
        const ids = param.ids
        if (!Array.isArray(ids)) {
            return new ErrorModel({
                message: '参数异常',
                httpCode: 400
            })
        }
        const sql = `update games set status = 0 where id in (${ids.join(',')})`
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
    } else {
        return new ErrorModel({
            message: '请确保要结束的每条游戏都已结算',
            httpCode: 500
        })
    }
}
/**
 *   设置某场游戏最终结果  前端加条件仅超管和房管可添加   同时调用内部方法getOdds 设置赔率 SettlementRecords自动结算
 */
const setGameResult = async function (game) {
    const flag = (game.RealWinner == game.preWinner) ? true : false
    const odds = getOdds(flag, game.probability)
    game.odds = odds
    const sql = `update games set RealWinner ='${game.RealWinner}',isSet = 1,odds=${odds}  where id='${game.gameid}'`
    const res = await exec(sql)
    if (res.affectedRows) {
        SettlementRecords(game)
        return new SuccessModel({
            data: res,
            message: '结算成功'
        })
    } else {
        return new ErrorModel({
            message: '结算失败',
            httpCode: 500
        })
    }
}

/**
*   setGameResult设置某场游戏最终结果后触发该方法自动结算   修改个人积分 
*/
const SettlementRecords = async function (game) {
    const sql = `update usergames set RealWinner='${game.RealWinner}' where gameId=${game.gameid}`
    const res = await exec(sql)
    // 加触发器  更新realwinner时触发  设置 personalOdds属性  若realwinner和prewinner一致则personalOdds属性为0.2 不然为-0.2 
    const sql1 = `update usergames set receiveValue=((${game.odds}+personalOdds)*userValue) where gameId=${game.gameid}`
    const res1 = await exec(sql1)
    console.log('updatesql1', sql1)
    if (res1.affectedRows) {
        const sql2 = `update usergames a JOIN users b ON a.userId=b.id set b.records=(b.records+a.receiveValue) where a.gameId=${game.gameid}`
        console.log('updatesql2', sql2)
        const res2 = await exec(sql2)
        if (res2.affectedRows) {
            const sql3 = `update games set status= 0  where id='${game.gameid}'`
            await exec(sql3)
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
const UserBet = async function (userid, gameid, Values, team1, team2, preWinner) {
    const remainrecors = await getUserRemainRecords(userid)
    if (remainrecors > 0) {
        if (remainrecors > Values) {
            const sql = `insert into usergames(userId,gameId,userValue,preWinner,createTime,team1,team2) values
          ('${userid}','${gameid}','${Values}','${preWinner}','${Date.now()}','${team1}','${team2}')`
            const res = await exec(sql)
            const sql2 = `update users set records=(records-${Values}) where id=${userid}`
            const res2 = await exec(sql2)
            const sql3 = `update games set userCounts=(userCounts+1) where id='${gameid}'`
            const res3 = await exec(sql3)
            if (res3.affectedRows) {
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
*   获取游戏记录 用户列表
*/
const getInUsers = async function () {
    const sql = `select distinct a.userId,b.username from usergames a left join users b on a.userId=b.id`
    const res = await exec(sql)
    return new SuccessModel({
        data: res
    })
}
/**
*   获取游戏记录  中 个人战况汇总
*/
const getTotalRecords = async function (userId) {
    const { userid } = userId
    const sql1 = `select sum(userValue) as totalCost,sum(receiveValue) as totalGet,count(personalOdds) as winCounts from usergames where userId='${userid}' and personalOdds>0`
    const res1 = await exec(sql1)
    console.log(sql1)
    const sql2 = `select count(personalOdds) as loseCounts from usergames where userId='${userid}' and personalOdds<0`
    const res2 = await exec(sql2)
    console.log(sql2)
    return new SuccessModel({
        data: {
            totalCost: res1[0].totalCost,
            totalGet: res1[0].totalGet,
            winCounts: res1[0].winCounts,
            loseCounts: res2[0].loseCounts
        }
    })
}


/**
*   获得所有用户参赛情况  可分页   分管理员取所有和 其他用户只能看自己的
*/
const getAllUserGames = async function (usergames) {
    const { current = 0, pageSize = 10, userId, team1, team2, userValue, receiveValue, startTime, endTime, preResult } = usergames
    let sql = `select SQL_CALC_FOUND_ROWS a.id,a.userId,b.username,a.gameId,a.userValue,a.receiveValue,a.createTime,a.team1,a.team2,a.RealWinner,a.preWinner,a.personalOdds 
    from usergames a left join users b on  a.userId =b.id  where createTime between ${startTime || 0} and ${endTime || Date.now()}  `
    if (userId) {
        sql += `and userId='${userId}' `
    }
    if (team1) {
        sql += `and team1 like '%${team1}%' `
    }
    if (team2) {
        sql += `and team2 like '%${team2}%' `
    }
    if (receiveValue) {
        sql += `and receiveValue between 0 and '${receiveValue}' `
    }
    if (userValue) {
        sql += `and userValue between 0 and '${userValue}' `
    }
    if (preResult) {
        if (preResult == '1') {
            sql += ` and personalOdds >0 `
        } else {
            sql += ` and personalOdds <0  `
        }
    }
    sql += `order by createTime desc,receiveValue desc,b.username limit ${current * pageSize},${pageSize}`
    // const sql = `select * from games order by status desc,gamedate desc,createTime desc`
    console.log(sql)
    const res = await exec(sql)
    const sql2 = 'select found_rows() as total'
    const res2 = await exec(sql2)
    return new SuccessModel({
        data: {
            list: res,
            current: parseInt(current),
            pageSize: parseInt(pageSize),
            total: res2[0].total
        }
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


/**
*   判断游戏是否已结算  可单条或多条
*/
const getIsSet = async function (param) {
    const ids = param.ids
    if (!Array.isArray(ids)) {
        return new ErrorModel({
            message: '参数异常',
            httpCode: 400
        })
    }
    const sql = `select isSet from games where id in (${ids.join(',')})`
    const res = await exec(sql)
    let isSets = res
    for (let i = 0; i < isSets.length; i++) {
        if (isSets[i].isSet == 0) {
            return false
        }
    }
    return true
}

module.exports = {
    getTeams,
    getAllTeams,
    getAllGamedate,
    getAllUserGames,
    addGame,
    getGameTeamsByDate,
    getAllGames,
    stopGame,
    setGameResult,
    UserBet,
    getInUsers,
    getTotalRecords
}