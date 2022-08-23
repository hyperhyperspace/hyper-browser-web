import type { Editor } from '@tiptap/core'
import { Button, ButtonGroup } from '@mui/material'
import CodeIcon from '@mui/icons-material/Code';
import HighlightIcon from '@mui/icons-material/Highlight';
import LinkIcon from '@mui/icons-material/Link';


const BlockStyleBar = ({ editor }: { editor: Editor }) => {
    if (!editor) {
        return null
    }

    return (
        <ButtonGroup
            aria-label="text formatting"
        >
        <Button
            onClick={() => {
                const baseLocation = window.location.hash.substring(1)?.split('/').slice(0,4).join('/')
                const pageName = editor.state.doc.textBetween(editor.view.state.selection.from, editor.view.state.selection.to)
                console.log('linking', baseLocation, pageName)
                editor.chain().focus().toggleLink({
                    href: `#${baseLocation}/${pageName}`,
                    target: '_self'
                }).run()}
            }
            variant={editor.isActive('link') ? 'contained' : 'outlined'}
            aria-label="bold">
          <LinkIcon/>
        </Button>
        <Button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            variant={editor.isActive('heading', { level: 1 }) ? 'contained' : 'outlined'}
            aria-label="bold">
          h1
        </Button>
        <Button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            variant={editor.isActive('heading', { level: 2 }) ? 'contained' : 'outlined'}
            aria-label="bold">
          h2
        </Button>
        <Button
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            variant={editor.isActive('heading', { level: 3 }) ? 'contained' : 'outlined'}
            aria-label="bold">
          h3
        </Button>
        {/* <Button
            onClick={() => editor.chain().focus().setParagraph().run()} 
            variant={editor.isActive('paragraph') ? 'contained' : 'outlined'}
            aria-label="paragraph">
            p
        </Button> */}
        <Button
            onClick={() => editor.chain().focus().toggleBold().run()} 
            variant={editor.isActive('bold') ? 'contained' : 'outlined'}
            aria-label="bold">
            <b style={{fontWeight: 'bolder'}}>b</b>
        </Button>
        <Button
            onClick={() => editor.chain().focus().toggleItalic().run()} 
            variant={editor.isActive('italic') ? 'contained' : 'outlined'}
            aria-label="italic">
            <i>i</i>
        </Button>
        <Button
            onClick={() => editor.chain().focus().toggleUnderline().run()} 
            variant={editor.isActive('underline') ? 'contained' : 'outlined'}
            aria-label="underline">
            <u>u</u>
        </Button>
        <Button
            onClick={() => editor.chain().focus().toggleStrike().run()} 
            variant={editor.isActive('strike') ? 'contained' : 'outlined'}
            aria-label="strikethrough selection">
            <s>s</s>
        </Button>
        <Button
            onClick={() => editor.chain().focus().toggleHighlight().run()} 
            variant={editor.isActive('highlight') ? 'contained' : 'outlined'}
            aria-label="highlight selection">
            {!editor.isActive('highlight') && <span style={{backgroundColor: 'yellow', padding: '0px 2px'}}>h</span>}{editor.isActive('highlight') && <span style={{padding: '0px 2px'}}>h</span>}{/*<HighlightIcon/>*/}
        </Button>
        <Button
            onClick={() => editor.chain().focus().toggleCodeBlock().run()} 
            variant={editor.isActive('codeBlock') ? 'contained' : 'outlined'}
            aria-label="code block">
            <CodeIcon/>
        </Button>
      </ButtonGroup>
  
    )
}

export default BlockStyleBar