import { useObjectState } from '@hyper-hyper-space/react';
import { Page } from '@hyper-hyper-space/wiki-collab';
import WikiSpaceBlock from './WikiSpaceBlock';
import { Box, IconButton } from '@mui/material';
import PostAddIcon from '@mui/icons-material/PostAdd';
import { Resources } from '@hyper-hyper-space/core';

function WikiSpacePage(props: { page: Page, resources: Resources }) {
    const blocksState = useObjectState(props.page?.blocks);

    // todo: buttons adding/removing/editing blocks
    // todo: implement drag+drop using react-beautiful-dnd

    const blockElements = blocksState?.getValue()?.contents().map(block => 
        <WikiSpaceBlock block={block} resources={props.resources}></WikiSpaceBlock>
    )

    return (
        <Box>
            <IconButton onClick={props.page?.addBlock.bind(props.page)}>
                <PostAddIcon></PostAddIcon>
            </IconButton>
            <div>{ blockElements }</div>
        </Box>
    )
}

export default WikiSpacePage;