const requireDirectory = require('require-directory')
const Router = require('koa-router')

class InitManager {
    static initCore(app) {
        // 入口方法
        InitManager.app = app
        InitManager.initLoadRouters()
        InitManager.loadHttpException()
    }
    static initLoadRouters() {
        // path  config  or absolute path
        const apiDirectory = `${process.cwd()}/routes`
        console.log('apiDirectory', apiDirectory)
        requireDirectory(module, apiDirectory, {
            visit: whenLoadModule
        })

        function whenLoadModule(obj) {
            if (obj instanceof Router) {
                InitManager.app.use(obj.routes(), obj.allowedMethods())
            }
        }
    }

    static loadHttpException() {
        const errors = require('./http-exception')
        global.errs = errors
    }
}

module.exports = InitManager
