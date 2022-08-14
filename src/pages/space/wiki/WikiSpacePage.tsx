import { useObjectState } from '@hyper-hyper-space/react';
import { Block, Page } from '@hyper-hyper-space/wiki-collab';
import WikiSpaceBlock from './WikiSpaceBlock';
import { Box, IconButton } from '@mui/material';
import PostAddIcon from '@mui/icons-material/PostAdd';
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd';
import { MutableArray, MutableSet } from '@hyper-hyper-space/core';

function WikiSpacePage(props: { page: Page }) {
    const pageSetState    = useObjectState<MutableSet<Page>>(props.page.wiki?.pages);
    const blocksListState = useObjectState<MutableArray<Block>>(props.page?.blocks);
    
    // todo: buttons adding/removing/editing blocks
    // todo: implement drag+drop using react-beautiful-dnd

    const onDragEnd = async (result: DropResult) => {
        const from = result.source.index;
        let to = result.destination?.index;
        if (to === undefined) { return }

        props.page.moveBlock(from, to)
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
        <Box>
            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId={props.page.getId()!}>
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
                onClick={props.page?.addBlock.bind(props.page)}
            >
                <PostAddIcon></PostAddIcon>
            </IconButton>
        </Box>
    )
}

export default WikiSpacePage;