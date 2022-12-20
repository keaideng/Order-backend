import  dayjs  from 'dayjs';
import { wx_appid, wx_secret, wx_url } from './../../config';
import Router from "koa-router"
import Axios from "axios"
import WXBizDataCrypt from '../../utils/WXBizDataCrypt';
import flq from '../../SQLConnect';

const router = new Router({ prefix: '/auth' })

const wx_user = flq.from("wx_user");
const shop_user = flq.from('shop_user')
const dish_category = flq.from("dishes_category");
const dish_data = flq.from("dishes_data");

// 小程序登录
router.post('/login', async (ctx) => {
    // 解析参数
    const { code, encryptedData, iv } = ctx.request.body
    // 发起请求【微信服务器】 获取session_key 和 openid
    const params = { appid: wx_appid, secret: wx_secret, js_code: code, grant_type:'authorization_code' }
    const url = wx_url + '/sns/jscode2session'
    const { data } = await Axios.get(url, { params })
    console.log(data)
    // 判断是否
    if(data.errcode) return ctx.error('认证失败', 202)
    const { openid, session_key } = data
    // 判断用户是否注册
    const info = await wx_user.where({ openid }).first()
    if (info) return ctx.error('找不到该用户')
    // 将加密信息进行解析
    // @ts-ignore
    const res = new WXBizDataCrypt(wx_appid, session_key).decryptData(encryptedData, iv)
    const { nickName, avatarUrl,city,gender  } = res
    // 添加用户信息
    const createTime = dayjs().format('YYYY-DD-MM hh:mm:ss')
    await flq.from('wx_user').value({ openid, nickName, avatarUrl, city, gender, createTime }).add()
    ctx.success()
})

// 获取商家信息
router.get('/shop/info', async (ctx) => {
    // 解析商家uid 
    const { uid } = ctx.query as any
    // 获取商家信息
    const info = await shop_user.where({ uid }).first()
    if (!info) return ctx.error('uid有误', 202)
    // 返回查询数据
    ctx.success(info)
})

// 获取菜品数据
router.get('/list', async (ctx) => {
    // 解析商家uid
    const { uid } = ctx.query as any
    // 获取分类列表
    const category = await dish_category.where({ uid }).find()
    // 获取菜品列表
    const dish = await flq.from('dishes_data').where({ uid }).find()
    // 优化菜品列表格式
    const res_dish = category.map(cate => ({
        cid: cate.id,
        category: cate.label,
        list: dish.filter(item => item.cid === cate.id)
      }))
      ctx.success({ res_cate: category, res_dish })
})

export default router.routes()