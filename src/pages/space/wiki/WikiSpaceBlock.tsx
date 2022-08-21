import './WikiSpaceBlock.scss'
import { useObjectState } from '@hyper-hyper-space/react';
import { Fragment, useEffect, useRef, useState } from 'react';
import { Add, DragIndicator, PlusOne } from '@mui/icons-material';
import { Block, BlockType } from '@hyper-hyper-space/wiki-collab';

import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Placeholder from '@tiptap/extension-placeholder'
import { EditorContent, useEditor } from '@tiptap/react'
import { MutableReference } from '@hyper-hyper-space/core';
import { debounce } from 'lodash-es';
import { Icon, Tooltip } from '@mui/material';
import { useOutletContext } from 'react-router';
import { WikiContext } from './WikiSpaceView';
import { Box } from '@mui/system';
import BlockStyleBar from './BlockToolbar';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { lowlight } from 'lowlight/lib/all.js'

function WikiSpaceBlock(props: { block: Block, startedEditing?: any, stoppedEditing?: any, idx: number, showAddBlockMenu: (newAnchorEl: HTMLElement, newBlockIdx?: number) => void}) {
    const { spaceContext } = useOutletContext<WikiContext>();
    const resources = spaceContext.resources;
    const blockState = useObjectState(props.block);
    const textState = useObjectState(props.block?.contents);


    // console.log('instantiating block editor component') // this is happening *a lot* sometimes when focusing the editor ...

    // since this obejct is being sync'd, the following should happen automatically:
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
            StarterKit,
            Highlight,
            TextAlign,
            Underline,
            Link,
            CodeBlockLowlight.configure({lowlight}),
            Placeholder.configure({ placeholder: 'Write something...' })
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
        onBlur: props.stoppedEditing
    })

    editor?.on('focus', () => {
        console.log('focusing editor')
        props.startedEditing!(editor)
    })

    useEffect(() => {
        const newText = textState?.getValue()?.getValue();

        if (!newText) {
           return
        }

        if (newText !== editor?.getHTML()) {
            editor?.commands.setContent(newText, false, { preserveWhitespace: 'full' })
        }
    }, [textState, editor])//, editor, blockState])

    const handleAddBlock = (event: React.MouseEvent<HTMLButtonElement>) => {
        props.showAddBlockMenu(event.currentTarget, props.idx + 1);
    };

    const blockContentView =
                    <Fragment>                    
                        <Box className='wiki-block'>
                            <Tooltip title="Click to add a block below">
                                <Icon onClick={handleAddBlock} style={{cursor: 'default', height: 'default', width: 'default', overflow: 'visible'}}>
                                    <Add></Add>
                                </Icon>
                            </Tooltip>
                            
                            <Icon style={{height: 'default', width: 'default', marginRight: '0.25rem', overflow: 'visible'}}>
                                <DragIndicator></DragIndicator>
                            </Icon>
                            
                            <div>
                                {editor?.isEditable && <BlockStyleBar editor={editor}></BlockStyleBar>}
                                {props.block?.type === BlockType.Title && <EditorContent style={{fontSize: '2rem'}} editor={editor} />}
                                {props.block?.type === BlockType.Text  && <EditorContent editor={editor} />}
                                {props.block?.type === BlockType.Image && <img style={{width: '100%'}} src={blockState?.getValue()?.contents?.getValue()} />}
                            </div>                            
                            
                        </Box>
                        
                    </Fragment>

    return blockContentView 
}

export default WikiSpaceBlock;