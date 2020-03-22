export interface Entry {
    id: string | null;
    title: string;
    updated: string | null;
    links: Array<{
        '@': {
            rel: string;
            href: string;
            type: string;
        };
    }>;
    authors: {
        name: string | null;
        email: string | null;
        uri: string | null;
    } | null;
    rights: string | null;
    summary: string | null;
    content: string | null;
    categories: {
        term: string | null;
        scheme: string | null;
        label: string | null;
    } | null;
    'dc:issued': string | null;
    identifiers: string[];
    published: string | null;
    contributors: {
        name: string | null;
        email: string | null;
        uri: string | null;
    } | null;
    'dc:language': string | null;
    'dc:publisher': string | null;
    'dc:subtitle': string | null;
}
export interface Feed {
    '@': Array<{
        xmlns: "http://www.w3.org/2005/Atom";
    }>;
    id: string | null;
    title: string | null;
    updated: string | null;
    author: {
        name: string | null;
        email: string | null;
        uri: string | null;
    } | null;
    links: Array<{
        '@': {
            rel: string;
            href: string;
            type: string;
        };
    }>;
    icon: string | null;
    entries: Entry[];
}
export declare function parseString(feed: string): Promise<Feed>;
export declare function getFeedType(json: Feed): Promise<"acquisition" | "navigation" | null>;
