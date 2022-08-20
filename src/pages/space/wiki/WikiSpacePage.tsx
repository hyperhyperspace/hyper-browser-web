import { useObjectState } from '@hyper-hyper-space/react';
import { Block, Page, WikiSpace } from '@hyper-hyper-space/wiki-collab';
import WikiSpaceBlock from './WikiSpaceBlock';
import { Box, Button, IconButton, Link, ListItemIcon, ListItemText, Menu, MenuItem, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import PostAddIcon from '@mui/icons-material/PostAdd';
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd';
import { MutableArray, MutableSet } from '@hyper-hyper-space/core';
import { useOutletContext, useParams } from 'react-router';
import { WikiContext } from './WikiSpaceView';
import React, { useEffect, useState } from 'react';
import WikiSpaceNavigation from './WikiSpaceNavigation';

function WikiSpacePage(props: {noNavigation: boolean, navigationWidth: string, contentWidth: string}) {
    
    //const pageSetState    = useObjectState<MutableSet<Page>>(props.page.wiki?.pages);
    
    
    // todo: buttons adding/removing/editing blocks
    // todo: implement drag+drop using react-beautiful-dnd

    const { pageName } = useParams();
    const { wiki, nav }     = useOutletContext<WikiContext>();
    
    const wikiState = useObjectState<WikiSpace>(wiki);

    const [page, setPage] = useState<Page>();
    const [pageIsSaved, setPageIsSaved] = useState<boolean>();

    const pageState       = useObjectState<Page>(page);
    const blocksListState = useObjectState<MutableArray<Block>>(pageState?.value?.blocks);

    useEffect(() => {

        if (pageName !== undefined && wikiState?.getValue() !== undefined) {
            const updateCurrentPage = async () => {

                console.log('PAGE IS "' + pageName + '"')

                if (page?.name !== pageName || !pageIsSaved) {
                    const existingPage = wikiState?.getValue()?.getPage(pageName);
                    if (existingPage !== undefined) {
                        setPage(existingPage);
                        setPageIsSaved(true);
                        console.log('NAVIGATING TO EXISTING PAGE "' + pageName + '"')
                    } else if (page === undefined){
                        setPage(wikiState?.getValue()?.createPage(pageName));
                        setPageIsSaved(false);
                        console.log('NAVIGATING TO NEW PAGE "' + pageName + '"')
                    }
                } else {
                    if (!pageIsSaved && wikiState?.getValue()?.hasPage(pageName)) {
                        await page?.save();
                        const foundPage = wikiState?.getValue()?.getPage(pageName);
                        if (page !== undefined) {
                            setPage(page);
                            setPageIsSaved(true);
                            console.log('FOUND PAGE "' + page + '", USING SAVED VERSION INSTEAD')
                        }
                    }
                }
            }

            updateCurrentPage();
        }
    }, [pageName, page, wikiState]);

    const onDragEnd = async (result: DropResult) => {
        const from = result.source.index;
        let to = result.destination?.index;
        if (to === undefined) { return }

        page?.moveBlock(from, to)
    }


    const startedEditing = () => {
       console.log('editing... pause watching for blocks updates')
       blocksListState?.getValue()?.dontWatchForChanges() 
    }

    const stoppedEditing = () => {
       console.log('continue watching for blocks updates')
       blocksListState?.getValue()?.loadAndWatchForChanges()
    }
    
    const addTextBlock = (idx?: number) => {
        page?.addBlock(idx);
    }

    const blockElements = blocksListState?.getValue()?.contents().map((block, index) => 
        (
            <Draggable draggableId={block.hash()} index={index} key={block.hash()}>
                {(provided) =>  <div
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    ref={provided.innerRef}
                                >
                                    <WikiSpaceBlock block={block} {...{startedEditing, stoppedEditing}} idx={index} showAddBlockMenu={showAddBlockMenu}></WikiSpaceBlock>
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

    return (

<div style={{ padding: '90px 1rem', height: '100%', display: 'flex', justifyContent: 'center' }}>
                        <Stack direction="row" style={{height: '100%', width: '100%'}} spacing='1rem' sx={{maxWidth: 'lg'}}>
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
                        <Stack direction="row" spacing="3px" style={{paddingBottom:'.75rem'}}>
                            <img src="icons/streamlinehq-arrow-thick-left-arrows-diagrams-48x48.png" style={{width:'24px', height:'24px', margin:'1px', padding: '2px'}}></img>
                            <Button size="small" style={{textTransform:'none', textAlign: 'left'}} variant="text" onClick={nav.goToIndex}><Typography>All pages ({wiki.pages?.size() || 0})</Typography></Button>
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
                    {!blocksListState?.getValue()?.contents().length &&
                        <IconButton
                            aria-label="append a new block to the page"
                            onClick={handleAddBlock}
                        >
                            <PostAddIcon></PostAddIcon>
                        </IconButton>
                    }
                </Box>
                }
                    </Box>
                }

            </Stack>
            <Menu
                id={'add-block-menu'}
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
                <MenuItem onClick={() => {addTextBlock(newBlockIdx); setShowAddBlock(false); setAnchorEl(null);}}>
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
            </div>

        
    )
}

export default WikiSpacePage;