// a component that displays all of the pages with a given name

import { useState, useEffect } from 'react';
import { useOutletContext, useParams } from 'react-router';
import { WikiContext } from './WikiSpaceView';
import { Page, PageArray } from '@hyper-hyper-space/wiki-collab';
import { useObjectState } from '@hyper-hyper-space/react';
import { MutationEvent } from '@hyper-hyper-space/core';
import WikiSpacePage from './WikiSpacePage';
import { Stack } from '@mui/material';

function WikiSpacePagesForRoute() {
    const { pageName } = useParams();
    const { wiki } = useOutletContext<WikiContext>();

    const pageArrayState = useObjectState<PageArray>(wiki?.pages, {filterMutations: (ev: MutationEvent) => [...wiki.pages?.values()!].map(page => page.name).includes(ev.emitter), debounceFreq: 50});
    const [pages, setPages] = useState<(Page | undefined)[]>([]);

    useEffect(() => {
        setPages([...pageArrayState?.getValue()?.values()!].filter((p) => p?.name?.getValue() === pageName));
    }, [pageArrayState, pageName]);

    return (
        <Stack style={{width: "100%"}} spacing={2} direction="column">
            {pages.map((p) => <WikiSpacePage page={p!} key={p?.getLastHash()}/>)}
        </Stack>
    );
}

export default WikiSpacePagesForRoute;