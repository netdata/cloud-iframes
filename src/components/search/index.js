import React, { forwardRef } from "react"
import SearchInput from "./searchInput"

const Search = forwardRef(({ value, onChange, ...rest }, ref) => (
  <SearchInput
    inputRef={ref}
    value={value}
    onChange={onChange}
    placeholder="Search"
    metaShrinked
    {...rest}
  />
))

export default Search
