import { useObjectState } from '@hyper-hyper-space/react';
import { Block, Page, WikiSpace } from '@hyper-hyper-space/wiki-collab';
import WikiSpaceBlock from './WikiSpaceBlock';
import { Box, IconButton, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import PostAddIcon from '@mui/icons-material/PostAdd';
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd';
import { MutableArray, MutableSet } from '@hyper-hyper-space/core';
import { useOutletContext, useParams } from 'react-router';
import { WikiContext } from './WikiSpaceView';
import { useEffect, useState } from 'react';
import WikiSpaceNavigation from './WikiSpaceNavigation';

function WikiSpacePage() {
    
    //const pageSetState    = useObjectState<MutableSet<Page>>(props.page.wiki?.pages);
    
    
    // todo: buttons adding/removing/editing blocks
    // todo: implement drag+drop using react-beautiful-dnd

    const { pageName } = useParams();
    const { wiki }     = useOutletContext<WikiContext>();
    
    const wikiState = useObjectState<WikiSpace>(wiki);

    const [page, setPage] = useState<Page>();
    const [pageIsSaved, setPageIsSaved] = useState<boolean>();

    const blocksListState = useObjectState<MutableArray<Block>>(page?.blocks);

    const theme = useTheme();
    const fullScreen   = useMediaQuery(theme.breakpoints.down('md'));
    const noSummary    = useMediaQuery(theme.breakpoints.down('sm'));

    const summaryWidth = noSummary? '100%' : (fullScreen? '25%' : '20%');
    const chatWidth    = noSummary? '100%' : (fullScreen? '75%' : '80%');

    useEffect(() => {

        if (pageName !== undefined && wikiState?.getValue() !== undefined) {
            const updateCurrentPage = async () => {

                console.log('PAGE IS "' + pageName + '"')

                if (page === undefined) {
                    const existingPage = wikiState?.getValue()?.getPage(pageName);
                    if (existingPage !== undefined) {
                        setPage(existingPage);
                        setPageIsSaved(true);
                        console.log('NAVIGATING TO EXISTING PAGE "' + pageName + '"')
                    } else {
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
    
    const blockElements = blocksListState?.getValue()?.contents().map((block, index) => 
        (
            <Draggable draggableId={block.hash()} index={index} key={block.hash()}>
                {(provided) => 
                    <div
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        ref={provided.innerRef}
                    >
                            <WikiSpaceBlock block={block} {...{startedEditing, stoppedEditing}} ></WikiSpaceBlock>
                    </div>
                }
            </Draggable>
        )
    )

    return (

<div style={{ padding: '60px 1rem', height: '100%', display: 'flex', justifyContent: 'center' }}>
                        <Stack direction="row" style={{height: '100%', width: '100%'}} spacing='1rem' sx={{maxWidth: 'md'}}>
                {(!noSummary || pageName === undefined) &&
                    <WikiSpaceNavigation width={summaryWidth} />  
                }
                {(!noSummary || pageName !== undefined) && 
                    <Box style={{width: chatWidth, height: '100%'}}>
                        
                        
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
                    <IconButton
                        aria-label="append a new block to the page"
                        onClick={() => {page.addBlock();}}
                    >
                        <PostAddIcon></PostAddIcon>
                    </IconButton>
                </Box>
                }
                    </Box>
                }

            </Stack></div>

        
    )
}

export default WikiSpacePage;