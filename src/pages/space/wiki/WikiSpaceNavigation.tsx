import { useObjectState } from "@hyper-hyper-space/react"
import { Page } from "@hyper-hyper-space/wiki-collab"
import { Button, Link, List, ListItem, TextField, Typography } from "@mui/material"
import { Box } from "@mui/system"
import { useEffect, useState } from "react"
import { useOutletContext } from "react-router"
import { WikiContext } from "./WikiSpaceView"


function WikiSpaceNavigation(props: {width: string}) {

    const {nav, wiki} = useOutletContext<WikiContext>();

    const wikiState = useObjectState(wiki);

    const [filterText, setFilterText] = useState<string>('');

    const onFilterTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.currentTarget.value;
        setFilterText(newValue);
    }

    const filterPage = (p: Page, filterText: string) => (filterText.trim() === '' || (p.name?.toLowerCase()?.indexOf(filterText.trim().toLocaleLowerCase()) as number) >= 0);

    return <Box style={{width: props.width, height: '100%'}}>
                        

                        
                    <List style={{width: '100%'}} dense>
                    <ListItem style={{paddingBottom: '1.5rem'}}>
                        <Typography variant="h4">
                            {wiki.title?.getValue() || 'Wiki name here'}
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
                        InputProps={{}/*{
                            style:{},
                            endAdornment:
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={navigate}
                                        aria-label="navigate to wiki page"
                                    ><ExploreIcon></ExploreIcon></IconButton>
                                </InputAdornment>
                        }*/}
                    ></TextField>
                    </ListItem>
                        {Array.from(wikiState?.getValue()?.getAllowedPages()||[]).filter((p: Page) => filterPage(p, filterText)).map((p: Page) => {
                            return <ListItem style={{paddingTop: '1px', paddingBottom: '1px'}}><Button size="small" style={{textTransform:'none'}} variant="text" onClick={() => nav.goToPage(p.name as string)}><Typography>{p.name}</Typography></Button></ListItem>
                        })}
                        <ListItem style={{paddingTop: '3px', paddingBottom: '1px'}}><Button size="small" style={{textTransform:'none'}} variant="text" onClick={nav.goToAddPage}><Typography>Add page +</Typography></Button></ListItem>
                        {/*<ListItem style={{justifyContent: 'center'}}><Button onClick={nav.goToAddPage}>Add page</Button></ListItem>*/}
                    </List>
                    </Box>
}

export default WikiSpaceNavigation;