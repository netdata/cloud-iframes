import axios from "axios"
import { act, renderHook } from "@testing-library/react-hooks"
import { useHttp } from "./use-http"

jest.mock("axios")
const mockedAxios = axios as jest.Mocked<typeof axios>

describe("use-http", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("doesnt do anything when shouldMakeCall is false", () => {
    renderHook(() => useHttp("url", false))
    expect(axios.get).toBeCalledTimes(0)
  })

  it("makes api call when shouldMakeCall is not provided", () => {
    renderHook(() => useHttp("url"))
    expect(axios.get).toBeCalledTimes(1)
    expect(axios.get).toHaveBeenCalledWith("url", expect.anything())
  })

  it("doesnt call again after rerender", async () => {
    const url = "url"
    const data1 = { data: { key: "val" } }
    mockedAxios.get.mockResolvedValue(data1)

    const { rerender, result, waitForNextUpdate } = renderHook(() => useHttp(url))
    expect(mockedAxios.get).toBeCalledTimes(1)
    expect(result.current[0]).toEqual(null)

    rerender()
    expect(axios.get).toBeCalledTimes(1)
    await waitForNextUpdate()
    expect(result.current[0]).toEqual(data1.data)
  })

  it("calls again after watched property changes, but doesn't clear data", async () => {
    const url = "url"
    const data1 = { data: { key: "val" } }
    mockedAxios.get.mockResolvedValue(data1)

    const { rerender, result, waitForNextUpdate } = renderHook(
      watchedProperty => useHttp(url, true, watchedProperty),
      { initialProps: 1 }
    )
    expect(mockedAxios.get).toBeCalledTimes(1)
    expect(result.current[0]).toEqual(null)

    rerender(2)
    expect(axios.get).toBeCalledTimes(1) // call is not resolved yet
    await waitForNextUpdate()
    rerender(3)
    expect(axios.get).toBeCalledTimes(2)
    expect(result.current[0]).toEqual(data1.data)
    await waitForNextUpdate()
  })

  it("clear data and fetches again when resetCallback is called", async () => {
    const url = "url"
    const data1 = { data: { key: "val" } }
    mockedAxios.get.mockResolvedValue(data1)

    const { rerender, result, waitForNextUpdate } = renderHook(
      watchedProperty => useHttp(url, true, watchedProperty),
      { initialProps: 1 }
    )
    expect(mockedAxios.get).toBeCalledTimes(1)
    await waitForNextUpdate()
    expect(result.current[0]).toEqual(data1.data)
    act(() => {
      result.current[1]()
    })
    expect(result.current[0]).toEqual(null)
    expect(mockedAxios.get).toBeCalledTimes(2)
    await waitForNextUpdate()
    expect(mockedAxios.get).toBeCalledTimes(2)
  })
})
