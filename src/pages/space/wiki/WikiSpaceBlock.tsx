import "./WikiSpaceBlock.css";
import { useObjectState } from "@hyper-hyper-space/react";
import { Fragment, useEffect, useRef, useState } from "react";
import { Add, DragIndicator, Delete } from "@mui/icons-material";
import { Block, BlockType, WikiSpace } from "@hyper-hyper-space/wiki-collab";

import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import Bold from "@tiptap/extension-bold";
import Heading from "@tiptap/extension-heading";
import Italic from "@tiptap/extension-italic";
import Strike from "@tiptap/extension-strike";
import Placeholder from "@tiptap/extension-placeholder";
import BlockStyleBar from "./BlockToolbar";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import WikiLink from "./WikiLink";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import History from "@tiptap/extension-history";
import { suggestion, WikiLinkSuggestion } from "./WikiLinkSuggestion";
import { lowlight } from "lowlight/lib/all.js";
import { EditorContent, useEditor } from "@tiptap/react";
import {
  CausalReference,
  MutationEvent,
} from "@hyper-hyper-space/core";
import { debounce } from "lodash-es";
import { Icon, IconButton, Tooltip } from "@mui/material";
import { useOutletContext } from "react-router";
import { WikiContext } from "./WikiSpaceView";
import { Box } from "@mui/system";
import { Extension } from "@tiptap/core";

const NewBlockOnEnter = Extension.create({
  addOptions() {
    return {
      ...this.parent?.(),
      onEnter: () => console.log("ENTER PRESSED"),
    };
  },
  addKeyboardShortcuts() {
    return {
      Enter: () => {
        this.options.onEnter();
        return true;
      },
    };
  },
});

