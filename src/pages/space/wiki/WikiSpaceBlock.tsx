import './WikiSpaceBlock.scss'
import { useObjectState } from '@hyper-hyper-space/react';
import { useCallback, useEffect, useRef } from 'react';
import { Block } from '@hyper-hyper-space/wiki-collab';

import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Placeholder from '@tiptap/extension-placeholder'
import { EditorContent, useEditor } from '@tiptap/react'
import { MutableReference, Resources } from '@hyper-hyper-space/core';
import { debounce } from 'lodash-es';

function WikiSpaceBlock(props: { block: Block, resources: Resources }) {
    const author = props.block.getAuthor();
    const editable = author === undefined || author.hasKeyPair();

    // for now just use one tiptap `Editor` per block...
    // later on it might be desirable to use a custom tiptap `Block` type instead
    // and share a single tiptap `Editor`.

    const updateBlockWithHtml = useRef(debounce(async (blockContents: MutableReference<string>, html: string) => {
        await blockContents.setValue(html)
        blockContents.setResources(props.resources!);                    
        blockContents.saveQueuedOps();
        console.log('SAVED BLOCK')
    }, 500))

    const editor = useEditor({
        extensions: [
            Document,
            Paragraph,
            Text,
            Placeholder.configure({placeholder: 'write something...'})
        ],
        parseOptions: {
            preserveWhitespace: 'full'
        },    
        onUpdate: async ({ editor }) => {
            if (props.block.contents) {
                updateBlockWithHtml.current(props.block.contents, editor.getHTML())
            }
        },
        editable
    })

    const textState = useObjectState(props.block.contents);

    useEffect(() => {
        const newText = textState?.value?._value;

        if (newText !== undefined && newText !== editor?.getHTML()) {
            editor?.commands.setContent(newText, false, { preserveWhitespace: 'full' })
        }
    }, [textState, editor])

    return (
        <EditorContent editor={editor}/>
    )
}

export default WikiSpaceBlock;