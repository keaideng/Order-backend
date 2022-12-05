import { qiniu_bucket, qiniu_accessKey, qiniu_secretKey,qiniu_url } from './config';
import qiniu from 'qiniu'

// 设置上传空间
const putPolicy = new qiniu.rs.PutPolicy({ scope: qiniu_bucket })
// 设置AK与SK
const mac = new qiniu.auth.digest.Mac(qiniu_accessKey, qiniu_secretKey)
// 获取上传凭证
const uploadToken = putPolicy.uploadToken(mac)

// 设置上传配置
const config = new qiniu.conf.Config()
// @ts-ignore
config.zone = qiniu.zone.Zone_z2

// 获取上传方法
const formUploader = new qiniu.form_up.FormUploader(config)

// 获取上传压缩方法
const putExtra = new qiniu.form_up.PutExtra()

// 调用上传方法
formUploader.putFile(uploadToken, 'kb.png', '"D://照片//3a6b00cc2f71a7e7ddc4f45d4d25c55.jpg"', putExtra, function(respErr, respBody, respInfo) {
  // 上传失败
  if (respErr) {
    throw respErr;
  }
  // 判断状态码是否为200
  if (respInfo.statusCode == 200) {
    console.log( qiniu_url + respBody.key);
  } else {
    console.log(respInfo.statusCode);
    console.log(respBody);
  }
})