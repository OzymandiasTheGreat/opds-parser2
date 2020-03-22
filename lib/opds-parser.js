"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sax = require("sax");
const events = require("events");
const url_parse_1 = require("url-parse");
function getValue(obj, subkey) {
    if (!subkey) {
        subkey = "#";
    }
    if (obj && obj[subkey]) {
        return obj[subkey];
    }
    return null;
}
function toISOString(string, callback) {
    try {
        callback(new Date(string).toISOString());
    }
    catch (_a) {
        callback("1900-01-01T00:00:00.000Z");
    }
}
function handleMeta(node) {
    if (!node) {
        return {};
    }
    const meta = {
        id: null,
        title: null,
        updated: null,
        author: null,
        links: [],
        icon: null,
    };
    Object.keys(node).forEach(function (name) {
        const el = node[name];
        switch (name) {
            case "id":
                meta.id = getValue(el);
                break;
            case "title":
                meta.title = getValue(el);
                break;
            case "updated":
                toISOString(getValue(el), function (date) {
                    meta.updated = date;
                });
                break;
            case "author":
                const getAuthor = function (el, callback) {
                    const author = {};
                    ["name", "email", "uri"].forEach(function (p) {
                        if (el.hasOwnProperty(p)) {
                            author[p] = el[p]["#"];
                        }
                        else {
                            author[p] = null;
                        }
                    });
                    callback(author);
                };
                getAuthor(el, function (author) {
                    meta.author = author;
                });
                break;
            case "link":
                if (Array.isArray(el)) {
                    meta.links = el;
                }
                else {
                    meta.links.push(el);
                }
                break;
            case "icon":
                meta.icon = getValue(el);
        }
    });
    return meta;
}
function handleEntry(node) {
    if (!node) {
        return {};
    }
    // Entry elements specified in OPDS spec.
    // See http://opds-spec.org/specs/opds-catalog-1-1-20110627/#OPDS_Catalog_Entry_Documents
    const entry = {
        // MUST
        id: null,
        title: "",
        updated: null,
        links: [],
        // SHOULD
        authors: [],
        rights: null,
        summary: null,
        content: null,
        categories: [],
        "dc:issued": null,
        identifiers: [],
        // MAY
        published: null,
        contributors: [],
        // NOT IN SPEC
        "dc:language": null,
        "dc:publisher": null,
        "dc:subtitle": null,
    };
    Object.keys(node).forEach(function (name) {
        const el = node[name];
        switch (name) {
            case "id":
                entry.id = getValue(el);
                break;
            case "title":
                entry.title = getValue(el);
                break;
            case "updated":
                toISOString(getValue(el), function (date) {
                    entry.updated = date;
                });
                break;
            case "link":
                if (Array.isArray(el)) {
                    entry.links = el;
                }
                else {
                    entry.links.push(el);
                }
                break;
            case "author":
                const getAuthor = function (el, callback) {
                    const author = {};
                    ["name", "email", "uri"].forEach(function (p) {
                        if (el.hasOwnProperty(p)) {
                            author[p] = el[p]["#"];
                        }
                        else {
                            author[p] = null;
                        }
                    });
                    callback(author);
                };
                if (Array.isArray(el)) {
                    el.forEach(function (o) {
                        getAuthor(o, function (author) {
                            entry.authors.push(author);
                        });
                    });
                }
                else {
                    getAuthor(el, function (author) {
                        entry.authors.push(author);
                    });
                }
                break;
            case "rights":
                entry.rights = getValue(el);
                break;
            case "summary":
                entry.summary = getValue(el);
                break;
            case "content":
                entry.content = el["#"];
                break;
            case "category":
                const getCategory = function (el, callback) {
                    const category = {};
                    ["term", "scheme", "label"].forEach(function (p) {
                        if (el["@"].hasOwnProperty(p)) {
                            category[p] = el["@"][p];
                        }
                        else {
                            category[p] = null;
                        }
                    });
                    callback(category);
                };
                if (Array.isArray(el)) {
                    el.forEach(function (o) {
                        getCategory(o, function (category) {
                            entry.categories.push(category);
                        });
                    });
                }
                else {
                    getCategory(el, function (category) {
                        entry.categories.push(category);
                    });
                }
                break;
            case "dc:issued":
                toISOString(getValue(el), function (date) {
                    entry["dc:issued"] = date;
                });
                break;
            case "dc:identifier":
                if (Array.isArray(el)) {
                    el.forEach(function (e) {
                        entry.identifiers.push(getValue(e));
                    });
                }
                else {
                    entry.identifiers.push(getValue(el));
                }
                break;
            case "published":
                toISOString(getValue(el), function (date) {
                    entry.published = date;
                });
                break;
            case "contributor":
                const getContributor = function (el, callback) {
                    const contributor = {};
                    ["name", "email", "uri"].forEach(function (p) {
                        if (el.hasOwnProperty(p)) {
                            contributor[p] = el[p]["#"];
                        }
                        else {
                            contributor[p] = null;
                        }
                    });
                    callback(contributor);
                };
                if (Array.isArray(el)) {
                    el.forEach(function (o) {
                        getContributor(o, function (contributor) {
                            entry.contributors.push(contributor);
                        });
                    });
                }
                else {
                    getContributor(el, function (contributor) {
                        entry.contributors.push(contributor);
                    });
                }
                break;
            case "dc:language":
                entry["dc:language"] = getValue(el);
                break;
            case "dc:publisher":
                entry["dc:publisher"] = getValue(el);
                break;
            case "dc:subtitle":
                entry["dc:subtitle"] = getValue(el);
        }
    });
    return entry;
}
class OpdsParser extends events.EventEmitter {
    constructor() {
        super();
        const self = this;
        this._reset();
        this.parser = sax.parser(false, { lowercase: true, normalize: true, trim: true });
        this.parser.onerror = function (e) { self.handleSaxError(e, self); };
        this.parser.onopentag = function (n) { self.handleOpenTag(n, self); };
        this.parser.onclosetag = function (e) { self.handleCloseTag(e, self); };
        this.parser.ontext = function (t) { self.handleText(t, self); };
        this.parser.oncdata = function (t) { self.handleText(t, self); };
        this.parser.onend = function () { self.handleEnd(self); };
        events.EventEmitter.call(this);
    }
    _reset() {
        this.meta = {};
        this.entries = [];
        this.xmlbase = [];
        this.stack = [];
        this.nodes = {};
        this.inHtml = false;
        this.html = {};
        this.errors = [];
        this.callback = undefined;
    }
    handleOpenTag(node, scope) {
        const self = scope;
        const n = {
            "#name": node.name,
            "@": {},
            "#": "",
        };
        if (self.stack.length === 0) {
            if (!(node.name === "feed" || node.name === "entry")) {
                self.handleError("NOT AN ATOM");
            }
        }
        function handleAttributes(attrs, el) {
            Object.keys(attrs).forEach(function (name) {
                if (self.xmlbase.length && (name === "href" || name === "src" || name === "uri")) {
                    attrs[name] = new url_parse_1.default(attrs[name], self.xmlbase[0]["#"]).toString(undefined);
                }
                else if (name === "xml:base") {
                    if (self.xmlbase.length) {
                        attrs[name] = new url_parse_1.default(attrs[name], self.xmlbase[0]["#"]).toString(undefined);
                    }
                    self.xmlbase.unshift({ "#name": el, "#": attrs[name] });
                }
                else if (name === "type" && (attrs["type"] === "xhtml" || attrs["type"] === "html")) {
                    self.inHtml = true;
                    self.html = { "#name": el, "#": "" };
                }
            });
            return attrs;
        }
        if (Object.keys(node.attributes).length) {
            n["@"] = handleAttributes(node.attributes, n["#name"]);
        }
        if (self.inHtml && self.html["#name"] !== n["#name"]) {
            self.html["#"] += `<${n["#name"]}`;
            Object.keys(n["@"]).forEach(function (name) {
                self.html["#"] += ` ${name}="${n["@"][name]}"`;
            });
            self.html["#"] += ">";
        }
        else if (self.stack.length === 0) {
            self.meta["@"] = [];
            Object.keys(n["@"]).forEach(function (name) {
                const o = {};
                o[name] = n["@"][name];
                self.meta["@"].push(o);
            });
        }
        self.stack.unshift(n);
    }
    handleText(text, scope) {
        const self = scope;
        if (self.inHtml) {
            self.html["#"] += text;
        }
        else {
            if (self.stack.length) {
                if ("#" in self.stack[0]) {
                    self.stack[0]["#"] += text;
                }
                else {
                    self.stack[0]["#"] = text;
                }
            }
        }
    }
    handleCloseTag(el, scope) {
        const self = scope;
        let n = self.stack.shift();
        delete n["#name"];
        if (self.xmlbase.length) {
            if (el === "logo" || el === "icon") {
                n["#"] = new url_parse_1.default(n["#"], self.xmlbase[0]["#"]);
            }
            if (el === self.xmlbase[0]["#name"]) {
                void self.xmlbase.shift();
            }
        }
        if (self.inHtml) {
            if (el === self.html["#name"]) {
                n["#"] += self.html["#"].trim();
                for (const key in n) {
                    if (key !== "@" && key !== "#") {
                        delete n[key];
                    }
                }
                self.html = {};
                self.inHtml = false;
            }
            else {
                self.html["#"] += `</${el}>`;
            }
        }
        if ("#" in n) {
            if (n["#"].match(/^\s*$/)) {
                delete n["#"];
            }
            else {
                n["#"] = n["#"].trim();
                if (Object.keys(n).length === 1) {
                    n = n["#"];
                }
            }
        }
        if (el === "entry") {
            const entry = handleEntry(n);
            self.emit("entry", entry);
            self.entries.push(entry);
        }
        else if (el === "feed") {
            Object.assign(self.meta, handleMeta(n));
        }
        if (self.stack.length > 0) {
            if (!self.stack[0].hasOwnProperty(el)) {
                self.stack[0][el] = n;
            }
            else if (self.stack[0][el] instanceof Array) {
                self.stack[0][el].push(n);
            }
            else {
                self.stack[0][el] = [self.stack[0][el], n];
            }
        }
        else {
            self.nodes = n;
        }
    }
    handleEnd(scope) {
        const self = scope;
        const feed = self.meta;
        const entries = self.entries;
        feed.entries = entries;
        self.emit("end", feed);
        if ("function" === typeof self.callback) {
            if (self.errors.length) {
                const error = self.errors.pop();
                if (self.errors.length) {
                    error.errors = self.errors;
                }
                self.callback(error);
            }
            else {
                self.callback(null, feed);
            }
        }
        self._reset();
    }
    handleSaxError(e, scope) {
        const self = scope;
        self.handleError(e, self);
    }
    handleError(e, scope) {
        const self = scope;
        self.errors.push(e);
        self.handleEnd();
    }
    _setCallback(callback) {
        this.callback = ("function" === typeof callback) ? callback : undefined;
    }
    parse(feed, callback) {
        this._setCallback(callback);
        this.parser.write(feed).close();
    }
    getFeedType(json, callback) {
        const self = this;
        let numberOfEntries = 0;
        let acquisitionLinksCount = 0;
        let entriesCount = 0;
        function getNumberOfEntries(json, callback) {
            numberOfEntries = json.entries.length;
            callback();
        }
        function isAcquisition(json, callback) {
            callback(json.links.some(function (l) {
                return (l["@"].hasOwnProperty("rel") && (l["@"].rel.indexOf("http://opds-spec.org/acquisition") >= 0));
            }));
        }
        function countAcquisitionLink(bool, callback) {
            if (bool) {
                acquisitionLinksCount += 1;
            }
            callback();
        }
        function countEntry(callback) {
            entriesCount += 1;
            callback();
        }
        function setFeedType(callback) {
            if (entriesCount === numberOfEntries) {
                if (acquisitionLinksCount === numberOfEntries) {
                    callback(null, "acquisition");
                }
                else {
                    callback(null, "navigation");
                }
            }
        }
        if (json.hasOwnProperty("entries") && json.entries.length > 0) {
            getNumberOfEntries(json, function () {
                json.entries.forEach(function (e) {
                    isAcquisition(e, function (bool) {
                        countAcquisitionLink(bool, function () {
                            countEntry(function () {
                                setFeedType(callback);
                            });
                        });
                    });
                });
            });
        }
        else {
            callback(null, null);
        }
    }
}
const parser = new OpdsParser();
function parseString(feed) {
    return new Promise((resolve, reject) => parser.parse(feed, (err, parsed) => err ? reject(err) : resolve(parsed)));
}
exports.parseString = parseString;
function getFeedType(json) {
    return new Promise((resolve, reject) => parser.getFeedType(json, (err, type) => err ? reject(err) : resolve(type)));
}
exports.getFeedType = getFeedType;
