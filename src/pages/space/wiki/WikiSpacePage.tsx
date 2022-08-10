import { useObjectState } from '@hyper-hyper-space/react';
import { Fragment } from 'react';
import { Page } from '@hyper-hyper-space/wiki-collab';
import WikiSpaceBlock from './WikiSpaceBlock';

function WikiSpacePage(props: { page: Page }) {
    const blocksState = useObjectState(props.page?.blocks);

    // todo: buttons adding/removing/editing blocks
    // todo: implement drag+drop using react-beautiful-dnd

    const blockElements = blocksState?.getValue()?.contents().map(block => <WikiSpaceBlock block={block}></WikiSpaceBlock>)

    return <Fragment>{ blockElements }</Fragment>
}

export default WikiSpacePage;