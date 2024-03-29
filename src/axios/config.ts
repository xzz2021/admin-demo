import { AxiosResponse, AxiosRequestHeaders, InternalAxiosRequestConfig } from './types'
import { ElMessage } from 'element-plus'
import qs from 'qs'
// import { SUCCESS_CODE } from '@/constants'
import { useUserStoreWithOut } from '@/store/modules/user'

const defaultRequestInterceptors = (config: InternalAxiosRequestConfig) => {
  if (
    config.method === 'post' &&
    (config.headers as AxiosRequestHeaders)['Content-Type'] === 'application/x-www-form-urlencoded'
  ) {
    config.data = qs.stringify(config.data)
  }
  if (config.method === 'get' && config.params) {
    let url = config.url as string
    url += '?'
    const keys = Object.keys(config.params)
    for (const key of keys) {
      if (config.params[key] !== void 0 && config.params[key] !== null) {
        url += `${key}=${encodeURIComponent(config.params[key])}&`
      }
    }
    url = url.substring(0, url.length - 1)
    config.params = {}
    config.url = url
  }

  // 响应头添加token认证
  const userStore = useUserStoreWithOut()
  config.headers.Authorization = 'Bearer ' + userStore.getTokenKey
  // console.log('🚀 ~ file: config.ts:28 ~ defaultRequestInterceptors ~ config.headers:', config.headers)
  return config
}

const defaultResponseInterceptors = (response: AxiosResponse) => {
  if (response?.config?.responseType === 'blob') {
    // 如果是文件流，直接过
    return response
    // } else if (response.data.code === SUCCESS_CODE) {
  } else if (response.data) {
    return response.data
    return response.data.data || response.data
  } else {
    // if (response?.data?.statusCode == 403) {
    //   ElMessage.error('当前用户没有此接口数据请求权限!')
    // } else {
    ElMessage.error(response?.data?.message)
    // }
    if (response?.data?.code === 401) {
      const userStore = useUserStoreWithOut()
      userStore.logout()
    }
  }
}

export { defaultResponseInterceptors, defaultRequestInterceptors }
