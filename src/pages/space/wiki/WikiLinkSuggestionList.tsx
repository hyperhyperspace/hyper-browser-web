import './WikiLinkSuggestionList.css'

import React, {
  forwardRef, useEffect, useImperativeHandle,
  useState,
} from 'react'

export type WikiLinkSuggestionListProps = {
    items: String[],
    command: Function,
}

export default forwardRef((props: WikiLinkSuggestionListProps, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0)

  const selectItem = (index: number) => {
    const item = props.items[index]

    if (item) {
      props.command({ id: item })
    }
  }

  const upHandler = () => {
    setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length)
  }

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % props.items.length)
  }

  const enterHandler = () => {
    selectItem(selectedIndex)
  }

  useEffect(() => setSelectedIndex(0), [props.items])

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: {event: KeyboardEvent}) => {
      if (event.key === 'ArrowUp') {
        upHandler()
        return true
      }

      if (event.key === 'ArrowDown') {
        downHandler()
        return true
      }

      if (event.key === 'Enter') {
        event.stopPropagation()
        enterHandler()
        return true
      }

      return false
    },
  }))

  return (
    <div className="items">
      {props.items.length
        ? props.items.map((item, index) => (
          <button
            className={`item ${index === selectedIndex ? 'is-selected' : ''}`}
            key={index}
            onClick={() => selectItem(index)}
          >
            {item}
          </button>
        ))
        : <div className="item">No result</div>
      }
    </div>
  )
})
