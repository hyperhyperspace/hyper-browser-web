import './WikiSpaceBlock.scss'
import { useObjectState } from '@hyper-hyper-space/react';
import { Fragment, useEffect, useRef, useState } from 'react';
import { Add, DragIndicator, PlusOne } from '@mui/icons-material';
import { Block } from '@hyper-hyper-space/wiki-collab';

import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Placeholder from '@tiptap/extension-placeholder'
import { EditorContent, useEditor } from '@tiptap/react'
import { MutableReference } from '@hyper-hyper-space/core';
import { debounce } from 'lodash-es';
import { Card, Icon, IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Tooltip, Typography } from '@mui/material';
import { SpaceContext } from '../SpaceFrame';
import { useOutletContext } from 'react-router';
import { WikiContext } from './WikiSpaceView';
import { Box } from '@mui/system';

function WikiSpaceBlock(props: { block: Block, startedEditing?: any, stoppedEditing?: any, idx: number, addTextBlock: (idx: number) => void}) {
    const { spaceContext } = useOutletContext<WikiContext>();
    const resources = spaceContext.resources;
    const blockState = useObjectState(props.block);
    const textState = useObjectState(props.block?.contents);
    

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

        if (!newText) {
           console.log('newText is empty!')
           return
        }

        if (newText !== editor?.getHTML()) {
            editor?.commands.setContent(newText, false, { preserveWhitespace: 'full' })
        }
    }, [textState, editor])//, editor, blockState])

    const [anchorEl, setAnchorEl]         = useState<HTMLElement|null>(null);
    const [showAddBlock, setShowAddBlock] = useState(false);
    const handleAddBlock = (event: React.MouseEvent<HTMLButtonElement>) => {
        console.log(event)
        setAnchorEl(event.currentTarget);
        setShowAddBlock(true);
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
                            
                            <EditorContent editor={editor} />
                        </Box>
                        <Menu
                            id={'add-block-after-' + props.block?.getLastHash()}
                            anchorEl={anchorEl}
                            open={showAddBlock}
                            onClose={() => {setShowAddBlock(false); setAnchorEl(null);}}
                            MenuListProps={{
                            'aria-labelledby': 'add a block after this one',
                            }}
                        >
                            <MenuItem onClick={() => {setShowAddBlock(false); setAnchorEl(null); alert('Coming soon!');}}>
                                <ListItemIcon>
                                    <img src="icons/streamlinehq-megaphone-1-interface-essential-48.png" style={{width:'24px', height:'24px', margin:'1px', padding: '2px'}}></img>
                                </ListItemIcon>
                                <ListItemText><Typography variant='body2' >Add <b>title</b> below</Typography></ListItemText>    
                            </MenuItem>
                            <MenuItem onClick={() => {props.addTextBlock(props.idx+1); setShowAddBlock(false); setAnchorEl(null);}}>
                                <ListItemIcon>
                                    <img src="icons/streamlinehq-common-file-horizontal-text-files-folders-48.png" style={{width:'24px', height:'24px', margin:'1px', padding: '2px'}}></img>
                                </ListItemIcon>
                                <ListItemText><Typography variant='body2' >Add <b>text</b> below</Typography></ListItemText>    
                            </MenuItem>
                            <MenuItem onClick={() => {setShowAddBlock(false); setAnchorEl(null); alert('Coming soon!');}}>
                                <ListItemIcon>
                                    <img src="icons/streamlinehq-picture-sun-images-photography-48.png" style={{width:'24px', height:'24px', margin:'1px', padding: '2px'}}></img>
                                </ListItemIcon>
                                <ListItemText><Typography variant='body2' >Add <b>image</b> below</Typography></ListItemText>    
                            </MenuItem>
                        </Menu>
                    </Fragment>

    return blockContentView 
}

export default WikiSpaceBlock;