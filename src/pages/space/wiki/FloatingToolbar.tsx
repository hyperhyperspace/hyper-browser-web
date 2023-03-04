import { useEffect } from 'react';
import ReactDOM from 'react-dom';

import { useFloating, shift, offset, inline } from '@floating-ui/react-dom';
import { autoPlacement } from '@floating-ui/dom';

import { posToDOMRect } from '@tiptap/core';
import { debounce } from 'lodash';
import { Editor } from '@tiptap/react';

import BlockToolbar from './BlockToolbar';

export const FloatingToolbar = ({ editor, isEditing }: {editor: Editor, isEditing: Boolean}) => {
  const { x, y, reference, floating, strategy, update } = useFloating({
    placement: 'top',
    middleware: [
      autoPlacement({
        alignment: 'start',
      }),
      offset(10),
      inline(),
      shift(),
    ],
  });

  useEffect(() => {
    editor?.on(
      'selectionUpdate',
      debounce(() => {
        update();
      }, 100)
    );
  }, []);

  if (!editor) {
    return <></>
  }
  
  const { state, view } = editor;
  const { from, to } = state.selection;
  const isCollapsed = to - from <= 0;

  const domRect = posToDOMRect(view, from, to);
  if (!domRect) {
    return null;
  }
  const width = editor.view.dom.clientWidth;
  if (width === 0) {
    return null;
  }
  return (!editor.state.selection.empty && isEditing) ? (
    <div hidden={editor.state.selection.empty}>
      {ReactDOM.createPortal(
        <div
          ref={reference}
          style={{
            position: 'absolute',
            zIndex: -1,
            left: domRect.x,
            top: domRect.y,
            width: domRect.width,
            height: domRect.height,
          }}
        >
          &#160;
        </div>,
        document.body
      )}
      <div>
        {!isCollapsed &&
          ReactDOM.createPortal(
            <div
              ref={floating}
              style={{
                position: strategy,
                top: y || '',
                left: x || '',
              }}
              onMouseDownCapture={(e) => {
                e.preventDefault();
              }}
              onPointerDownCapture={(e) => {
                e.preventDefault();
              }}
            >
                <BlockToolbar editor={editor}/>
            </div>,
            document.body
          )}
      </div>
    </div>
  ) : <></>;
};
