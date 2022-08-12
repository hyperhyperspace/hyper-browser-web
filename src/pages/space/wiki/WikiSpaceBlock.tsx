import './WikiSpaceBlock.scss'
import { useObjectState } from '@hyper-hyper-space/react';
import { useEffect, useRef } from 'react';
import { DragIndicator } from '@mui/icons-material';
import { Block } from '@hyper-hyper-space/wiki-collab';

import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Placeholder from '@tiptap/extension-placeholder'
import { EditorContent, useEditor } from '@tiptap/react'
import { MutableReference } from '@hyper-hyper-space/core';
import { debounce } from 'lodash-es';
import { Card, Icon } from '@mui/material';
import { SpaceContext } from '../SpaceFrame';
import { useOutletContext } from 'react-router';

function WikiSpaceBlock(props: { block: Block, startedEditing?: any, stoppedEditing?: any }) {
    const { resources } = useOutletContext() as SpaceContext
    const blockState = useObjectState(props.block);
    const textState = useObjectState(blockState?.getValue()?.contents);
    
    useEffect(() => {
        blockState?.getValue()?.loadAndWatchForChanges();
        textState?.getValue()?.loadAndWatchForChanges();
    }, [blockState, textState])

    const author = blockState?.getValue()?.getAuthor();
    const editable = author === undefined || author.hasKeyPair();

    // for now just use one tiptap `Editor` per block...
    // later on it might be desirable to use a custom tiptap `Block` type instead
    // and share a single tiptap `Editor`.

    const updateBlockWithHtml = useRef(debounce(async (blockContents: MutableReference<string>, html: string) => {
        await blockContents.setValue(html)
        blockContents.setResources(resources!);
        blockContents.saveQueuedOps();
        console.log('SAVED BLOCK')
    }, 500))

    const editor = useEditor({
        extensions: [
            Document,
            Paragraph,
            Text,
            Placeholder.configure({ placeholder: 'write something...' })
        ],
        parseOptions: {
            preserveWhitespace: 'full'
        },
        onUpdate: async ({ editor }) => {
            if (textState) {
                updateBlockWithHtml.current(textState.getValue()!, editor.getHTML())
            }
        },
        editable,
        onFocus: props.startedEditing,
        onBlur: props.stoppedEditing
    })


    useEffect(() => {
        const newText = textState?.getValue()?.getValue();

        if(!newText) {
           console.log('newText is empty!') 
           return
        }

        if (newText !== editor?.getHTML()) {
            editor?.commands.setContent(newText, false, { preserveWhitespace: 'full' })
        }
    }, [textState, editor])//, editor, blockState])

    const blockContentView = 
                    <Card className='wiki-block'>
                        <Icon>
                            <DragIndicator></DragIndicator>
                        </Icon>
                        <EditorContent editor={editor} />
                    </Card>

    return blockContentView 
}

export default WikiSpaceBlock;