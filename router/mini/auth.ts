import { wx_appid, wx_secret, wx_url } from './../../config';
import Router from "koa-router"
import Axios from "axios"
import WXBizDataCrypt from '../../utils/WXBizDataCrypt';

const router = new Router({ prefix: '/auth' })

// 小程序登录
router.post('/login', async (ctx) => {
    // 解析参数
    const { code, encryptedData, iv } = ctx.request.body
    // 发起请求【微信服务器】 获取session_key 和 openid
    const params = { appid: wx_appid, secret: wx_secret, js_code: code, grant_type:'authorization_code' }
    const url = wx_url + '/sns/jscode2session'
    const { data } = await Axios.get(url, { params })
    // 判断是否
    if(data.errcode) return ctx.error('认证失败', 202)
    const { openid, session_key } = data
    // 将加密信息进行解析
    // @ts-ignore
    const res = new WXBizDataCrypt(wx_appid, session_key).decryptData(encryptedData, iv)
    console.log(res)
    ctx.success()
})

export default router.routes()