import React from 'react';
import ReactDOM from 'react-dom';
import Data from '../data/links.csv';

const SidebarElement = (obj) => {
	let className = "sidebar-element sidebar-link";
	className += obj.last ? " sidebar-element-last" : "";
	className += obj.currentPage ? " sidebar-link-current-page" : "";
	return (
		<a className={className} href={obj.url}>
			{obj.text}
		</a>
	);
};

const Sidebar = (props) => {
	let csvData = props.csvData;
	let show = props.show;
	let currentPage = window.location.pathname.split("/").pop();
	let sidebarLen = csvData.length;
	let sidebar = [];
	for (let i = 0; i < sidebarLen; i++) {
		let elem = csvData[i];
		elem.last = (i === (sidebarLen - 1));
		elem.currentPage = (elem.url === ("./" + currentPage));
		sidebar.push(SidebarElement(elem));
	}
	let className = "sidebar";
	className += show ? " visible" : "";
	return (
		<nav className={className}>
			<h2 className="sidebar-element">Navigation</h2>
			{sidebar}
		</nav>
	);
}

class SidebarWrapper extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			show: false
		};
		this.handleClick = this.handleClick.bind(this);
	}

	handleClick() {
		this.setState({
			show: !this.state.show
		});
	}

	render() {
		return (
			<div id="sidebar-wrapper">
				<a href="javascript:void(0);" className="sidebar-toggle" onClick={this.handleClick}>
					<i className="fas fa-bars"></i>
				</a>
				<Sidebar csvData={this.props.csvData} show={this.state.show} />
			</div>
		);
	}
}

const wrapper = document.getElementById("sidebar-container");
// wrapper ? ReactDOM.render(<Sidebar csvData={ Data } />, wrapper) : false;
wrapper ? ReactDOM.render(<SidebarWrapper csvData={ Data } />, wrapper) : false;
