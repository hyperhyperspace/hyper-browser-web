import { mergeAttributes } from '@tiptap/core'
import Link, {LinkOptions} from '@tiptap/extension-link'

export interface WikiLinkOptions extends LinkOptions {
  definedPageNames: string[],
}

const WikiLink = Link.extend<WikiLinkOptions>({
  addOptions() {
    return {
      ...this.parent?.(),
      definedPageNames: [],
    }
  },
  renderHTML({ HTMLAttributes }) {
    const attributes = mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)
    const linkPageName = attributes.href.split('contents/')[1]?.split('/')[0]
    attributes.class = (this.options.definedPageNames?.includes(linkPageName) ? 'existing-page-link' : '' )
    return [
      'a',
      attributes,
      0,
    ]
  }
})

export default WikiLink