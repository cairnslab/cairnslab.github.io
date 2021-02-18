import React from 'react';
import ReactDOM from 'react-dom';

const Footer = (props) => {
	return (
		<ul id="footer-list">
			<li><a href={"mailto:" + props.email} target="_blank">Email</a></li>
			<li><a href={props.github} target="_blank">GitHub</a></li>
			<li><a href={props.pubmed} target="_blank">PubMed</a></li>
		</ul>
	);
};

const wrapper = document.getElementById("footer");
wrapper ? ReactDOM.render(
	<Footer
		github="https://github.com/cairnslab"
		email="murray.cairns@newcastle.edu.au"
		pubmed="https://pubmed.ncbi.nlm.nih.gov/?term=Cairns+MJ%5BAuthor%5D"
		/>,
	wrapper) : false;
