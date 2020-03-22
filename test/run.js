const fs = require("fs");
const path = require("path");
const expect = require("chai").expect;
const opds = require("../lib/opds-parser");


describe("Parsed feeds should match expected output", function() {
	it("navigation", async function() {
		const expected = {
			"@": [ { xmlns: "http://www.w3.org/2005/Atom" } ],
			id: "urn:uuid:2853dacf-ed79-42f5-8e8a-a7bb3d1ae6a2",
			title: "OPDS Catalog Root Example",
			updated: "2010-01-10T10:03:10.000Z",
			author: { name: "Spec Writer", email: null, uri: "http://opds-spec.org" },
			links:[
				{
					"@": {
						rel: "self",
						href: "/opds-catalogs/root.xml",
						type: "application/atom+xml;profile=opds-catalog;kind=navigation"
					}
				},
				{
					"@": {
						rel: "start",
						href: "/opds-catalogs/root.xml",
						type: "application/atom+xml;profile=opds-catalog;kind=navigation"
					}
				}
			],
			icon: null,
			entries: [
				{
					id: "urn:uuid:d49e8018-a0e0-499e-9423-7c175fa0c56e",
					title: "Popular Publications",
					updated: "2010-01-10T10:01:01.000Z",
					links: [
						{
							"@": {
								rel: "http://opds-spec.org/sort/popular",
								href: "/opds-catalogs/popular.xml",
								type: "application/atom+xml;profile=opds-catalog;kind=acquisition"
							}
						}
					],
					authors: [],
					rights: null,
					summary: null,
					content: "Popular publications from this catalog based on downloads.",
					categories: [],
					"dc:issued": null,
					identifiers: [],
					published: null,
					contributors: [],
					"dc:language": null,
					"dc:publisher": null,
					"dc:subtitle": null
				}
			]
		}

		const navigationStr = fs.readFileSync(path.join(__dirname, "./navigation.opds"), "utf8");

		const feed =  await opds.parseString(navigationStr);

		expect(feed).to.deep.equal(expected);
	});

	it("acquisition", async function() {
		const expected = {
			"@": [
				{ xmlns: "http://www.w3.org/2005/Atom" },
				{ "xmlns:dc": "http://purl.org/dc/terms/" },
				{ "xmlns:opds": "http://opds-spec.org/2010/catalog" }
			],
			id: "urn:uuid:433a5d6a-0b8c-4933-af65-4ca4f02763eb",
			title: "Unpopular Publications",
			updated: "2010-01-10T10:01:11.000Z",
			author: { name: "Spec Writer", email: null, uri: "http://opds-spec.org" },
			links: [
				{
					"@": {
						rel: "related",
						href: "/opds-catalogs/vampire.farming.xml",
						type: "application/atom+xml;profile=opds-catalog;kind=acquisition"
					}
				},
				{
					"@": {
						rel: "self",
						href: "/opds-catalogs/unpopular.xml",
						type: "application/atom+xml;profile=opds-catalog;kind=acquisition"
					}
				},
				{
					"@": {
						rel: "start",
						href: "/opds-catalogs/root.xml",
						type: "application/atom+xml;profile=opds-catalog;kind=navigation"
					}
				},
				{
					"@": {
						rel: "up",
						href: "/opds-catalogs/root.xml",
						type: "application/atom+xml;profile=opds-catalog;kind=navigation"
					}
				}
			],
			icon: null,
			entries: [
				{
					id: "urn:uuid:6409a00b-7bf2-405e-826c-3fdff0fd0734",
					title: "Bob, Son of Bob",
					updated: "2010-01-10T10:01:11.000Z",
					links: [
						{
							"@": {
								rel: "http://opds-spec.org/image",
								href: "/covers/4561.lrg.png",
								type: "image/png"
							}
						},
						{
							"@": {
								rel: "http://opds-spec.org/image/thumbnail",
								href: "/covers/4561.thmb.gif",
								type: "image/gif"
							}
						},
						{
							"@": {
								rel: "alternate",
								href: "/opds-catalogs/entries/4571.complete.xml",
								type: "application/atom+xml;type=entry;profile=opds-catalog",
								title: "Complete Catalog Entry for Bob, Son of Bob"
							}
						},
						{
							"@": {
								rel: "http://opds-spec.org/acquisition",
								href: "/content/free/4561.epub",
								type: "application/epub+zip"
							}
						},
						{
							"@": {
								rel: "http://opds-spec.org/acquisition",
								href: "/content/free/4561.mobi",
								type: "application/x-mobipocket-ebook"
							}
						}
					],
					authors: [
						{
							name: "Bob the Recursive",
							email: null,
							uri: "http://opds-spec.org/authors/1285"
						}
					],
					rights: null,
					summary: "The story of the son of the Bob and the gallant part he played in the lives of a man and a woman.",
					content: null,
					categories: [
						{
							term: "FIC020000",
							scheme: "http://www.bisg.org/standards/bisac_subject/index.html",
							label: "FICTION / Men's Adventure"
						}
					],
					"dc:issued": "1917-01-01T00:00:00.000Z",
					identifiers: [],
					published: null,
					contributors: [],
					"dc:language": "en",
					"dc:publisher": null,
					"dc:subtitle": null
				}
			]
		}

		const acquisitionStr = fs.readFileSync(path.join(__dirname, "./acquisition.opds"), "utf8");

		const feed = await opds.parseString(acquisitionStr);

		expect(feed).to.deep.equal(expected);
	});
});


describe("Parser should set feed type", function() {
	it("for navigation feed", async function() {
		const expected = "navigation";

		const navigationStr = fs.readFileSync(path.join(__dirname, "./navigation.opds"), "utf8");

		const feed = await opds.parseString(navigationStr);
		const type = await opds.getFeedType(feed);

		expect(type).to.equal(expected);
	});

	it("for acquisition feed", async function() {
		const expected = "acquisition";

		const acquisitionStr = fs.readFileSync(path.join(__dirname, "./acquisition.opds"), "utf8");

		const feed = await opds.parseString(acquisitionStr);
		const type = await opds.getFeedType(feed);

		expect(type).to.equal(expected);
	});
});
