import { Context, Next } from "koa";

// 返回结果中间件
export default () => {
    return async function (ctx: Context, next: Next) {
        ctx.success = function(data = null, msg = '请求成功', code = 200) {
            ctx.body = { data, msg, code }
        }
        await next()
    }
}