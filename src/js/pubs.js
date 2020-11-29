import React, { Component } from 'react';
import ReactDOM from 'react-dom';

const xmlparser = require('fast-xml-parser');
const he = require('he');

const xmlOptions = {
	attributeNamePrefix: "",
	ignoreAttributes: false
};

const getPubMedIds = (url) => {
	const pubMedIds = fetch(url)
		.then(response => response.text())
		.then(data => {
			let json = xmlparser.parse(data, xmlOptions);
			let ids = json.eSearchResult.IdList.Id;
			return ids;
		});
	return pubMedIds;
};

const getPubMedInfo = (pubMedId) => {
	let argType = typeof(pubMedId);
	let newId;
	if (argType === "number") {
		newId = pubMedId.toString();
	} else if (argType === "string") {
		newId = pubMedId;
	} else {
		return null;
	}
	const idRegex = /^\d+$/;
	if (!idRegex.test(newId)) {
		return null;
	}
	let url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=" + newId;
	const pubMedInfo = fetch(url)
		.then(response => response.text())
		.then(data => {
			let json = xmlparser.parse(data, xmlOptions);
			let info = json.eSummaryResult.DocSum.Item;
			let filtFields = ['AuthorList', 'PubDate', 'Title', 'Source'];
			let filtInfo = info.filter(x => {
				return filtFields.includes(x.Name);
			});
			let authors = filtInfo.filter(x => (x.Name === "AuthorList"))[0]
				.Item.map(y => {
					return y['#text'].split(" ")[0];
			});
			let authorString;
			if (authors.length === 1) {
				authorString = authors[0];
			} else if (authors.length === 2) {
				authorString = authors[0] + " and " + authors[1];
			} else if (authors.length === 3) {
				authorString = authors[0] + ", " + authors[1] + ", and " + authors[2];
			} else if (authors.length > 3) {
				authorString = authors[0] + " et al.";
			} else {
				return null;
			}
			let year = filtInfo.filter(x => (x.Name === "PubDate"))[0]
				['#text'].split(" ")[0];
			let title = filtInfo.filter(x => (x.Name === "Title"))[0]
				['#text'].replace(/\.$/, "");
			title = he.decode(title);
			title = title.replace(/(<([^>]+)>)/gi, "");  // strip out any html tags
			title = he.decode(title);
			let source = filtInfo.filter(x => (x.Name === "Source"))[0]
				['#text'];
			return {
				author: authorString,
				year: year,
				title: title,
				source: source
			};
		});
	return pubMedInfo;
}

class PubMedItem extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			loaded: false
		};
	}

	componentDidMount() {
		let publication;
		getPubMedInfo(this.props.id)
			.then(data => {
				this.setState({
					loaded: true,
					author: data.author,
					year: data.year,
					title: data.title,
					source: data.source
				});
			}
		);
	}

	render() {
		return (
			this.state.loaded ?
				(<li>
					{this.state.author} ({this.state.year}). <span className="pub-title">{this.state.title}</span>. {this.state.source}.
				</li>) :
				(<li>...</li>)
		);
	}
}

class PubMedList extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			loaded: false,
			ids: [],
			citations: []
		};
	}

	componentDidMount() {
		getPubMedIds(this.props.url)
			.then(ids => {
				let citations = [];
				for (let i = 0; i < ids.length; i++) {
					citations.push((<PubMedItem id={ids[i]} />))
				}
				this.setState({
					loaded: true,
					citations: citations
				});
			});
	}

	render() {
		return (
			this.state.loaded ?
				(this.state.citations) :
				("...")
		);
	}
}

const pubMedUrl = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=(Cairns+MJ[Author])+AND+(Newcastle+OR+Sydney)+AND+Australia*&retmax=10&sort=pub+date";
const wrapper = document.getElementById("container");
wrapper ? ReactDOM.render(<PubMedList url={ pubMedUrl } />, wrapper) : false;