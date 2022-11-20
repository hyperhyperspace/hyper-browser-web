import { Hash, Identity, Space } from '@hyper-hyper-space/core';
import { Profile } from '@hyper-hyper-space/home';

type Contact = { 
    hash: Hash,
    code: string,
    name: string,
    initials: string,
    order: string,
    isFirstForLetter?: string,
    picture?: string
};



class ProfileUtils {

    static createContact(p: Profile) {
        return {
            hash: p.owner?.getLastHash(),
            name: (p.owner?.info?.name as string || '').trim(),
            initials: ProfileUtils.initials(p.owner?.info?.name as string),
            order: (p.owner?.info?.name as string || '').toLowerCase().trim(),
            code: Space.getWordCodingForHash((p.owner as Identity)?.getLastHash()).join(' '),
            picture: p.getPictureDataUrl()
        } as Contact;
    }

    static initials (name?: string) {
        return (name || '').split(' ').filter((s: string) => s.length > 0).map((s: string) => s[0].toUpperCase()).join('').slice(0, 3);
    };

    static normalizeStringForKeywordSearch = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

    static filterContactForKeywordSearch(c: Contact, keywords: Array<string>) {

        for (const keyword of keywords) {
            let match = false;
            for (const part of [c.name, c.code]) {
                if (part !== undefined && ProfileUtils.normalizeStringForKeywordSearch(part).indexOf(keyword) >= 0) {
                    match = true;
                }
            }
            if (!match) {
                return false;
            }
        }
    
        return true;
    }

}

export { ProfileUtils };

export type { Contact };