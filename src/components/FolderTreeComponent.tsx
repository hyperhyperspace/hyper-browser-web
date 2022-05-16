import { useState } from 'react';

import TreeView from '@mui/lab/TreeView';
import TreeItem from '@mui/lab/TreeItem';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

import { Folder, FolderItem, FolderTree } from '@hyper-hyper-space/home';
import { Hash } from '@hyper-hyper-space/core';
import { useStateObject } from '@hyper-hyper-space/react';

function FolderTreeComponent(props: {tree: FolderTree, onFolderSelect?: (folder: Folder) => void, style: React.CSSProperties | undefined}) {

    const rootHash = props.tree?.root?.hash() as Hash;

    const [expanded, setExpanded] = useState<string[]>([rootHash]);
    const [selected, setSelected] = useState<Hash[]>([rootHash]);

    const treeState = useStateObject(props.tree);

    const renderFolder = (folderHash: Hash, parentId='') => {

        const folder = treeState?.value?._currentFolderItems.get(folderHash);

        if (folder instanceof Folder) {
          const name = folder.name?.getValue();

          if (name !== undefined) {

            const idPrefix = parentId === ''? '' : parentId + '_';
            const nodeId = idPrefix + folder.getLastHash();

            return (<TreeItem key={nodeId} nodeId={nodeId} label={folder.name?.getValue()}>
                      {folder.items !== undefined &&
                        folder.items.contents().filter((item: FolderItem) => item instanceof Folder && nodeId.indexOf(item.getLastHash()) < 0).map((item: FolderItem) => 
                          renderFolder(item.getLastHash())
                        )
                      }
                    </TreeItem>);
          }
        }
    };

    const handleToggle = (event: React.SyntheticEvent, nodeIds: string[]) => {
      setExpanded(nodeIds);
    };
  
    const handleSelect = (event: React.SyntheticEvent, nodeIds: string[]) => {
      setSelected(nodeIds);
      if (props.onFolderSelect !== undefined && nodeIds.length > 0) {


        const folderHash = (nodeIds as any as string).split('_').at(-1) as Hash;
        const folder = props.tree._currentFolderItems.get(folderHash);

        if (folder instanceof Folder) {
          props.onFolderSelect(folder);
        }
        
      }
    };

    return (
      <TreeView 
          defaultCollapseIcon={<ExpandMoreIcon />} 
          defaultExpandIcon={<ChevronRightIcon />}
          expanded={expanded}
          selected={selected}
          onNodeToggle={handleToggle}
          onNodeSelect={handleSelect}
          style={props.style}>
            {treeState?.value?.root !== undefined && renderFolder(treeState?.value?.root.getLastHash())}
      </TreeView>
    );
}

export default FolderTreeComponent;