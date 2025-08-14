import axios from 'axios'
import { ElMessage } from 'element-plus'

const service = axios.create({
  // axios中请求配置有baseURL选项，表示请求URL公共部分
  baseURL: '/product-api',
  // 超时
  timeout: 10000
})

// 请求拦截器
service.interceptors.request.use(config => {
  console.log('请求配置:', config)
  return config
}, error => {
  console.log('请求错误:', error)
  return Promise.reject(error)
})
// 响应拦截器
service.interceptors.response.use(
  response => {
    // 对响应数据做些事
    return response.data
  },
  error => {
    console.log('err' + error)
    let { message } = error;
    if (message == "Network Error") {
      message = "后端接口连接异常";
    } else if (message.includes("timeout")) {
      message = "系统接口请求超时";
    } else if (message.includes("Request failed with status code")) {
      message = "系统接口" + message.substr(message.length - 3) + "异常";
    }
    ElMessage({ message: message, type: 'error', duration: 5 * 1000 })
    return Promise.reject(error)
  }
)

export default service