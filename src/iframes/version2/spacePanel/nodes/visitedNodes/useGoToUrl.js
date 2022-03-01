import { useCallback, useRef } from "react"
import { axiosInstance as request } from "hooks/use-http"

const findValidUrl = async (urls, { spaces = [], nodeId }) => {
  const cloudUrl = await Promise.any(
    spaces.map(space => {
      return request
        .get(`/api/v1/spaces/${space.id}/rooms`)
        .then(({ data: { results: rooms } }) => {
          return Promise.any(
            rooms.map(room =>
              request
                .get(`/api/v1/spaces/${space.id}/rooms/${room.id}/nodes`)
                .then(({ data: { results: nodes } }) => {
                  const node = nodes.find(({ id }) => id === nodeId)
                  if (!node) {
                    throw new Error("can't find matching node")
                  }
                  const { protocol, host } = window.location
                  return `${protocol}//${host}/spaces/${space.slug}/rooms/${room.slug}/nodes/${node.id}`
                })
            )
          )
        })
    })
  )
    .then(url => url)
    .catch(() => {})

  if (cloudUrl) return cloudUrl

  const agentUrls = urls.filter(url => !/\/\/\w*\.netdata\.cloud\//.test(url))

  if (agentUrls.length) {
    return await Promise.any(
      agentUrls.map(url => {
        let validUrl = /^https?:\/\//.test(url) ? url : `http://${url}`
        validUrl = validUrl.replace(/\/+$/, "")
        return request.get(`${validUrl}/api/v1/info`).then(() => validUrl)
      })
    )
      .then(url => url)
      .catch(() => {})
  }
  return
}

export const visitNode = url => {
  if (!/https?:\/\//.test(url)) url = `http://${url}`

  window.open(url, "_blank")
}

const useGoToUrl = (id, urls, { openList, setSelectedId, spaces } = {}) => {
  const validUrlRef = useRef()

  return useCallback(async () => {
    setSelectedId(id)
    if (!validUrlRef.current) validUrlRef.current = await findValidUrl(urls, { spaces, nodeId: id })

    setSelectedId()
    if (!validUrlRef.current) return openList()

    visitNode(validUrlRef.current)
  }, [urls, spaces])
}

export default useGoToUrl
