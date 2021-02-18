import React from 'react';
import ReactDOM from 'react-dom';
import Data from '../data/aboutnewcastle.csv';

const Section = (obj) => {
	let websiteLink = obj.website && obj.website != "NA" ?
		(<p className="website">&mdash; Website: <a href={obj.website} target="_blank" className="website-link">{obj.website}</a></p>) :
		"";
	return (
		<div className="about-section">
		<h2>{obj.heading}</h2>
			{obj.description}
			{websiteLink}
		</div>
	);
};

const AboutNewcastle = ({ csvData }) => {
	let lenAbout = csvData.length;
	let aboutList = [];
	for (let i = 0; i < lenAbout; i++) {
		let section = csvData[i];
		aboutList.push(Section(section));
		if (i < (lenAbout - 1)) {
			aboutList.push((<div className="section-sep"></div>));
		}
	}

	return (
		<div className="about-list">
			{aboutList}
		</div>
	);
};

const wrapper = document.getElementById("container");
wrapper ? ReactDOM.render(<AboutNewcastle csvData={ Data }/>, wrapper) : false;
