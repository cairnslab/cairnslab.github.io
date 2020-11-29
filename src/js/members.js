import React from 'react';
import ReactDOM from 'react-dom';
import Data from '../data/labmemberprofiles.csv';

const LabMember = (obj) => {
	let gitHubLink = obj.github && obj.github != "NA" ?
		(<p className="github">&mdash; GitHub: <a href={obj.github} target="_blank" className="github-link">{obj.github}</a></p>) :
		"";
	return (
		<div className="member">
			<h3>{obj.name}</h3>
			<div className="member-profile">
				<img src={obj.image} className="profile-pic" />
				<div className="profile-description">
					{obj.description}
					{gitHubLink}
				</div>
			</div>
		</div>
	);
};

const LabMembers = ({ csvData }) => {
	let lenMembers = csvData.length;
	let memberList = [];
	for (let i = 0; i < lenMembers; i++) {
		let member = csvData[i];
		memberList.push(LabMember(member));
		if (i < (lenMembers - 1)) {
			memberList.push((<div className="member-sep"></div>));
		}
	}

	return (
		<div className="member-list">
			<h2>Lab Members</h2>
			{memberList}
		</div>
	);
};

const wrapper = document.getElementById("container");
wrapper ? ReactDOM.render(<LabMembers csvData={ Data }/>, wrapper) : false;
