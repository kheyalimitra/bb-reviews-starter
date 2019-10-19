'use strict';

const bodyParser = require('body-parser')
const express = require('express')
const log = require('cf-nodejs-logging-support')
const request = require("request-promise");

module.exports = function (app) {
	var logLevel = process.env.LOG_LEVEL || "debug";

	log.setLoggingLevel(logLevel);
	if (process.env.LOG_PATTERN) {
		log.setLogPattern(process.env.LOG_PATTERN);
	}

	app.use(log.logNetwork);
	app.logger = log;

	const hanaReviewsService = require('./hana-reviews-service')
	app.reviewsService = new hanaReviewsService()

	const xsenv = require("@sap/xsenv");
	xsenv.loadEnv();
	const HDBConn = require("@sap/hdbext");
	var hanaOptions = xsenv.getServices({
		hana: {
			tag: "hana"
		}
	});
	hanaOptions.hana.pooling = true;
	app.use(bodyParser.json())

	app.use(express.static('../app/webapp'));
	app.use(
		HDBConn.middleware(hanaOptions.hana)
	);

	app.featureFlag = async function getFeatureFlag(flag)
	{
		var options = { 
			method: 'GET',
			url: 'https://feature-flags.cfapps.eu10.hana.ondemand.com/api/v2/evaluate/'+flag,
			headers: 
			{
				Authorization: 'Basic c2Jzc19rcXh5b2J2dmFkYmpvNGF2ZXh3b2h1ZGQyejUvd2J4K25jdXNjaGdkZGl4dm9kN20ydnVidjlkYWR4aGR4eWNpeTZ1PTphYV9SYnQwL2dyblRjTFQrYkFQYzd6WituQ0kzY009'
			} 
		};
		
		var body = await request(options);
		return JSON.parse(body).variation == 'true';
	}
};