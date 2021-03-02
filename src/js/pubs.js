import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Data from '../data/latestpubs.csv';

const xmlparser = require('fast-xml-parser');
const he = require('he');

const xmlOptions = {
	attributeNamePrefix: "",
	ignoreAttributes: false
};

// const corsProxy = "https://cors-anywhere.herokuapp.com/";
const corsProxy = "https://cors-proxy.htmldriven.com/?url=";
const jsonProxy = "/api/fetch/pubs?url="

const fetchPubMed = (url) => {
	return new Promise((resolve, reject) => {
		const request = new XMLHttpRequest();
		request.open("GET", url, true);
		request.onload = (e) => {
			if (request.readyState === 4 && request.status === 200) {
				let json = xmlparser.parse(request.responseText, xmlOptions);
				resolve(json);
			} else {
				reject(e);
			}
		}
		request.send();
	});
}

const getPubMedRss = (url) => {
	let pubMedData = fetchPubMed(url)
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
			return newCitationArray;
		});
	return pubMedData;
}

const getPubMedCsv = (csvData) => {
	let lenData = csvData.length;
	let pubList = [];
	for (let i = 0; i < lenData; i++) {
		let pub = csvData[i];
		pubList.push({
			title: pub.title,
			source: pub.source,
			year: pub.year,
			authors: pub.authors,
			link: pub.link
		});
	}
	return pubList;
};

const getPubMedJson = (url) => {
	let pubMedData = fetch(url, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json'
		}
	})
		.then(response => response.json())
		.then(data => {
			return data;
			// let citationArray = json.items;
			// let newCitationArray = citationArray.map(x => {
			// 	let authors = x["creator"];
			// 	if (typeof(authors) === "string") {
			// 		authors = authors.split(" ").pop();
			// 	} else {
			// 		authors = authors.map(x => {
			// 			return x.split(" ").pop();
			// 		});
			// 		switch(authors.length) {
			// 			case 1:
			// 				authors = authors[0];
			// 				break;
			// 			case 2:
			// 				authors = authors[0] + " and " + authors[1];
			// 				break;
			// 			case 3:
			// 				authors = authors[0] + ", " + authors[1] + ", and " + authors[2];
			// 				break;
			// 			default:
			// 				authors = authors[0] + " et al.";
			// 				break;
			// 		}
			// 	}
			// 	let title = he.decode(x["title"]);
			// 	title = title.replace(/(<([^>]+)>)/gi, "");  // strip out any html tags
			// 	title = he.decode(title);
			// 	return {
			// 		title: title,
			// 		source: x["source"],
			// 		year: x["date"].split("-")[0],
			// 		authors: authors,
			// 		link: x["link"]
			// 	};
			// });
			// return newCitationArray;
		});
	return pubMedData;
};

const PubMedItem = (props) => {
	return (
		<li>
			<a href={props.data.link} target="_blank">
				<span className="pub-authors">{props.data.authors}</span> ({props.data.year}). <span className="pub-title">{props.data.title}</span>. <span className="pub-source">{props.data.source}</span>.
			</a>
		</li>
	)
};

class PubMedList extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			loaded: false,
			failed: false,
			numRecords: 0,
			citations: []
		};
	}

	componentDidMount() {
		if (this.props.hasOwnProperty('url') && this.props.url) {
			getPubMedRss(this.props.url)
				.then(data => {
					let citations = data.map(x => {
						return (<PubMedItem data={x} />);
					});
					this.setState({
						loaded: true,
						numRecords: citations.length,
						citations: citations
					});
				})
				.catch(error => {
					console.log("Error loading PubMed data.");
					console.log(error);
					this.setState({
						failed: true
					});
				});
		} else if (this.props.hasOwnProperty('jsonUrl') && this.props.jsonUrl) {
			getPubMedJson(this.props.jsonUrl)
				.then(data => {
					let citations = data.map(x => {
						return (<PubMedItem data={x} />);
					});
					this.setState({
						loaded: true,
						numRecords: citations.length,
						citations: citations
					});
				})
				.catch(error => {
					console.log("Error loading PubMed data.");
					console.log(error);
					this.setState({
						failed: true
					});
				});
		} else {
			let pubMedList = getPubMedCsv(Data);
			let citations = pubMedList.map(x => {
				return (<PubMedItem data={x} />);
			});
			this.setState({
				loaded: true,
				numRecords: citations.length,
				citations: citations
			});
		}
	}

	render() {
		return (
			this.state.loaded ?
				(<ul>{this.state.citations}</ul>) :
				this.state.failed ?
					("Error loading PubMed data.") :
					("Loading...")
		);
	}
}

let pubMedUrl = "https://pubmed.ncbi.nlm.nih.gov/rss/search/1HYeX0emtvYaHZ7kpvO6xce88aYvtrvXGjuhNbIrVjcDnzxQhv/?limit=15&utm_campaign=pubmed-2&fc=20201202024910";
pubMedUrl = jsonProxy + pubMedUrl;
// pubMedUrl = corsProxy + pubMedUrl;
const wrapper = document.getElementById("container");
// wrapper ? ReactDOM.render(<PubMedList jsonUrl={ pubMedUrl } />, wrapper) : false;
wrapper ? ReactDOM.render(<PubMedList />, wrapper) : false;
