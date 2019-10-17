'use strict';

const bodyParser = require('body-parser')
const express = require('express')
const log = require('cf-nodejs-logging-support')

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
};