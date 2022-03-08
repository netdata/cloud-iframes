import React from "react"
import { render } from "@testing-library/react"
import { App } from "./App"

test("does not crash", () => {
  render(<App />)
})
