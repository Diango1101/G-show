const CryptoJS = require('crypto-js')
const crypto = require('crypto') //这是node自带的
const { FRONT_SECRETKEY, BACKEND_SECRETKEY } = require('../config/secret')

/**
 * 前端加密函数，加密同一个字符串生成的都不相同,加密/解密秘钥必须和前端的相同
 * @param {*} str 
 */
function encrypt(str) {
    return CryptoJS.AES.encrypt(JSON.stringify(str), FRONT_SECRETKEY).toString();
}

/**
 * 前端解密函数
 * @param {*} str 
 */
function decrypt(str) {
    const bytes = CryptoJS.AES.decrypt(str, FRONT_SECRETKEY);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
}

/**
 * md5 加密
 * @param {*} content 
 */
function md5(content) {
    let md5 = crypto.createHash('md5')
    return md5.update(content).digest('hex')
}

/**
 * 后端及加密函数，加密同一个字符串每次结果相同，可存数据库
 * @param {*} password 
 */
function genPassword(password) {
    const str = `password=${password}&key=${BACKEND_SECRETKEY}`
    return md5(str)
}

const findMembers = function (instance, {
    prefix,
    specifiedType,
    filter
}) {
    // 递归函数
    function _find(instance) {
        //基线条件（跳出递归）
        if (instance.__proto__ === null)
            return []

        let names = Reflect.ownKeys(instance)
        names = names.filter((name) => {
            // 过滤掉不满足条件的属性或方法名
            return _shouldKeep(name)
        })

        return [...names, ..._find(instance.__proto__)]
    }

    function _shouldKeep(value) {
        if (filter) {
            if (filter(value)) {
                return true
            }
        }
        if (prefix)
            if (value.startsWith(prefix))
                return true
        if (specifiedType)
            if (instance[value] instanceof specifiedType)
                return true
    }

    return _find(instance)
}



module.exports = {
    encrypt,
    decrypt,
    genPassword,
    findMembers
}