function WikiSpaceBlock(props: {
  block: Block;
  startedEditing?: any;
  stoppedEditing?: any;
  idx: number;
  showAddBlockMenu: (newAnchorEl: HTMLElement, newBlockIdx?: number) => void;
  removeBlock: () => void;
  onEnter: () => void;
  latestNewBlockHash?: string;
}) {
  const { spaceContext } = useOutletContext<WikiContext>();
  const { home } = spaceContext;
  const selfAuthor = home?.getAuthor()!;
  const resources = spaceContext.resources;
  const blockState = useObjectState(props.block, { debounceFreq: 250 });
  const blockContentsState = useObjectState(props.block, { debounceFreq: 250 });
  const [rejectedEdit, setRejectedEdit] = useState<string>();

  const { wiki } = useOutletContext<WikiContext>();
  const pageArrayState = useObjectState<WikiSpace>(wiki, {
    filterMutations: (ev: MutationEvent) => ev.emitter === wiki?.pages,
    debounceFreq: 250,
  });

  const wikiWriteFlags = useObjectState(wiki?.permissionLogic?.writeConfig, {
    debounceFreq: 250,
  });
  const wikiMembers = useObjectState(wiki?.permissionLogic?.members, {
    debounceFreq: 250,
  });

  // check if editable
  const [editable, setEditable] = useState<boolean>(false);

  useEffect(() => {
    let cancel = false;

    blockState
      ?.getValue()
      ?.canUpdate(selfAuthor)
      .then((canUpdate) => {
        if (cancel) return;
        editor?.setEditable(canUpdate);
        setEditable(canUpdate);
      });
      return () => { cancel = true; }
    
  }, [wikiWriteFlags, wikiMembers]);

  // disable debouncing once state has arrived:

  useEffect(() => {
    if (
      blockState?.getValue()?.getValue() !== undefined &&
      blockState.getDebounceFreq() !== undefined
    ) {
      blockState.setDebounceFreq(undefined);
    }
  }, [blockState]);

  useEffect(() => {
    if (
      blockContentsState?.getValue()?.getValue() !== undefined &&
      blockContentsState.getDebounceFreq() !== undefined
    ) {
      blockContentsState.setDebounceFreq(undefined);
    }
  }, [blockContentsState]);

  const [isEditing, setIsEditing] = useState(false);
  const lostFocusTimeout = useRef<number | undefined>();

  const startedEditing = (editor?: any, event?: any /*FocusEvent*/) => {
    // console.log("STARTED EDITING", editor, event);

    if (lostFocusTimeout.current !== undefined) {
      window.clearTimeout(lostFocusTimeout.current);
    }

    lostFocusTimeout.current = window.setTimeout(() => {
      setIsEditing((old: boolean) => {
        if (!old && props.block.type === BlockType.Text) {
          props.startedEditing(editor);
          blockState?.setDebounceFreq(undefined);
          blockContentsState?.setDebounceFreq(undefined);
        }

        return true;
      });
    }, 100);
  };

  const stoppedEditing = () => {
    if (lostFocusTimeout.current !== undefined) {
      window.clearTimeout(lostFocusTimeout.current);
    }

    lostFocusTimeout.current = window.setTimeout(() => {
      setIsEditing((old: boolean) => {
        if (old && props.block.type === BlockType.Text) {
          props.stoppedEditing();
        }

        return false;
      });
    }, 100);
  };

  // for now just use one tiptap `Editor` per block...
  // later on it might be desirable to use a custom tiptap `Block` type instead
  // and share a single tiptap `Editor`.

  const updateBlockWithHtml = useRef(
    debounce(async (blockContents: CausalReference<string>, html: string) => {
      // console.log("attempting to update block...");
      await blockContents.setValue(html, selfAuthor);
      blockContents.setResources(resources!);
      blockContents.saveQueuedOps();
      // console.log("SAVED BLOCK");
    }, 1500)
  );

  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Bold,
      Strike,
      Italic,
      Heading,
      History,
      Highlight,
      TextAlign,
      Underline,
      NewBlockOnEnter.configure({
        onEnter: props.onEnter,
      }),
      WikiLinkSuggestion.configure({
        HTMLAttributes: {
          class: "link-suggestion",
        },
        suggestion: {
          ...suggestion,
          items: ({ query }: { query: string }) => {
            return [...pageArrayState?.getValue()?.pages?.values()!]
              .map((page) => page.name!)
              .filter((item) =>
                item.toLowerCase().includes(query.toLowerCase())
              )
              .slice(0, 5);
          },
        },
      }),
      WikiLink.configure({
        definedPageNames: [...pageArrayState?.getValue()?.pages?.values()!].map(
          (page) => page.name!
        ),
      }),
      CodeBlockLowlight.configure({ lowlight }),
      Placeholder.configure({ placeholder: "Write something..." }),
    ],
    parseOptions: {
      preserveWhitespace: "full",
    },
    onUpdate: async ({ editor }) => {
      // console.log("UPDATE");
      // console.log(blockContentsState);
      if (blockContentsState && !editor.isDestroyed) {
        // const existingContent = blockContentsState.getValue()?.getValue()
        const attemptedContent = editor.getHTML();
        updateBlockWithHtml
          .current(blockContentsState.getValue()!, editor.getHTML())
          ?.then(
            () => console.log("successfully updated block"),
            () => {
              console.log("couldn't edit!", attemptedContent);
              editor.commands.setContent(
                blockContentsState?.getValue()?.getValue()!
              );
              setRejectedEdit(attemptedContent);
            }
          );
      }
    },
    editable: false,
    onBlur: stoppedEditing,
    onFocus: startedEditing,
  });

  useEffect(() => {
    if (props.block.getLastHash() === props.latestNewBlockHash) {
      editor?.commands.focus();
    }
  }, [props.latestNewBlockHash]);

  /*editor?.on('focus', () => {
        console.log('focusing editor')
        startedEditing!(editor)
    });*/

  useEffect(() => {
    const newText = blockContentsState?.getValue()?.getValue();

    if (!newText) {
      return;
    }

    if (!editor?.isDestroyed && newText !== editor?.getHTML()) {
      // console.log(
      //   "setting contents of block " + props.block.getLastHash() + " to:"
      // );
      // console.log(newText);
      editor?.commands.setContent(newText, false, {
        preserveWhitespace: "full",
      });
    }
  }, [blockContentsState, editor]); //, editor, blockState])

  const handleAddBlock = (event: React.MouseEvent<HTMLButtonElement>) => {
    props.showAddBlockMenu(event.currentTarget, props.idx + 1);
  };

  const handleRemoveBlock = (event: React.MouseEvent<HTMLButtonElement>) => {
    props.removeBlock();
  };

  const blockContentView = (
    <Fragment>
      <Box className="wiki-block">
        <div>
          {editable && (
            <Tooltip title="Click to add a block below">
              <Icon
                onClick={handleAddBlock}
                style={{
                  cursor: "pointer",
                  height: "default",
                  width: "default",
                  overflow: "visible",
                }}
              >
                <Add></Add>
              </Icon>
            </Tooltip>
          )}
        </div>

        <div>
          {editable && (
            <Icon
              style={{
                height: "default",
                width: "default",
                marginRight: "0.25rem",
                overflow: "visible",
              }}
            >
              <DragIndicator></DragIndicator>
            </Icon>
          )}
        </div>

        <div>
          {props.block?.type === BlockType.Text && (
            <div style={{ position: "relative" }}>
              <EditorContent editor={editor} />
              {/* {editor?.isEditable && isEditing && !editor?.state.selection?.empty && <BlockStyleBar editor={editor}></BlockStyleBar>} */}
              {editor?.isEditable && isEditing && (
                <BlockStyleBar editor={editor}></BlockStyleBar>
              )}
            </div>
          )}
          {props.block?.type === BlockType.Image && (
            <img
              style={{ width: "100%" }}
              src={blockState?.getValue()?.getValue()}
            />
          )}
        </div>

        <div>
          {editable && (
            <Tooltip hidden={!editable} title="Click to remove this block">
              <IconButton
                onClick={handleRemoveBlock}
                className="delete-block"
                style={{
                  cursor: "pointer",
                  height: "default",
                  width: "default",
                  overflow: "visible",
                }}
              >
                <Delete></Delete>
              </IconButton>
            </Tooltip>
          )}
        </div>
      </Box>
    </Fragment>
  );

  return blockContentView;
}

export default WikiSpaceBlock;
