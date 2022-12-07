// 商家信息操作模块
import Router from "koa-router"
import qn from "../../config/qn"
import fs from 'fs/promises'
import flq from "../../SQLConnect"
import upload from "../../middleware/upload"
import validator from '../../middleware/validator'
import { informationRules } from "../../rules/authRules"

const shop_user = flq.from('shop_user')

const router = new Router({ prefix: '/shopInfo' })

// 上传图片
router.post('/upload', upload.single('lw') , async (ctx) => {
    // 将本地图片上传到七牛云中
    const uil = await qn.upload(ctx.file)
    // 删除本地图片
    await fs.rm(ctx.file.path)
    // 响应图片URL
    ctx.success(uil)
})

// 更新商家信息
router.post('/', validator(informationRules), async (ctx) => {
    // 获取字段
    const { nickname, address, logo } = ctx.request.body
    // 获取token中的数据
    const { uid } = ctx.state.user
    // 更新商家信息
    const { affectedRows } =  await shop_user.where({ uid }).set({ nickname, address, logo }).update()
    if (!affectedRows) return ctx.error('更新失败')
    // 更新成功
    ctx.success()
})

// 获取商家信息
router.get('/', async (ctx) => {
    // 获取商家uid
    const { uid } = ctx.state.user
    // 根据uid查询信息
    const info = await shop_user.where({ uid }).field('nickname', 'address','logo','uid').first()
    if(!info.nickname) return ctx.success({})
    // 返回数据
    ctx.success(info)
})

export default router.routes()