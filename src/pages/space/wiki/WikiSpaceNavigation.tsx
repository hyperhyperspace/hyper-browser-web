import { MutationEvent } from "@hyper-hyper-space/core"
import { useObjectState } from "@hyper-hyper-space/react"
import { Page } from "@hyper-hyper-space/wiki-collab"
import { Button, InputAdornment, Link, List, ListItem, TextField, Typography } from "@mui/material"
import { Box } from "@mui/system"
import { useEffect, useState } from "react"
import { useOutletContext, useParams } from "react-router"
import { WikiContext } from "./WikiSpaceView"


function WikiSpaceNavigation(props: {width: string, redirect?: boolean}) {

    const {nav, wiki} = useOutletContext<WikiContext>();

    const { pageName } = useParams();

    const wikiState = useObjectState(wiki);
    const pageSetState = useObjectState(wiki, {filterMutations: (ev: MutationEvent) => ev.emitter === wiki?.pages, debounceFreq: 250});


    const [filterText, setFilterText] = useState<string>('');

    const onFilterTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.currentTarget.value;
        setFilterText(newValue);
    }

    const filterPage = (p: Page, filterText: string) => (filterText.trim() === '' || (p.name?.toLowerCase()?.indexOf(filterText.trim().toLocaleLowerCase()) as number) >= 0);

    useEffect(() => {
        if (props.redirect) {
            if (pageSetState?.getValue()?.pages?.size() || 0 > 0) {
                nav.goToPage(pageSetState?.getValue()?.pages?.values().next().value.name);
            }
        }
    }, [pageSetState]);

    const currentPageStyle = {padding: '4px 5px', fontWeight: 'bold'}
    return <Box style={{width: props.width, height: '100%'}}>
                        

                        
                    <List style={{width: '100%', paddingTop: '0px'}} dense>
                    <ListItem style={{paddingBottom: '1.5rem', paddingTop: '0px'}}>
                        <Typography variant="h5" style={{color: (wikiState?.getValue()?.title?.getValue() === undefined? 'gray' : 'unset')}}>
                            {wikiState?.getValue()?.title?.getValue() || 'Fetching title...'}
                        </Typography>
                    </ListItem>
                    <ListItem style={{paddingTop: '1px', paddingBottom: '5px'}}>
                    <TextField
                        placeholder='Filter pages'
                        value={filterText}
                        // value={pate}
                        // onKeyPress={onNavigationUpdate}
                        //inputRef={navigationRef}
                        onChange={onFilterTextChange}
                        size='small'
                        InputProps={{
                            autoComplete: 'off',
                            style:{},
                            endAdornment:
                                <InputAdornment position="end">
                                    <img src="icons/streamline-icon-search@48x48.png" style={{width:'24px', height:'24px', margin:'1px', padding: '2px'}}></img>
                                    {/*<IconButton
                                        onClick={navigate}
                                        aria-label="navigate to wiki page"
                                    ><ExploreIcon></ExploreIcon></IconButton>*/}
                                </InputAdornment>
                        }}
                    ></TextField>
                    </ListItem>
                        {Array.from((wikiState?.getValue()?.getAllowedPages() || [])).filter((p: Page) => filterPage(p, filterText)).map((p: Page) => {
                            return <ListItem key={'navigation-for-' + p.getLastHash()} style={{paddingTop: '0px', paddingBottom: '0px'}}>
                                        {pageName !== p.name && <Button size="small" style={{textTransform:'none', textAlign: 'left', minWidth: 'unset'}} variant="text" onClick={() => nav.goToPage(p.name as string)}>
                                            <Typography>{p.name}</Typography>
                                        </Button>}
                                        {pageName === p.name && <Typography style={currentPageStyle}><b>{p.name}</b></Typography>}
                                   </ListItem>
                        })}
                        {!Array.from(wikiState?.getValue()?.getAllowedPages()!).map(p => p.name).includes(pageName)
                            && <ListItem><Typography style={{textDecoration: "underline dotted", ...currentPageStyle}}>{pageName}</Typography></ListItem>}
                        <ListItem style={{paddingTop: '3px', paddingBottom: '1px'}}><Button size="small" style={{textTransform:'none', textAlign: 'left'}} variant="text" onClick={nav.goToAddPage}><Typography>Add page +</Typography></Button></ListItem>
                        {/*<ListItem style={{justifyContent: 'center'}}><Button onClick={nav.goToAddPage}>Add page</Button></ListItem>*/}
                    </List>
                    </Box>
}

export default WikiSpaceNavigation;