import { dishUnitRules } from './../../rules/dishRules';
// 菜品管理模块接口
import Router from "koa-router";
import validator from "../../middleware/validator";
import flq from "../../SQLConnect";

const router = new Router({ prefix: '/dish' })

const dish_cate = flq.from('dishes_cate')
const dish_unit = flq.from('dishes_unit')
const dish_data = flq.from('dishes_data')


// 菜品单位

// 增加单位
router.post('/unit', validator(dishUnitRules),async (ctx) => {
    // 获取参数
    const { label } = ctx.data
    const { uid } = ctx.state.user
    // 判断单位名是否重复
    const res = await dish_unit.where({ uid, label }).first()
    if(res) return ctx.error('单位名重复', 202)
    // 添加单位
    await dish_unit.value({ ...ctx.data, uid }).add()
    ctx.success()
})


// 获取单位
router.get('/unit', async (ctx) => {
    
})


export default router.routes()