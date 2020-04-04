const { LinValidator, Rule } = require('../../utils/lin-validator-v2')
class PositiveIntegerValidator extends LinValidator {
    constructor() {
        super()
        this.id = [
            // 可多个Rule   且关系
            // Rule第一个第三个参数来自validator.js
            new Rule(
                'isInt',
                '需要是正整数',
                {
                    min: 1
                }
                // , new Rule()
            )
        ]
    }
}

class RegisterValidator extends LinValidator {
    constructor() {
        super()
        this.password = [
            // 用户指定范围 123456 $^
            new Rule('isLength', '密码至少6个字符，最多32个字符', {
                min: 6,
                max: 128
            }),
            new Rule(
                'matches',
                '密码不符合规范',
                '^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]'
            )
        ]
        this.username = [
            new Rule('isLength', '昵称不符合长度规范', {
                min: 3,
                max: 32
            })
        ]
    }

}


class NotEmptyValidator extends LinValidator {
    constructor() {
        super()
        this.title = [
            new Rule('isLength', '不允许为空', {
                min: 1
            })
        ]
    }
}




class SearchValidator extends LinValidator {
    // 分页用start count  起始值和连续值
    constructor() {
        super()
        this.q = [
            new Rule('isLength', '搜索关键词不能为空', {
                min: 1,
                max: 16
            })
        ]
        this.start = [
            new Rule('isInt', '不符合规范', {
                min: 0,
                max: 60000
            }),
            // isOptional  可以不传
            new Rule('isOptional', '', 0)
        ]
        this.count = [
            new Rule('isInt', '不符合规范', {
                min: 1,
                max: 20
            }),
            new Rule('isOptional', '', 20)
        ]
    }
}
class AddShortCommentValidator extends PositiveIntegerValidator {
    constructor() {
        super()
        this.content = [
            new Rule('isLength', '必须在1到12个字符之间', {
                min: 1,
                max: 12
            })
        ]
    }
}
module.exports = {
    PositiveIntegerValidator,
    RegisterValidator,
    NotEmptyValidator,
    SearchValidator,
    AddShortCommentValidator
}
