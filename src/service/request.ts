import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import JSONbig from 'json-bigint'

export interface CommonResponse<T> {
  code: number
  message: string
  data?: T
}

function filterEmptyParams(params: { [propName: string]: any } | undefined) {
  if (params && typeof params === 'object') {
    Object.keys(params).forEach((key) => {
      const val = params[key]
      if (['', undefined, null].includes(val)) {
        delete params[key]
      }
    })
    return params
  }
  return params
}

export interface RequestParams extends AxiosRequestConfig {
  [props: string]: any
}

export default class Fetcher {
  params: RequestParams | undefined
  instance: AxiosInstance

  constructor(params: AxiosRequestConfig = {}) {
    this.params = params
    this.params.baseURL =
      this.prune(process.env.NEXT_PUBLIC_API_HOST || '') + params.baseURL
    this.instance = axios.create({
      ...params,
      transformResponse: [
        (data) => {
          try {
            data = JSONbig.parse(data)
          } catch (e) {
            console.log(e)
          }
          return data
        },
      ],
    })
  }

  get context() {
    return this.params?.context
  }

  get cookies() {
    return this.context?.cookies || {}
  }

  private shaking = (params: any) => filterEmptyParams(params)

  private prune(url: string) {
    return url.endsWith('/') ? url.slice(0, -1) : url
  }

  private commonRequest<T>(
    service: string,
    options: AxiosRequestConfig = {}
  ): Promise<CommonResponse<T>> {
    options.params = this.shaking(options.params)
    return this.instance(service, options).then((response) => {
      const url = response?.config.url
      const data = response.data
      if (data?.code) {
        return data
      }
      return data
    })
  }

  get<T>(
    service: string,
    options: AxiosRequestConfig = {},
    hideErrorToasty?: boolean
  ): Promise<CommonResponse<T>> {
    options.method = 'GET'
    return this.commonRequest(service, options)
  }

  post<T>(
    service: string,
    options: AxiosRequestConfig = {},
    hideErrorToasty?: boolean
  ): Promise<CommonResponse<T>> {
    options.method = 'POST'
    return this.commonRequest(service, options)
  }
}
