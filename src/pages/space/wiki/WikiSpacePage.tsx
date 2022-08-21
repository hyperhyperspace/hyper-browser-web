import { useObjectState } from '@hyper-hyper-space/react';
import { Block, BlockType, Page, WikiSpace } from '@hyper-hyper-space/wiki-collab';
import WikiSpaceBlock from './WikiSpaceBlock';
import { Box, Button, IconButton, Link, ListItemIcon, ListItemText, Menu, MenuItem, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import PostAddIcon from '@mui/icons-material/PostAdd';
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd';
import { MutableArray, MutableSet, MutationEvent } from '@hyper-hyper-space/core';
import { useOutletContext, useParams } from 'react-router';
import { WikiContext } from './WikiSpaceView';
import React, { useEffect, useRef, useState } from 'react';
import WikiSpaceNavigation from './WikiSpaceNavigation';

function WikiSpacePage(props: {noNavigation: boolean, navigationWidth: string, contentWidth: string}) {
    
    //const pageSetState    = useObjectState<MutableSet<Page>>(props.page.wiki?.pages);
    
    
    // todo: buttons adding/removing/editing blocks
    // todo: implement drag+drop using react-beautiful-dnd

    const { pageName } = useParams();
    const { wiki, nav }     = useOutletContext<WikiContext>();
    
    const wikiState = useObjectState<WikiSpace>(wiki);
    const pageSetState = useObjectState<WikiSpace>(wiki, (ev: MutationEvent) => ev.emitter === wikiState?.getValue()?.pages);

    const [page, setPage] = useState<Page>();
    const [pageIsSaved, setPageIsSaved] = useState<boolean>();

    const pageState       = useObjectState<Page>(page);
    const blocksListState = useObjectState<MutableArray<Block>>(pageState?.value?.blocks);

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
                    } else if (page === undefined){
                        setPage(pageSetState?.getValue()?.createPage(pageName));
                        setPageIsSaved(false);
                        console.log('NAVIGATING TO NEW PAGE "' + pageName + '"')
                    }
                } else {
                    if (!pageIsSaved && pageSetState?.getValue()?.hasPage(pageName)) {
                        await page?.save();
                        const foundPage = pageSetState?.getValue()?.getPage(pageName);
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
    }, [pageName, page, pageSetState]);

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
    
    const addTitleBlock = (idx?: number) => {
        page?.addBlock(idx, BlockType.Title);
    }

    const addTextBlock = (idx?: number) => {
        page?.addBlock(idx);
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
                <MenuItem onClick={() => {addTitleBlock(newBlockIdx); setShowAddBlock(false); setAnchorEl(null);}}>
                    <ListItemIcon>
                        <img src="icons/streamlinehq-megaphone-1-interface-essential-48.png" style={{width:'24px', height:'24px', margin:'1px', padding: '2px'}}></img>
                    </ListItemIcon>
                    <ListItemText><Typography variant='body2' >Add a <b>title</b> below</Typography></ListItemText>    
                </MenuItem>
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