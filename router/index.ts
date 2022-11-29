import Router from 'koa-router'

const router = new Router()

router.get('/', (ctx) => {
  console.log('请求成功')
  ctx.body = '老王打飞机'
})

router.post('/', (ctx) => {
  console.log('请求成功2')
  ctx.body = 'post你好'
})

export default router