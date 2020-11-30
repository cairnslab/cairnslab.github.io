const path = require('path');

module.exports = {
	entry: {
		index: './src/js/index.js',
		members: './src/js/members.js',
		newcastle: './src/js/newcastle.js',
		pubs: './src/js/pubs.js',
		sidebar: './src/js/sidebar.js',
	},
	output: {
		filename: './js/[name].js',
		path: path.resolve(__dirname, 'dist'),
	},
	module: {
		rules: [
			{
				test: /\.(js|jsx)$/,
				exclude: /node_modules/,
				use: {
					loader: "babel-loader",
				},
			},
			{
				test: /.csv$/,
				loader: 'csv-loader',
				options: {
					dynamicTyping: true,
					header: true,
					skipEmptyLines: true,
				},
			},
		],
	},
};