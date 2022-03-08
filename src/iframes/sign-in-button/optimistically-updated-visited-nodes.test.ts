import update from "./optimistically-updated-visited-nodes"

const now = new Date().toISOString()
Date.prototype.toISOString = () => now

const getVisitedNode = (nr: string) => ({
  id: nr,
  name: `name-${nr}`,
  urls: [`https://url-${nr}`, `http://url-${nr}`],
  accessCount: 2,
  lastAccessTime: new Date().toISOString(),
})

describe("optimistically updated visited nodes", () => {
  it("adds entry given empty visited nodes", () => {
    expect(update([], "id1", "https://agent.url", "name1")).toEqual([
      {
        accessCount: 1,
        id: "id1",
        lastAccessTime: now,
        urls: ["https://agent.url"],
        name: "name1",
      },
    ])
  })

  it("finds finds visited node and moves it to the beginning", () => {
    expect(
      update(
        [getVisitedNode("a"), getVisitedNode("b"), getVisitedNode("c")],
        "b",
        "https://new-url",
        "new name"
      )
    ).toEqual([
      {
        accessCount: 3,
        id: "b",
        lastAccessTime: now,
        name: "new name",
        urls: ["https://url-b", "http://url-b"],
      },
      {
        accessCount: 2,
        id: "a",
        lastAccessTime: now,
        name: "name-a",
        urls: ["https://url-a", "http://url-a"],
      },
      {
        accessCount: 2,
        id: "c",
        lastAccessTime: now,
        name: "name-c",
        urls: ["https://url-c", "http://url-c"],
      },
    ])
  })
})
