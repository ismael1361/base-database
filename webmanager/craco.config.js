module.exports = {
	style: {
		modules: {
			localIdentName: "[name]__[local]__[hash:base64:8]", // Hash alfanumérico com 8 caracteres
		},
	},
	webpack: {
		configure: (webpackConfig) => {
			webpackConfig.module.rules.push({
				test: /\.model$/,
				type: "javascript/auto",
				use: {
					loader: "raw-loader",
					options: {
						esModule: false,
					},
				},
			});

			return webpackConfig;
		},
	},
};
