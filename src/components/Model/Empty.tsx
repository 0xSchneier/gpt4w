// https://react.docschina.org/docs/portals.html

import * as React from 'react'
import ReactDOM from 'react-dom'
interface EmptyProps {
  children: React.ReactNode
}

export default class EmptyModel extends React.Component<EmptyProps> {
  root: HTMLDivElement
  el: HTMLDivElement

  constructor(props: EmptyProps) {
    super(props)
    this.root = document.querySelector('#modal-root')
    this.el = document.createElement('div')
    this.el.className =
      'fixed z-50 left-0 top-0 w-full h-full bg-black/70 flex justify-center items-center'
  }

  destroy = () => {
    this.root.removeChild(this.el)
  }

  componentDidMount() {
    // After all sub -elements in MODAL are mounted
    // This portal element will be embedded in the DOM tree
    //  onlyOnly when the MODAL is inserted into the DOM tree can render the sub -element.
    this.root.appendChild(this.el)
  }

  componentWillUnmount() {
    this.root.removeChild(this.el)
  }

  render(): React.ReactNode {
    return ReactDOM.createPortal(this.props.children, this.el)
  }
}
