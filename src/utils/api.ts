export interface SpacesPayload {
  updatedAt: string
  results: {
    id: string
    slug: string
    name: string
    description: null | string
    iconURL: null | string
    state: string
    createdAt: string
  }[]
}

export interface RoomsPayload {
  updatedAt: string
  results: {
    id: string
    slug: string
    name: string
  }[]
}
