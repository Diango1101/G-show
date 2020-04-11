const { exec } = require('../db/mysql')
const { SuccessModel, ErrorModel } = require('../model/resModel')



/**
 * 添加礼品
 */
const addPresent = async function (present) {
    const { presentName, presentAvatar = 'http://localhost:8888/public/images/present_adatar.png', presentType, presentValue, presentDesc, presentCounts } = present
    const sql = `insert into presents(presentName,presentAvatar,presentType,presentValue,presentDesc,presentCounts)
        values ('${presentName}','${presentAvatar}','${presentType}','${presentValue}','${presentDesc}','${presentCounts}')`

    console.log(sql)
    const res = await exec(sql)
    if (res.affectedRows) {
        return new SuccessModel({
            data: res,
            message: '添加礼品成功'
        })
    } else {
        return new ErrorModel({
            message: '添加礼品失败',
            httpCode: 500
        })
    }
}

/**
 * 查询所有礼品 可分页
 */
const getAllPresents = async (present) => {
    const { current = 0, pageSize = 10, presentName, presentType, presentValue } = present
    let sql = `select SQL_CALC_FOUND_ROWS * from presents where presentValue between ${0} and ${presentValue} and presentCounts > 0  `
    if (presentName) {
        sql += `and presentName like '%${presentName}%' `
    }
    if (presentType) {
        sql += `and presentType like '%${presentType}%' `
    }
    sql += `order by presentCounts desc limit ${current * pageSize},${pageSize}`
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
 * 查询所有礼品兑换记录 可分页
 */
const getAllPresentsRecords = async (presentsrecords) => {
    const { current = 0, pageSize = 10, userId, presentName, presentType, realCost } = presentsrecords
    let sql = `select SQL_CALC_FOUND_ROWS * from presentsrecords where userId='${userId}' and realCost between ${0} and ${realCost} `
    if (presentName) {
        sql += `and presentName like '%${presentName}%' `
    }
    if (presentType) {
        sql += `and presentType like '%${presentType}%' `
    }
    sql += `order by createTime desc limit ${current * pageSize},${pageSize}`
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
 * 下架礼品
 */
const deletePresent = async (param) => {
    const ids = param.ids
    if (!Array.isArray(ids)) {
        return new ErrorModel({
            message: '参数异常',
            httpCode: 400
        })
    }
    const sql = `delete from presents where id in (${ids.join(',')})`
    const res = await exec(sql)
    if (res.affectedRows) {
        return new SuccessModel({
            data: res,
            message: '删除成功'
        })
    } else {
        return new ErrorModel({
            message: '删除失败',
            httpCode: 500
        })
    }
}

/**
 * 兑换商品
 */
const getPresents = async (present, userid) => {
    const { getRecordsIN } = require('./user')
    const { presentid, presentCounts = 1, presentValue, presentName, presentType } = present
    let realValue = presentCounts * presentValue

    let realRecords = await getRecordsIN(userid)
    console.log(realValue, realRecords)
    if (realRecords < realValue) {
        return new ErrorModel({
            message: '积分不足',
            httpCode: 500
        })
    } else {

        const sql1 = `update users set records=(records-${realValue}) where id='${userid}'`
        const sql2 = `insert into presentsrecords(presentId,userId,counts,createTime,presentName,presentType,realCost) 
                    values('${presentid}','${userid}','${presentCounts}','${Date.now()}','${presentName}','${presentType}','${realValue}')`
        const sql3 = `update presents set presentCounts=(presentCounts-${presentCounts}) where id=${presentid}`
        console.log(sql2)
        const res = await Promise.all([exec(sql1), exec(sql2), exec(sql3)])
        if (res[0].affectedRows && res[1].affectedRows && res[2].affectedRows)
            return new SuccessModel({
                data: res,
                message: '兑换成功'
            })
    }
}



/**
 * 获取礼物种类
 */
const getPresentTypes = async () => {
    const sql = `select distinct  presentType from presents`
    const res = await exec(sql)
    return new SuccessModel({
        data: res,
        message: '获取种类成功'
    })
}

/**
 * 获取记录礼物种类
 */
const getRecordPresentTypes = async () => {
    const sql = `select distinct  presentType from presentsrecords`
    const res = await exec(sql)
    return new SuccessModel({
        data: res,
        message: '获取种类成功'
    })
}

/**
 * 编辑礼物
 */
const updatePresents = async (presents) => {
    const { id, presentName, presentAvatar = 'http://localhost:8888/public/images/present_adatar.png', presentType, presentValue, presentDesc, presentCounts } = presents
    const sql = `update presents set presentName='${presentName}',presentAvatar='${presentAvatar}',presentType='${presentType}',presentValue=${presentValue},
    presentDesc='${presentDesc}',presentCounts=${presentCounts}  where  id=${id}`
    const res = await exec(sql)
    return new SuccessModel({
        data: res,
        message: '更新成功'
    })
}



module.exports = {
    addPresent,
    getAllPresents,
    deletePresent,
    getPresents,
    getAllPresentsRecords,
    getPresentTypes,
    getRecordPresentTypes,
    updatePresents
}