import {
  dishUnitRules,
  dishCateRules,
  dishCateRules2,
  dishDataRules,
  dishDataRules2
} from "./../../rules/dishRules";
// 菜品管理模块接口
import Router from "koa-router";
import validator from "../../middleware/validator";
import flq from "../../SQLConnect";
import { PageResult } from "../../types/interface";
import dayjs from "dayjs";
const router = new Router({ prefix: "/dish" });

const dish_category = flq.from("dishes_category");
const dish_unit = flq.from("dishes_unit");
const dish_data = flq.from("dishes_data");

//     菜品类目

// 查询类目
router.get("/category", async (ctx) => {
  // 解析参数
  const { page = 1, pageSize = 10 } = ctx.query as any;
  const { uid } = ctx.state.user;
  // 2. 查询类目 分页【limit({ size: 每页条数, page: 当前页 })】  排序【order({ 字段: 规则 })】
  const cateList = await dish_category
    .where({ uid })
    .limit({ page: page, size: pageSize })
    .order({ rank: 1 })
    .find();
  const total = (await dish_category.where({ uid }).count()) as number;
  const totalPage = Math.ceil(total / pageSize);
  // 3. 处理响应字段
  const result: PageResult = {
    page: +page,
    total,
    pageSize: +pageSize,
    totalPage,
    list: cateList,
  };
  ctx.success(result);
});

// 增加类目
router.post("/category", validator(dishCateRules), async (ctx) => {
  // 解析参数
  const { uid } = ctx.state.user;
  // 判断label是否重复
  const res = await dish_category.where({ uid, label: ctx.data.label }).first();
  if (res) return ctx.error("该类目重复", 202);
  // 添加类目
  await dish_category.value({ uid, ...ctx.data }).add();
  ctx.success();
});

// 修改类目
router.put("/category", validator(dishCateRules2), async (ctx) => {
  // 需要的参数【id， lable?, value?, rank?】
  const { uid } = ctx.state.user;
  const { id, label } = ctx.data;
  // 验证label唯一性
  const res = await dish_category.where({ uid, label }).first();
  if (res && res.id != id) return ctx.error("label重复", 202);
  // 2. 执行修改操作
  await dish_category.where({ uid, id }).set(ctx.data).update();
  // 3. 修改对应label的菜品
  if (!res) {
    await dish_data.where({ uid, cid: id }).set({ category: label }).update();
  }
  ctx.success();
});

// 删除类目
router.delete("/category/:id", async (ctx) => {
  // 解析参数
  const { id } = ctx.params;
  const { uid } = ctx.state.user;
  // 判断是否有菜品
  const res = await dish_data.where({ uid, cid: id }).first();
  if (res) return ctx.error("有菜品! 不能删除", 202);
  // 3. uid和id删除
  const { affectedRows } = await dish_category.where({ uid, id }).remove();
  if (!affectedRows) return ctx.error("菜品ID有误", 202);
  ctx.success();
});

//     菜品单位
// 增加单位
router.post("/unit", validator(dishUnitRules), async (ctx) => {
  // 获取参数
  const { label } = ctx.data;
  const { uid } = ctx.state.user;
  // 判断单位名是否重复
  const res = await dish_unit.where({ label, uid }).first();
  if (res) return ctx.error("单位名重复", 202);
  // 添加单位
  await dish_unit.value({ ...ctx.data, uid }).add();
  ctx.success();
});

// 获取单位
router.get("/unit", async (ctx) => {
  // 获取uid
  const { uid } = ctx.state.user;
  // 通过uid查询
  const res = await dish_unit.where({ uid }).find();
  // 返回查询数据
  ctx.success(res);
});

//     菜品信息

// 新增菜品
router.post("/data", validator(dishDataRules), async (ctx) => {
  // 获取参数
  const { uid } = ctx.state.user;
  const { cid, unit } = ctx.data;
  const time = dayjs().format("YYYY-MM-DD hh:mm:ss");
  // 任务:  校验cid的有效性    校验单位的有效性
  const res = await dish_data.where({ cid, unit }).first();
  if (res) return ctx.error("cid跟单位重复", 202);
  // 增加菜品信息
  await dish_data.value({ ...ctx.data, time, uid }).add();
  ctx.success();
});

// 获取菜品列表
router.get("/data", async (ctx) => {
  // 获取参数
  const { page = 1, pageSize = 10, cid, name = "", onsale } = ctx.query as any;
  const { uid } = ctx.state.user;
  // 2. 查询
  const data = await dish_data.where({ uid, cid, name: { com: 'LIKE', val: `%${name}%` }, onsale }).limit({ size: pageSize, page }).order({ rank: 1 }).find()
  ctx.success(data)
});

// 获取菜品详情
router.get('/data/:id', async (ctx) => {
  // 获取参数
  const { uid } = ctx.state.user
  const { id } = ctx.params
  // 查询菜品
  const res = await dish_data.where({ uid, id }).field().first()
  // 返回响应
  ctx.success(res)
})

// 修改菜品
router.put('/data', validator(dishDataRules2), async (ctx) => {
  // 获取参数
  const { id } = ctx.data
  const { uid } = ctx.state.user
  const { affectedRows } = await dish_data.where({ uid, id }).set(ctx.data).update()
  if (!affectedRows) return ctx.error('id有误', 202)
  ctx.success()
})

// 上架下架菜品
router.put('/data/:id/:state', async (ctx) => {
  const { id, state } = ctx.params
  const { uid } = ctx.state.user
  // 校验菜品状态 0 1
  if (!['0', '1'].includes(state)) return ctx.error('菜品状态有误', 202)
  // 2. 修改菜品状态
  const { affectedRows } = await dish_data.where({ uid, id }).set({ onsale: state }).update()
  if (!affectedRows) return ctx.error('id有误', 202)
  ctx.success()
})

export default router.routes();