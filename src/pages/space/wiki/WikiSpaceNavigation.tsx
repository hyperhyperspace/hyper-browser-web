import { useObjectState } from "@hyper-hyper-space/react";
import { Page } from "@hyper-hyper-space/wiki-collab";
import {
  Divider,
  Icon,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "react-beautiful-dnd";
import { useLocation, useOutletContext, useParams } from "react-router";
import { WikiContext } from "./WikiSpaceView";
import { Delete, DragIndicator, Remove } from "@mui/icons-material";
import "./WikiSpaceNavigation.css";
import { PageArray } from "@hyper-hyper-space/wiki-collab";

function WikiSpaceNavigation(props: { width: string; redirect?: boolean }) {
  const { nav, wiki, spaceContext } = useOutletContext<WikiContext>();
  const { home } = spaceContext;
  const { pageName } = useParams();
  const { pathname } = useLocation();
  const onSettingsPage = pathname.includes("/settings/");
  const onAddPage = pathname.includes("/add-page");

  const wikiState = useObjectState(wiki);
  const pageArrayState = useObjectState<PageArray>(wiki?.pages, { debounceFreq: 250 });

  const [canEditPageArray, setCanEditPageArray] = useState<boolean>(false);

  const onDragEnd = async (result: DropResult) => {
    const from = result.source.index;
    let to = result.destination?.index;
    if (to === undefined) {
      return;
    }

    wiki.movePage(from, to, home?.getAuthor()!);
  };
  

  useEffect(() => {
    let cancel = false;

    pageArrayState
      ?.getValue()
      ?.canInsert(undefined, 0, spaceContext?.home?.getAuthor())
      .then((canInsert: boolean) => {
        if (cancel) return;
        setCanEditPageArray(canInsert);
      });

      return () => { 
        cancel = true;
      }
  }, [pageArrayState, spaceContext?.home]);

  const [filterText, setFilterText] = useState<string>("");

  const onFilterTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.currentTarget.value;
    setFilterText(newValue);
  };

  const filterPage = (p: Page, filterText: string) =>
    filterText.trim() === "" ||
    (p.name
      ?.toLowerCase()
      ?.indexOf(filterText.trim().toLocaleLowerCase()) as number) >= 0;

  useEffect(() => {
    if (props.redirect) {
      if (pageArrayState?.getValue()?.size() || 0 > 0) {
        nav.goToPage(pageArrayState?.getValue()?.values().next().value.name);
      }
    }
  }, [pageArrayState]);

  const pageTabElements = Array.from(
    wikiState?.getValue()?.getAllowedPages() || []
  )
    .filter((page: Page) => filterPage(page, filterText))
    .map((page: Page, index: any) => (
      <Draggable
        draggableId={page.getLastHash()}
        index={index}
        key={page.getLastHash()}
      >
        {(provided) => (
          <>
            <ListItemButton
              selected={pageName === page.name}
              onClick={() => nav.goToPage(page.name as string)}
              key={"navigation-for-" + page.getLastHash()}
              className={
                canEditPageArray ? "editable-tab page-tab" : "page-tab"
              }
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              ref={provided.innerRef}
            >
              <Stack direction="row" style={{alignItems: 'center', justifyContent: 'space-between', width: '100%'}}>
                <Stack direction="row" style={{alignItems: 'center', justifyContent: 'flex-start'}}>
              {canEditPageArray && (
                <Icon
                  style={{
                    height: "default",
                    width: "default",
                    marginRight: "0.25rem",
                    overflow: "visible",
                    marginTop: "-3px"
                  }}
                >
                  <DragIndicator />
                </Icon>
              )}
              <Typography
                className={page.name === pageName ? "currently-selected" : ""}
              >
                {page.name}
              </Typography>
              </Stack>
              {canEditPageArray && (
                <Tooltip hidden={!canEditPageArray} title="Click to remove this page">
                  <IconButton
                    className="delete-page"
                    onClick={(evt: React.MouseEvent<any>) => {
                      evt.stopPropagation()
                      pageArrayState?.value?.deleteElement(page, home?.getAuthor())
                      pageArrayState?.value?.save()
                      if (page.name === pageName) {
                        nav.goToIndex()
                      }
                    }
                  }
                    style={{
                      cursor: "pointer",
                      height: "default",
                      width: "default",
                      overflow: "visible",
                    }}
                  >
                    <Delete/>
                  </IconButton>
                </Tooltip>
              )}
              </Stack>
            </ListItemButton>
          </>
        )}
      </Draggable>
    ));

  const currentPageStyle = { fontWeight: "bold" };
  return (
    <Paper
      style={{ minWidth: props.width, maxWidth: props.width, height: "100%" }}
    >
      <List style={{ width: "100%", paddingTop: "0px" }} dense>
        <ListItem>
          <Typography
            variant="h5"
            style={{
              color:
                wikiState?.getValue()?.title?.getValue() === undefined
                  ? "gray"
                  : "unset",
            }}
          >
            {wikiState?.getValue()?.title?.getValue() || "Fetching title..."}
          </Typography>
        </ListItem>
        <ListItem>
          <TextField
            placeholder="Filter pages"
            value={filterText}
            onChange={onFilterTextChange}
            size="small"
            InputProps={{
              autoComplete: "off",
              style: {},
              endAdornment: (
                <InputAdornment position="end">
                  <img
                    src="icons/streamline-icon-search@48x48.png"
                    style={{
                      width: "24px",
                      height: "24px",
                      margin: "1px",
                      padding: "2px",
                    }}
                  ></img>
                </InputAdornment>
              ),
            }}
          ></TextField>
        </ListItem>
      </List>
      {/* saved pages */}
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId={wiki.getId()!}>
          {(provided) => (
            <List
              dense
              style={{
                width: "100%",
                paddingTop: "0px",
                margin: "0px",
                padding: "0px",
              }}
            >
              <div ref={provided.innerRef} {...provided.droppableProps}>
                {pageTabElements}
                {provided.placeholder}
              </div>
            </List>
          )}
        </Droppable>
      </DragDropContext>
      <List dense style={{ width: "100%", paddingTop: "0px" }}>
        {/* unsaved pages */}
        {pageName &&
          !Array.from(wikiState?.getValue()?.getAllowedPages()!)
            .map((p) => p.name)
            .includes(pageName) && (
            <ListItemButton
              selected={true}
              className={
                canEditPageArray ? "editable-tab page-tab" : "page-tab"
              }
            >
              {canEditPageArray && (
                <Icon
                  style={{
                    height: "default",
                    width: "default",
                    marginRight: "0.25rem",
                    overflow: "visible",
                    color: "light-grey",
                  }}
                ></Icon>
              )}
              <Typography
                className="currently-selected"
                style={{
                  textDecoration: "underline dotted",
                }}
              >
                {pageName}
              </Typography>
            </ListItemButton>
          )}
        {/* add page */}
        {canEditPageArray && (
          <ListItemButton
            onClick={nav.goToAddPage}
            selected={onAddPage}
            className={canEditPageArray ? "editable-tab page-tab" : "page-tab"}
          >
            <Icon
              style={{
                height: "default",
                width: "default",
                marginRight: "0.25rem",
                overflow: "visible",
              }}
            ></Icon>
            <Typography className={onAddPage ? "currently-selected" : ""}>
              + add page
            </Typography>
          </ListItemButton>
        )}
        <Divider />
        {canEditPageArray && (
          <ListItemButton
            selected={onSettingsPage}
            onClick={nav.goToPermissionSettings}
          >
            <Typography className={onSettingsPage ? "currently-selected" : ""}>
              Settings
            </Typography>
          </ListItemButton>
        )}
      </List>
    </Paper>
  );
}

export default WikiSpaceNavigation;
