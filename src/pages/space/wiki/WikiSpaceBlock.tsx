import './WikiSpaceBlock.css'
import { useObjectState } from '@hyper-hyper-space/react';
import { useEffect } from 'react';
import { Block } from '@hyper-hyper-space/wiki-collab';

import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Placeholder from '@tiptap/extension-placeholder'
import { EditorContent, useEditor } from '@tiptap/react'
import { Resources } from '@hyper-hyper-space/core';


function WikiSpaceBlock(props: { block: Block, resources: Resources }) {
    const author = props.block.getAuthor();
    const editable = author === undefined || author.hasKeyPair();

    // for now just use one tiptap `Editor` per block...
    // later on it might be desirable to use a custom tiptap `Block` type instead
    // and share a single tiptap `Editor`.

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
            const content = props.block.contents;

            if (content !== undefined) {
                await content.setValue(editor.getHTML())
                content.setResources(props.resources!);                    
                content.saveQueuedOps();
                console.log('SAVED BLOCK')

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
        <EditorContent editor={editor} />
    )
}

export default WikiSpaceBlock;