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
import { debounce, map, mapValues } from "lodash-es";
import { Icon, IconButton, Tooltip } from "@mui/material";
import { useOutletContext } from "react-router";
import { WikiContext } from "./WikiSpaceView";
import { Box } from "@mui/system";
import { Extension } from "@tiptap/core";
import Emoji from "./Emoji";

const BlockEditorShortcuts = Extension.create({
  addOptions() {
    return {
      ...this.parent?.(),
      shortcuts: {}
    };
  },
  addKeyboardShortcuts() {
    return mapValues(this.options.shortcuts, fn => fn.bind(this));
  },
});

function WikiSpaceBlock(props: {
  block: Block;
  startedEditing?: any;
  stoppedEditing?: any;
  idx: number;
  showAddBlockMenu: (newAnchorEl: HTMLElement, newBlockIdx?: number) => void;
  removeBlock: () => void;
  addBlockAfter: Function;
  focusOnBlockWithHash?: string;
  focusOnAdjacentBlock?: (block: Block, distance?: number) => void
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
        editor?.setEditable(canUpdate, false);
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
    console.log('stopped editing')

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
      // console.log("attempting to update block...", html);
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
      BlockEditorShortcuts.configure({
        shortcuts: {
          Enter: () => {
            console.log('enter was at ' + Date.now());
            props.addBlockAfter(props.block)
            return true
          },
          Backspace: function(){
            const selection = this.editor.view.state.selection
            const length = this.editor.state.doc.textContent.length
            // console.log('backspace', selection, length)
            if (selection.empty && selection.head == 1 && length === 0 ) {
              props.focusOnAdjacentBlock!(props.block, -1)
              props.removeBlock()
              return true
            }
          },
          ArrowUp: function(){
            const selection = this.editor.view.state.selection
            // console.log('arrow up', selection)
            if (selection.empty && selection.head == 1) {
              props.focusOnAdjacentBlock!(props.block, -1)
              return true
            }
          },
          ArrowDown: function(){
            const selection = this.editor.view.state.selection
            const length = this.editor.state.doc.content.size
            console.log('arrow down', selection, length, this.editor.state.doc)
            if (selection.empty && selection.head + 1 === length) {
              props.focusOnAdjacentBlock!(props.block, 1)
              return true
            }
          }
        }
      }),
      WikiLinkSuggestion.configure({
        HTMLAttributes: {
          class: "link-suggestion",
        },
        suggestion: {
          ...suggestion,
          items: ({ query }: { query: string }) => {
            return [...pageArrayState?.getValue()?.pages?.values()!]
              .map((page) => page.name?.getValue()!)
              .filter((item) =>
                item.toLowerCase().includes(query.toLowerCase())
              )
              .slice(0, 5);
          },
        },
      }),
      Emoji.configure(),
      WikiLink.configure({
        definedPageNames: [...pageArrayState?.getValue()?.pages?.values()!].map(
          (page) => page.name?.getValue()!
        ),
      }),
      CodeBlockLowlight.configure({ lowlight }),
      Placeholder.configure({ placeholder: "Write something..." }),
    ],
    parseOptions: {
      preserveWhitespace: "full",
    },
    onUpdate: async ({ editor }) => {
      if (blockContentsState && !editor.isDestroyed) {
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
    if (props.block.getLastHash() === props.focusOnBlockWithHash) {
      editor?.commands.focus();
    }
  }, [props.focusOnBlockWithHash]);

  useEffect(() => {
    const newText = blockContentsState?.getValue()?.getValue();

    if (!newText) {
      return;
    }

    if (!editor?.isDestroyed && newText !== editor?.getHTML()) {
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
            <div className='wiki-block-wrapper'>
              <EditorContent editor={editor} />
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
                size="small"
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
