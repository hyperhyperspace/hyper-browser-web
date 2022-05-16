import { Hash } from '@hyper-hyper-space/core';
import { Folder, SpaceLink } from '@hyper-hyper-space/home';


class FolderTreeSearch {

    static byPhrase(phrase: string, root: Folder): Array<SpaceLink> {

        const results = new Map<Hash, SpaceLink>();

        FolderTreeSearch.performSearch(phrase.toLowerCase().trim(), root, results);

        return Array.from(results.values());
    }

    private static performSearch(phrase: string, folder: Folder, results: Map<Hash, SpaceLink>) {

        if (folder.items !== undefined) {
            for (const item of folder.items.contents()) {
                if (item instanceof SpaceLink) {

                    const name = item.name?.getValue();

                    if (name !== undefined && name.toLowerCase().indexOf(phrase) >= 0) {
                        results.set(item.getLastHash(), item);
                    }
                } else if (item instanceof Folder) {
                    FolderTreeSearch.performSearch(phrase, item, results);
                }
            }
        }
    }

}

export { FolderTreeSearch };