'use strict';
const HTTP_NO_CONTENT = 204
const HTTP_CREATED = 201
const HTTP_CONFLICT = 409
const publisher = require('../utils/publisher')
const MSG_URL = "amqp://localhost"
const QUEUE = "endurance"

module.exports = function (app) {

	app.get('/api/v1/reviews', async function readAll(req, res) {
		req.logger.info("Recovering Reviews")
		const result = await app.reviewsService.getAll(req)
		req.logger.debug("Result: %s", JSON.stringify(result))
		res.send(result)
	})

	app.get('/api/v1/reviews/:revieweeEmail', async function readAll(req, res) {
		const revieweeEmail = req.params.revieweeEmail;
		req.logger.info("Recovering all Reviews from %s", revieweeEmail)
		const result = await app.reviewsService.getAllFor(revieweeEmail, req)
		req.logger.debug("Result: %s", JSON.stringify(result))
		res.send(result)
	})

	app.get('/api/v1/averageRatings/:email', async function getAverageUserRating(req, res) {
		const result = await app.reviewsService.getAverageRating(req.params.email, req)
		req.logger.info("Recovering Average User Raiting for %s", req.params.email)
		req.logger.debug("Result: %s", JSON.stringify(result))
		res.send(result)
	})

	app.post('/api/v1/reviews', async function create(req, res) {
		req.logger.info("Posting Review")
		req.logger.debug("Request Body: %s", JSON.stringify(req.body))
		try {
			await app.reviewsService.create(req.body, req)
		} catch (err) {
			req.logger.error("Review could not be posted: %s", err)
			return res.status(HTTP_CONFLICT).end()
		}
		const reviewee_email = req.body.reviewee_email
		var rating = await app.reviewsService.getAverageRating(reviewee_email, req)
		req.logger.info("Review posted successfully")
		req.logger.info("rating.average_rating: " + rating.average_rating);
		res.status(HTTP_CREATED).location(req.body.component_name).end()

		if (reviewee_email == null || rating.average_rating == null){
			req.logger.error("ERROR: reviewee_email or average_rating is null!")
			return res.status(HTTP_CONFLICT).end()
		}
		
		var msg = JSON.stringify({
			"type" : "create",
			"contact" : reviewee_email,
			"rating": rating.average_rating
		});
		publisher.publish(MSG_URL, QUEUE, JSON.stringify(msg))
	})

	app.delete('/api/v1/reviews', async function deleteAll(req, res) {
		req.logger.info("Deleting Reviews")
		req.logger.debug("Request Body: %s", JSON.stringify(req.body))
		await app.reviewsService.deleteAll(req)
		req.logger.info("Review deleted successfully")
		res.status(HTTP_NO_CONTENT).end()

		var msg = JSON.stringify({
			"type" : "delete",
		});
		publisher.publish(MSG_URL, QUEUE, msg);
	})

	app.get('/api/v1/sleep', async function sleep(req, res) {
		req.logger.info("Starting Sleep")
		req.logger.debug("Request Body: %s", JSON.stringify(req.body))
		await app.reviewsService.sleep(req.db)
		let now = new Date();
		req.logger.info("Sleep over")
		return res.type("text/plain").send(`Sleep time is over: ${now.toLocaleTimeString()}`)
	})
};