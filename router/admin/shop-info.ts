// 商家信息操作模块
import Router from "koa-router"
import qn from "../../config/qn"
import fs from 'fs/promises'
import upload from "../../middleware/upload"

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
router.post('/', async (ctx) => {
    
})

// 获取商家信息
router.get('/', async (ctx) => {

    
})

export default router.routes()