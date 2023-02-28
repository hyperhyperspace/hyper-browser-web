// a react component for `WikiPage` name display and editing

import { useObjectState } from "@hyper-hyper-space/react";
import { Page, PageArray } from "@hyper-hyper-space/wiki-collab";
import React, { useState, useEffect } from "react";
import { useOutletContext, useParams } from "react-router";
import { WikiContext } from "./WikiSpaceView";
import { MutationEvent } from "@hyper-hyper-space/core";
import { Input, Typography } from "@mui/material";

const WikiSpaceEditablePageName = (props: {}) => {
  // const [name, setName] = useState(props.page.name);
  // const name = useObjectState(props.page.name)?.value?.getValue()!;
  const { pageName } = useParams();
  const { wiki, nav } = useOutletContext<WikiContext>();

  const pageArrayState = useObjectState<PageArray>(wiki?.pages, {
    filterMutations: (ev: MutationEvent) =>
      [...wiki.pages?.values()!].map((page) => page.name).includes(ev.emitter),
    debounceFreq: 50,
  });
  const [pages, setPages] = useState<Page[]>([]);

  const [pendingName, setPendingName] = useState<string | null>(null);

  useEffect(() => {
    setPages(
      [...pageArrayState?.getValue()?.values()!].filter(
        (p) => p?.name?.getValue() === pageName
      )
    );
  }, [pageArrayState, pageName]);

  const inputRef = React.useRef<HTMLInputElement>(null);

  return (
    <Typography
      ref={inputRef}
      variant="h6"
      align="center"
      suppressContentEditableWarning={true} contentEditable={true}
    //   value={pendingName || pageName}
      onBlur={async (e) => {
        const pendingName = inputRef.current?.innerText;
        if (!pendingName || pendingName?.length === 0) {
            return;
        }

        nav.goToPage(pendingName);
        await Promise.all(
          pages.map(async (page) => {
            page.name?.setValue(pendingName);
            await page.name?.save();
          })
        );

        // console.log(
        //   "page name changed to " + e.target.value,
        //   "preparing to navigate..."
        // );
      }}
      onKeyPress={(e) => {
        if (e.key === "Enter") {
          inputRef.current?.blur();
        }
      }}
    >{pageName}</Typography>
  );
};

export default WikiSpaceEditablePageName;
