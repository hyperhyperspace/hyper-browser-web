import { Emoji } from "@emoji-mart/data";
import React, { forwardRef, KeyboardEvent, useEffect, useImperativeHandle, useState } from "react";

import data from '@emoji-mart/data'
import { init, SearchIndex } from 'emoji-mart'

declare global {
    namespace JSX {
      interface IntrinsicElements {
        ['em-emoji']: any;
      }
    }
  }
  
  
init({ data })

  
async function lookup(value: string) {
  const emojis = await SearchIndex.search(value)
  console.log('found ', emojis, 'for', value)
  return emojis
}

const Picker = forwardRef((props: {query: string, command: Function}, ref) => {
    const {query, command} = props;
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [emojis, setEmojis] = useState<Emoji[]>([])
    console.log('looking for ', query)
    useEffect(() => {
        lookup(query!).then(setEmojis)
    }, [query])

      const upHandler = () => {
        setSelectedIndex((selectedIndex + emojis.length - 1) % emojis.length)
      }

      const downHandler = () => {
        console.log('down handler')
        setSelectedIndex((selectedIndex + 1) % emojis.length)
      }

      const enterHandler = () => {
        const emoji = emojis[selectedIndex]

        if (emoji) {
          props.command(emoji)
        }
      }

      useEffect(() => setSelectedIndex(0), [emojis])

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
            event.preventDefault()
            enterHandler()
            return true
          }

          return false
        },
      }))
    
    return <>
        <div className="emoji-finder">
          {emojis
            ? emojis.map((emoji, index) => (
              <button
                className={`item ${index === selectedIndex ? 'is-selected' : ''}`}
                key={index}
                onClick={() => enterHandler()}
              >
                <em-emoji id={emoji.id} skin={0} size="2em" />
              </button>
            ))
            : <div className="emojis"><i>Type to select an emoji...</i></div>
          }
        </div>
    </>
})
    
export default Picker