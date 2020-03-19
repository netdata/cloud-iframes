const cookieSuffix = "expires=Tue, 19 Jan 2038 03:14:07 UTC; path=/"

export const getCookie = (name: string) => {
  // https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie#Example_2_Get_a_sample_cookie_named_test2
  const regex = new RegExp(`(?:(?:^|.*;\\s*)${name}\\s*\\=\\s*([^;]*).*$)|^.*$`)
  const matches = document.cookie.match(regex)
  if (matches === null) {
    return null
  }
  const cookie = matches[1]
  return cookie === undefined ? null : cookie
}

/**
 * @param {string} name
 * @param {string} value
 */
export const setCookie = (name: string, value: string) => {
  document.cookie = `${name}=${value}; ${cookieSuffix}`
}
