import './WikiSpaceBlock.scss'
import { useObjectState } from '@hyper-hyper-space/react';
import { Fragment, useEffect, useRef, useState } from 'react';
import { Add, DragIndicator, PlusOne } from '@mui/icons-material';
import { Block, BlockType } from '@hyper-hyper-space/wiki-collab';

import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Bold from '@tiptap/extension-bold';
import Heading from '@tiptap/extension-heading';
import Italic from '@tiptap/extension-italic';
import Strike from '@tiptap/extension-strike';
import Placeholder from '@tiptap/extension-placeholder'
import BlockStyleBar from './BlockToolbar';
import Highlight from '@tiptap/extension-highlight'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import History from '@tiptap/extension-history';
import { lowlight } from 'lowlight/lib/all.js'
import { EditorContent, useEditor } from '@tiptap/react'
import { MutableReference } from '@hyper-hyper-space/core';
import { debounce } from 'lodash-es';
import { Icon, Tooltip } from '@mui/material';
import { useOutletContext } from 'react-router';
import { WikiContext } from './WikiSpaceView';
import { Box } from '@mui/system';
// other extensions from the tiptap StarterKit:
// import BlockQuote from '@tiptap/extension-blockquote';
// import BulletList from '@tiptap/extension-bullet-list';
// import DropCursor from '@tiptap/extension-dropcursor';
// import HardBreak from '@tiptap/extension-hard-break';
// import HorizontalRule from '@tiptap/extension-horizontal-rule';
// import List from '@tiptap/extension-list-item';
// import OrderedList from '@tiptap/extension-ordered-list';

function WikiSpaceBlock(props: { block: Block, startedEditing?: any, stoppedEditing?: any, idx: number, showAddBlockMenu: (newAnchorEl: HTMLElement, newBlockIdx?: number) => void}) {
    const { spaceContext } = useOutletContext<WikiContext>();
    const resources = spaceContext.resources;
    const blockState = useObjectState(props.block, {debounceFreq: 250});
    const blockContentsState = useObjectState(props.block?.contents, {debounceFreq: 250});

    const [isEditing, setIsEditing] = useState(false);
    const lostFocusTimeout          = useRef<number|undefined>();

    const startedEditing = (editor?: any, event?: any/*FocusEvent*/) => {

        console.log('STARTED EDITING', editor, event)

        if (lostFocusTimeout.current !== undefined) {
            window.clearTimeout(lostFocusTimeout.current);
        }

        lostFocusTimeout.current = window.setTimeout(() => {
            setIsEditing((old: boolean) => {

                if (!old && props.block.type === BlockType.Text) {
                    props.startedEditing(editor);
                    blockState?.setDebounceFreq(undefined);
                    blockContentsState?.setDebounceFreq(undefined);
                }
    
                return true;
            });    
        }, 10);

    }

    const stoppedEditing = () => {

        if (lostFocusTimeout.current !== undefined) {
            window.clearTimeout(lostFocusTimeout.current);
        }

        lostFocusTimeout.current = window.setTimeout(
            () => {
                setIsEditing((old: boolean) => {

                    if (old && props.block.type === BlockType.Text) {
                        props.stoppedEditing();
                    }
        
                    return false;
                });
            }, 500
        );

    }

    // console.log('instantiating block editor component') // this is happening *a lot* sometimes when focusing the editor ...

    // since this obejct is being sync'd, the following should happen automatically:
    /*useEffect(() => {
        blockState?.getValue()?.loadAndWatchForChanges();
        blockContentsState?.getValue()?.loadAndWatchForChanges();
    }, [blockState, blockContentsState])*/

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
    }, 1500))

    const editor = useEditor({
        extensions: [
            Document,
            Paragraph,
            Text,
            Bold,
            Strike,
            Italic,
            Heading,
            History,
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
            console.log('UPDATE')
            console.log(blockContentsState)
            if (blockContentsState && !editor.isDestroyed) {
                updateBlockWithHtml.current(blockContentsState.getValue()!, editor.getHTML())
            }
        },
        editable,
        onBlur: stoppedEditing,
        onFocus: startedEditing
    });

    /*editor?.on('focus', () => {
        console.log('focusing editor')
        startedEditing!(editor)
    });*/

    useEffect(() => {
        const newText = blockContentsState?.getValue()?.getValue();

        if (!newText) {
           return
        }

        if (!editor?.isDestroyed && newText !== editor?.getHTML()) {
            editor?.commands.setContent(newText, false, { preserveWhitespace: 'full' })
        }
    }, [blockContentsState, editor])//, editor, blockState])

    const handleAddBlock = (event: React.MouseEvent<HTMLButtonElement>) => {
        props.showAddBlockMenu(event.currentTarget, props.idx + 1);
    };

    const blockContentView =
                    <Fragment>                    
                        <Box className='wiki-block'>
                            <Tooltip title="Click to add a block below">
                                <Icon onClick={handleAddBlock} style={{cursor: 'pointer', height: 'default', width: 'default', overflow: 'visible'}}>
                                    <Add></Add>
                                </Icon>
                            </Tooltip>
                            
                            <Icon style={{height: 'default', width: 'default', marginRight: '0.25rem', overflow: 'visible'}}>
                                <DragIndicator></DragIndicator>
                            </Icon>
                            
                            <div>
                                {props.block?.type === BlockType.Text  && 
                                    <Fragment>
                                        <EditorContent editor={editor} />
                                        {editor?.isEditable && isEditing && !editor?.state.selection?.empty && <BlockStyleBar editor={editor}></BlockStyleBar>}
                                    </Fragment>
                                }
                                {props.block?.type === BlockType.Image && <img style={{width: '100%'}} src={blockState?.getValue()?.contents?.getValue()} />}
                            </div>                            
                            
                        </Box>
                        
                    </Fragment>

    return blockContentView 
}

export default WikiSpaceBlock;