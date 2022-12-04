import { secretKey } from './../../config';
// 商家验证接口
import Router from "koa-router"
import jsonwebtoken from 'jsonwebtoken'
import flq from "../../SQLConnect"
import validator from '../../middleware/validator'
import { registerRules } from '../../rules/authRules'

const shop_user = flq.from('shop_user')

const router = new Router({ prefix: '/auth' })

// 商家登录
router.post('/login', validator(registerRules), async (ctx) => {
     // 解析参数字段
     const { phone, password } = ctx.request.body
    //  用户名与密码
    const data =  await shop_user.where({ phone }).first()
    // 判断data是否有
    if (!data) return ctx.error('手机号或密码错误', 302)
    // 保存当前用户状态
    jsonwebtoken.sign({ uid: data.uid }, secretKey, { expiresIn: '1y' })
    ctx.success()
})

// 商家注册
router.post('/enroll', validator(registerRules), async (ctx) => {
    // 解析参数字段
    const { phone, password } = ctx.request.body
    // 校验是否重复注册
    const data = await shop_user.where({ phone }).find()
    if (data.length) return ctx.error('用户已注册', 302)
    // 添加商家信息 [ 商家id 唯一标识 ]
    await shop_user.value({ phone,password, uid: Date.now() }).add()
    ctx.success()
})

export default router.routes()