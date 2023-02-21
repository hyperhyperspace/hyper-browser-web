import data from '@emoji-mart/data'
import { Node, mergeAttributes } from '@tiptap/core'
import { ReactRenderer } from '@tiptap/react';
import Suggestion, { SuggestionKeyDownProps } from '@tiptap/suggestion';
import { init } from 'emoji-mart'
import EmojiPicker from './EmojiFinder';
import tippy, { GetReferenceClientRect } from 'tippy.js';

init(data);

export const suggestion = {
  // items: ({ query }: { query: string }) => {
  //   return []
  // },
  char: ':',
  render: () => {
    let component: any
    let popup: any

    return {
      onStart: (props: any) => {
        component = new ReactRenderer(EmojiPicker, {
          props,
          editor: props.editor,
        })

        if (!props.clientRect) {
          return
        }

        popup = tippy('body', {
          getReferenceClientRect: props.clientRect as GetReferenceClientRect,
          appendTo: () => document.body!,
          content: component.element,
          showOnCreate: true,
          interactive: true,
          trigger: 'manual',
          placement: 'bottom-start',
        })
      },

      onUpdate(props: any) {
        console.log('onUpdate', props, component)
        component.updateProps(props)

        if (!props.clientRect) {
          return
        }

        popup[0].setProps({
          getReferenceClientRect: props.clientRect,
        })
      },

      onKeyDown(props: SuggestionKeyDownProps) {
        if (props.event.key === 'Escape') {
          popup[0].hide()

          return true
        }

        return component.ref?.onKeyDown(props)
      },

      onExit() {
        console.log('onExit', component, popup)
        popup[0].destroy()
        component.destroy()
      },
    }
  },
}

// a custom tiptap node that renders an emoji using the emoji-mart `em-emoji` web component
export default Node.create({
  name: 'emoji',

  group: 'inline',
  inline: true,
  atom: true,
  selectable: false,

  addAttributes() {
    return {
      id: {
        default: null,
      },
      skin: {
        default: null,
      },
    }
  },

  addOptions() {
    return {
      suggestion: suggestion,
    }
  },

  parseHTML() {
    return [
      {
        tag: 'em-emoji',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    const attributes = mergeAttributes(HTMLAttributes, {
      // set: 'apple',
      // size: '2em',
    });
    return ['em-emoji', attributes]
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        command: ({ editor, range, props }) => {
          // increase range.to by one when the next node is of type "text"
          // and starts with a space character
          const nodeBefore = editor.view.state.selection.$from.nodeBefore
          const nodeAfter = editor.view.state.selection.$to.nodeAfter
          const overrideSpace = nodeAfter?.text?.startsWith(' ')

          if (overrideSpace) {
            range.to += 1
          }
          
          console.log('command', editor, range, props, nodeBefore, nodeAfter, overrideSpace)

          editor.chain().focus()
          .insertContentAt(range, {
            type: this.name,
            attrs: props,
          })      
          .run()

          window.getSelection()?.collapseToEnd()
        },
        allow: ({ state, range }) => {
          const $from = state.doc.resolve(range.from)
          const type = state.schema.nodes[this.name]
          const allow = !!$from.parent.type.contentMatch.matchType(type)

          return allow
        },
        ...this.options.suggestion,
      }),
    ]
  },
})