export const shake = (params: { [propName: string]: any } | undefined) => {
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
