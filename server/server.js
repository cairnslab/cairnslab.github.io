'use strict';

const xmlparser = require('fast-xml-parser');
const he = require('he');

const xmlOptions = {
	attributeNamePrefix: "",
	ignoreAttributes: false
};

// Express setup
const express = require('express');
const app = express();
const path = require('path');
const dotenv = require('dotenv').config();
const bodyParser = require('body-parser');
const { rejects } = require('assert');
const XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;


const dist = path.resolve(__dirname + "/../dist");
app.use('/', express.static(dist));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.get('/home', (req, res) => {
	res.sendFile(dist + '/index.html');
});

app.get('/api/fetch/pubs', (req, res) => {
	let url = req.query.url ? req.query.url : null;
	if (url != null) {
		let rss = new Promise((resolve, reject) => {
			let request = new XMLHttpRequest();
			request.open("GET", url, true);
			request.onload = (e) => {
				if (request.readyState === 4 && request.status === 200) {
					let json = xmlparser.parse(request.responseText, xmlOptions);
					resolve(json);
				} else {
					reject(e);
				}
			};
			request.send();
		})
			.then(json => {
				let citationArray = json.rss.channel.item;
				let newCitationArray = citationArray.map(x => {
					let authors = x["dc:creator"];
					if (typeof(authors) === "string") {
						authors = authors.split(" ").pop();
					} else {
						authors = authors.map(x => {
							return x.split(" ").pop();
						});
						switch(authors.length) {
							case 1:
								authors = authors[0];
								break;
							case 2:
								authors = authors[0] + " and " + authors[1];
								break;
							case 3:
								authors = authors[0] + ", " + authors[1] + ", and " + authors[2];
								break;
							default:
								authors = authors[0] + " et al.";
								break;
						}
					}
					let title = he.decode(x["dc:title"]);
					title = title.replace(/(<([^>]+)>)/gi, "");  // strip out any html tags
					title = he.decode(title);
					return {
						title: title,
						source: x["dc:source"],
						year: x["dc:date"].split("-")[0],
						authors: authors,
						link: x["link"]
					};
				});
				res.send(newCitationArray);
			});
	} else {

	}
});

// Listen
const port = process.env.PORT || 9000;
const server = app.listen(port, () => {
	console.log(`Server is running at http://localhost:${port}`);
});
