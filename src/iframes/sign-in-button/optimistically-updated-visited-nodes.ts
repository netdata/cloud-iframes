import { VisitedNodes } from "utils/types"

const optimisticallyUpdatedVisitedNodes = (
  visitedNodes: VisitedNodes,
  id: string,
  agentUrl: string,
  name: string
) => {
  const visitedNode = visitedNodes.find(node => node.id === id)
  const rest = visitedNodes.filter(node => node.id !== id)

  if (!visitedNode)
    return [
      {
        accessCount: 1,
        id,
        lastAccessTime: new Date().toISOString(),
        urls: [agentUrl],
        name,
      },
      ...rest,
    ]

  return [
    {
      ...visitedNode,
      accessCount: visitedNode.accessCount + 1,
      lastAccessTime: new Date().toISOString(),
      name,
    },
    ...rest,
  ]
}

export default optimisticallyUpdatedVisitedNodes
