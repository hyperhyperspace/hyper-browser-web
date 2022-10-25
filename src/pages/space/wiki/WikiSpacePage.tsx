import { useObjectState } from '@hyper-hyper-space/react';
import { Block, BlockType, Page, WikiSpace } from '@hyper-hyper-space/wiki-collab';
import WikiSpaceBlock from './WikiSpaceBlock';
import { Box, Button, IconButton, Link, ListItemIcon, ListItemText, Menu, MenuItem, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import PostAddIcon from '@mui/icons-material/PostAdd';
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd';
import { CausalArray, Identity, MutationEvent } from '@hyper-hyper-space/core';
import { useOutletContext, useParams } from 'react-router';
import { WikiContext } from './WikiSpaceView';
import React, { useEffect, useRef, useState } from 'react';
import WikiSpaceNavigation from './WikiSpaceNavigation';

function WikiSpacePage(props: {noNavigation: boolean, navigationWidth: string, contentWidth: string}) {
    
    //const pageSetState    = useObjectState<MutableSet<Page>>(props.page.wiki?.pages);
    
    
    // todo: buttons adding/removing/editing blocks
    // todo: implement drag+drop using react-beautiful-dnd

    const { pageName } = useParams();
    const { wiki, nav, spaceContext}     = useOutletContext<WikiContext>();
    const { home } = spaceContext;
    
    //const wikiState = useObjectState<WikiSpace>(wiki, {debounceFreq: 250});
    const wikiTitleState = useObjectState<WikiSpace>(wiki, {filterMutations: (ev: MutationEvent) => ev.emitter === wiki?.title, debounceFreq: 250});
    const pageSetState = useObjectState<WikiSpace>(wiki, {filterMutations: (ev: MutationEvent) => ev.emitter === wiki?.pages, debounceFreq: 250});

    const [page, setPage] = useState<Page>();
    const [pageIsSaved, setPageIsSaved] = useState<boolean>();

    const blocksListState = useObjectState<CausalArray<Block>>(page?.blocks, {debounceFreq: 250});

    // remove debouncing after loading:

    useEffect(() => {
        const size = blocksListState?.getValue()?.size();
        if (size !== undefined && size > 0 && blocksListState?.getDebounceFreq() !== undefined) {
            blocksListState?.setDebounceFreq(undefined);
        }
    }, [blocksListState]);

    useEffect(() => {

        if (pageName !== undefined && pageSetState?.getValue() !== undefined) {
            const updateCurrentPage = async () => {

                console.log('PAGE IS "' + pageName + '"')

                if (page?.name !== pageName || !pageIsSaved) {
                    const existingPage = pageSetState?.getValue()?.getPage(pageName);
                    if (existingPage !== undefined) {
                        setPage(existingPage);
                        setPageIsSaved(true);
                        console.log('NAVIGATING TO EXISTING PAGE "' + pageName + '"')
                    } else if (page === undefined || page?.name !== pageName){
                        setPage(pageSetState?.getValue()?.createPage(pageName));
                        setPageIsSaved(false);
                        console.log('NAVIGATING TO NEW PAGE "' + pageName + '"')
                    } else {
                        console.log('NOT NAVIGATING 1')
                    }
                } else {
                    if (!pageIsSaved && pageSetState?.getValue()?.hasPage(pageName)) {
                        await page?.save();
                        const foundPage = pageSetState?.getValue()?.getPage(pageName);
                        if (page !== undefined) {
                            setPage(page);
                            setPageIsSaved(true);
                            console.log('FOUND PAGE "' + page + '", USING SAVED VERSION INSTEAD')
                        } else {
                            console.log('NOT NAVIGATING 2')
                        }
                    } else {
                        console.log('NOT NAVIGATING 3')
                    }
                }
            }

            updateCurrentPage();
        }
    }, [pageName, page, pageSetState]);

    const onDragEnd = async (result: DropResult) => {
        const from = result.source.index;
        let to = result.destination?.index;
        if (to === undefined) { return }

        page?.moveBlock(from, to)
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

        page?.addBlock(idx, undefined, (home?.getAuthor() as Identity)!);
    }

    const addImageBlock = (dataUrl: string, idx?: number) => {
        console.log('CALLED ADD IMAGE BLOCK')
        page?.addBlock(idx, BlockType.Image).then(async (b: Block) => {
            console.log('SET IMAGE VALUE TO ', dataUrl)
            await b.contents?.setValue(dataUrl);
            await b.contents?.save();
        });
    }

    const blockElements = blocksListState?.getValue()?.contents().map((block, index) => 
        (
            <Draggable draggableId={block.hash()} index={index} key={block.hash()}>
                {(provided) =>  <div
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    ref={provided.innerRef}
                                >
                                    <WikiSpaceBlock
                                        block={block} {...{startedEditing, stoppedEditing}}
                                        idx={index} showAddBlockMenu={showAddBlockMenu}
                                        removeBlock={() => page?.removeBlock(block)}
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

<div style={{ padding: '90px 1rem', height: '100%', display: 'flex', justifyContent: 'center' }}>
                        <Stack direction="row" style={{height: '100%', width: '100%'}} spacing='0.1rem' sx={{maxWidth: 'lg'}}>
                {(!props.noNavigation || pageName === undefined) &&
                    <WikiSpaceNavigation width={props.navigationWidth} />  
                }
                {(!props.noNavigation || pageName !== undefined) && 
                    <Box style={{width: props.contentWidth, height: '100%'}}>
                        
                        
                {page === undefined &&
                    <Typography>Loading...</Typography>
                }



                {page !== undefined &&
                    <Box>
                    {props.noNavigation && 
                    <Stack direction="row" style={{paddingBottom:'.75rem', justifyContent: 'space-between', alignItems: 'center', width: '100%'}}>
                        <Stack direction="row" spacing="3px" style={{alignItems: 'center'}}>
                            <a onClick={nav.goToIndex} style={{cursor:'pointer', paddingTop: '6px', paddingRight: '3px'}}><img src="icons/streamlinehq-arrow-thick-left-arrows-diagrams-48x48.png" style={{width:'24px', height:'24px', margin:'1px', padding: '2px'}}></img></a>
                            <Button size="small" style={{textTransform:'none', textAlign: 'left'}} variant="text" onClick={nav.goToIndex}><Typography> Index</Typography></Button>
                        </Stack>
                        <Typography variant='h5'>{pageName || ''}</Typography>
                        <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>
                    </Stack>
                    }
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
                            <Typography>This looks empty.</Typography>
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
                </Box>
                }
                    </Box>
                }

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
            </div>

        
    )
}

export default WikiSpacePage;