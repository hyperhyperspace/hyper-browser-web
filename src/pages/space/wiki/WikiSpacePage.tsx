import { useObjectState } from '@hyper-hyper-space/react';
import { Block, BlockType, Page, WikiSpace } from '@hyper-hyper-space/wiki-collab';
import WikiSpaceBlock from './WikiSpaceBlock';
import { Box, Button, ListItemIcon, ListItemText, Menu, MenuItem, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd';
import { CausalArray, Identity, MutationEvent } from '@hyper-hyper-space/core';
import { useOutletContext, } from 'react-router';
import { WikiContext } from './WikiSpaceView';
import React, { useEffect, useRef, useState } from 'react';
import WikiSpaceEditablePageName from './WikiSpaceEditablePageName';

function WikiSpacePage(props: {page: Page}) {
    // const { pageName } = useParams();
    const { page } = props;
    const { wiki, spaceContext} = useOutletContext<WikiContext>();
    const { home } = spaceContext;

    const wikiTitleState = useObjectState<WikiSpace>(wiki, {filterMutations: (ev: MutationEvent) => ev.emitter === wiki?.title, debounceFreq: 250});

    // we need to maintain a map of all the pages with a given page name

    const [focusOnBlockWithHash, setfocusOnBlockWithHash] = useState<string>();

    const blocksListState = useObjectState<CausalArray<Block>>(page?.blocks, {debounceFreq: 50});

    // check if blocks are draggable
    const wikiWriteFlags = useObjectState(wiki?.permissionLogic?.writeConfig, {debounceFreq: 250})
    const wikiMembers = useObjectState(wiki?.permissionLogic?.members, {debounceFreq: 250})
    const [editable, setEditable] = useState<boolean>(false)

    useEffect(() => {
        let cancel = false
        page?.canUpdate(home?.getAuthor())?.then( canUpdate => {
            if (cancel) return;
            setEditable(canUpdate)
        })
        return () => { cancel = true }
    }, [wikiWriteFlags, wikiMembers, page, home])
    
    // remove debouncing after loading:

    useEffect(() => {
        const size = blocksListState?.getValue()?.size();
        if (size !== undefined && size > 0 && blocksListState?.getDebounceFreq() !== undefined) {
            blocksListState?.setDebounceFreq(undefined);
        }
    }, [blocksListState]);

    const onDragEnd = async (result: DropResult) => {
        const from = result.source.index;
        let to = result.destination?.index;
        if (to === undefined) { return }

        page?.moveBlock(from, to, home?.getAuthor()!)
    }


    const startedEditing = () => {
        console.log('editing... pause watching for blocks updates')
        blocksListState?.getValue()?.dontWatchForChanges();
        blocksListState?.setDebounceFreq(undefined);
    }

    const stoppedEditing = () => {
        console.log('continue watching for blocks updates');
        blocksListState?.setDebounceFreq(250);
        blocksListState?.getValue()?.loadAndWatchForChanges();
    }
    
    const addTextBlock = (idx?: number) => {
        console.log('adding text block with author:', home?.getAuthor(), '...')
        console.log('hasKeyPair()=', home?.getAuthor()?.hasKeyPair(), '...')

        console.log('before adding block ' + Date.now());
        const newBlock = page?.addBlockNoSave(idx, undefined, (home?.getAuthor() as Identity)!);
        console.log('after adding block ' + Date.now());
        newBlock?.then(block => {
            console.log('before set focus ' + Date.now());
            setfocusOnBlockWithHash(block?.getLastHash())
            console.log('after set focus ' + Date.now());
        }).then(() => {
            console.log('before save ' + Date.now());
            page?.blocks?.saveQueuedOps().then(() => {
                console.log('after save ' + Date.now());
            })
        })
    }

    const addImageBlock = (dataUrl: string, idx?: number) => {
        console.log('CALLED ADD IMAGE BLOCK')
        page?.addBlock(idx, BlockType.Image, home?.getAuthor() as Identity).then(async (b: Block) => {
            console.log('SET IMAGE VALUE TO ', dataUrl)
            await b.setValue(dataUrl, home?.getAuthor() as Identity);
            await b.save();
        });
    }

    const focusOnAdjacentBlock = 
    // useCallback(
        (thisBlock: Block, distance=1) => {
        const adjacent = blocksListState?.value?.lookup(blocksListState?.value?.indexOf(thisBlock) + distance)
        setfocusOnBlockWithHash(adjacent?.getLastHash())
    }
    
    const addBlockAfter = (thisBlock: Block) => {
        return addTextBlock(blocksListState?.value?.indexOf(thisBlock)! + 1);
    };

    const blockElements = blocksListState?.getValue()?.contents().map((block, index) => 
        (
            <Draggable isDragDisabled={!editable} draggableId={block.getLastHash()} index={index} key={block.getLastHash()}>
                {(provided) =>  <div
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    ref={provided.innerRef}
                                >
                                    <WikiSpaceBlock
                                        block={block} {...{startedEditing, stoppedEditing}}
                                        idx={index} showAddBlockMenu={showAddBlockMenu}
                                        removeBlock={() => page?.removeBlock(block, home?.getAuthor())}
                                        focusOnBlockWithHash={focusOnBlockWithHash}
                                        addBlockAfter={addBlockAfter}
                                        focusOnAdjacentBlock={focusOnAdjacentBlock}
                                    ></WikiSpaceBlock>
                                </div>
                    
                }
            </Draggable>
        )
    )

    const [anchorEl, setAnchorEl]         = useState<HTMLElement|null>(null);
    const [newBlockIdx, setNewBlockIdx]   = useState<number|undefined>();
    const [showAddBlock, setShowAddBlock] = useState(false);

    const showAddBlockMenu = (newAnchorEl: HTMLElement, newBlockIdx?: number) => {
        setAnchorEl(newAnchorEl);
        setNewBlockIdx(newBlockIdx);
        setShowAddBlock(true);
    };

    const handleAddBlock = (event: React.MouseEvent<HTMLButtonElement>) => {
        showAddBlockMenu(event.currentTarget);
    };

    // image upload
    const newImageInputRef = useRef<HTMLInputElement>(null);

    const onNewPicture: React.ChangeEventHandler<HTMLInputElement> = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files !== null) {
            console.log('got a file:')
            console.log(e.target.files[0]);

            const fileReader = new FileReader();

            fileReader.onload = () => {

                const dataUrl = fileReader.result?.toString();

                if (dataUrl !== undefined) {
                    addImageBlock(dataUrl, newBlockIdx);
                }
            };

            fileReader.readAsDataURL(e.target.files[0]);
        }
    }

    return (

<>
{/* <div style={{ padding: '90px 1rem', height: '100%', width: '100%', display: 'flex', justifyContent: 'center' }}> */}
        <Stack direction="row" style={{height: '100%', minWidth: '100%'}} spacing='0.1rem' width="100%">
            <Box style={{minWidth: '100%', height: '100%'}} width="100%">
                        
                <WikiSpaceEditablePageName/>
                {page === undefined &&
                    <Typography>Loading...</Typography>
                }

                {page !== undefined &&
                    <Box>
                    <DragDropContext onDragEnd={onDragEnd}>
                        <Droppable droppableId={page.getId()!}>
                            { provided =>
                                <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                >
                                    {blockElements}
                                    {provided.placeholder}
                                </div>
                            }
                        </Droppable>
                    </DragDropContext>
                    {!blocksListState?.getValue()?.contents().length && wikiTitleState?.getValue()?.title?.getValue() !== undefined &&
                        <Stack direction='row' spacing={3} style={{alignItems: 'baseline'}}>
                            <Typography>This page looks empty.</Typography>
                            <Button aria-label="add something to the page" variant="contained" onClick={handleAddBlock}>
                                Add something
                            </Button>
                        </Stack>
                    }
                    {!blocksListState?.getValue()?.contents().length && wikiTitleState?.getValue()?.title?.getValue() === undefined &&
                        <Stack direction='row' spacing={3} style={{alignItems: 'baseline'}}>
                            <Typography>Fetching wiki contents...</Typography>
                        </Stack>
                    }
                </Box>}
                </Box>

            </Stack>
            <input type="file" id="pictureInput" style={{display: 'none'}} ref={newImageInputRef} accept="image/*" onChange={onNewPicture}/>
            <Menu
                id={'add-block-menu'}
                anchorEl={anchorEl}
                open={showAddBlock}
                onClose={() => {setShowAddBlock(false); setAnchorEl(null);}}
                MenuListProps={{
                'aria-labelledby': 'add a block after this one',
                }}
            >
                <MenuItem onClick={() => {addTextBlock(newBlockIdx); setShowAddBlock(false); setAnchorEl(null);}}>
                    <ListItemIcon>
                        <img src="icons/streamlinehq-common-file-horizontal-text-files-folders-48.png" style={{width:'24px', height:'24px', margin:'1px', padding: '2px'}}></img>
                    </ListItemIcon>
                    <ListItemText><Typography variant='body2' >Add <b>text</b> below</Typography></ListItemText>    
                </MenuItem>
                <MenuItem onClick={() => {setShowAddBlock(false); setAnchorEl(null); newImageInputRef.current?.click();}}>
                    <ListItemIcon>
                        <img src="icons/streamlinehq-picture-sun-images-photography-48.png" style={{width:'24px', height:'24px', margin:'1px', padding: '2px'}}></img>
                    </ListItemIcon>
                    <ListItemText><Typography variant='body2' >Add an <b>image</b> below</Typography></ListItemText>    
                </MenuItem>
            </Menu>
        </>

        
    )
}

export default WikiSpacePage;