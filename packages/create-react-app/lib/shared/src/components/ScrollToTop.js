import React from 'react'
import {Route} from 'react-router-dom'

const ScrollToTop = props => (
  <Route
    {...props}
    children={cxt => {
      if (typeof window !== 'undefined') window.scrollTo(0, 0)
      return typeof props.children === 'function' ? props.children(cxt) : props.children
    }}
  />
)

export default ScrollToTop
