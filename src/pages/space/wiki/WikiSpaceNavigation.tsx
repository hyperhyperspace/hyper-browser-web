import { MutationEvent } from "@hyper-hyper-space/core";
import { useObjectState } from "@hyper-hyper-space/react";
import { Page } from "@hyper-hyper-space/wiki-collab";
import {
  Divider,
  Icon,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import { useEffect, useState } from "react";
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "react-beautiful-dnd";
import { useLocation, useOutletContext, useParams } from "react-router";
import { WikiContext } from "./WikiSpaceView";
import { DragIndicator } from "@mui/icons-material";
import { Add } from "@mui/icons-material";
import "./WikiSpaceNavigation.css";

function NavigationTab(props: {}) {
  return null;
}

function WikiSpaceNavigation(props: { width: string; redirect?: boolean }) {
  const { nav, wiki, spaceContext } = useOutletContext<WikiContext>();
  const { home } = spaceContext;
  const { pageName } = useParams();
  const { pathname } = useLocation();
  const onSettingsPage = pathname.includes("/settings/");
  const onAddPage = pathname.includes("/add-page");

  const wikiState = useObjectState(wiki);
  const pageArrayState = useObjectState(wiki?.pages, { debounceFreq: 250 });

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
    pageArrayState
      ?.getValue()
      ?.canInsert(undefined, 0, spaceContext?.home?.getAuthor())
      .then((canInsert: boolean) => {
        setCanEditPageArray(canInsert);
      });
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
          // <div
          // >
          <>
            <ListItemButton
              //   style={{
              //     textTransform: "none",
              //     textAlign: "left",
              //     minWidth: "unset",
              //   }}
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
              {canEditPageArray && (
                <Icon
                  style={{
                    height: "default",
                    width: "default",
                    marginRight: "0.25rem",
                    overflow: "visible",
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
        <ListItem
        // style={{paddingBottom: '1.5rem', paddingTop: '0px'}}
        >
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
        {/* <ListItem><WikiSpacePermissionsDialog/></ListItem> */}
        <ListItem
        // style={{paddingTop: '1px', paddingBottom: '5px'}}
        >
          <TextField
            placeholder="Filter pages"
            value={filterText}
            // value={pate}
            // onKeyPress={onNavigationUpdate}
            //inputRef={navigationRef}
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
                >
                  {/* <DragIndicator /> */}
                </Icon>
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
                // color: "light-grey",
              }}
            >
              {/* <Add /> */}
            </Icon>
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
