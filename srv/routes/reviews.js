'use strict';
const HTTP_NO_CONTENT = 204
const HTTP_CREATED = 201
const HTTP_CONFLICT = 409
const publisher = require('../utils/publisher')
const MSG_URL = "amqp://localhost"
const QUEUE = "endurance"

module.exports = function(app) {

	app.get('/api/v1/reviews', async function readAll(req, res) {
		const result = await app.reviewsService.getAll(req)
		res.send(result)
	})

	app.get('/api/v1/reviews/:revieweeEmail', async function readAll(req, res) {
		const revieweeEmail = req.params.revieweeEmail;
		const result = await app.reviewsService.getAllFor(revieweeEmail, req)
		res.send(result)
	})

	app.get('/api/v1/averageRatings/:email', async function getAverageUserRating(req, res) {
		const result = await app.reviewsService.getAverageRating(req.params.email, req)
		res.send(result)
	})

	app.post('/api/v1/reviews', async function create(req, res) {
		try {
			await app.reviewsService.create(req.body, req)
		} catch (err) {
			return res.status(HTTP_CONFLICT).end()
		}
		const reviewee_email = req.body.reviewee_email
		var rating = await app.reviewsService.getAverageRating(reviewee_email, req)		
		res.status(HTTP_CREATED).location(req.body.component_name).end()

		if (reviewee_email == null || rating.average_rating == null){
			console.log("ERROR: reviewee_email or average_rating is null!")
		}
		
		var msg = JSON.stringify({
			"type" : "create",
			"contact" : reviewee_email,
			"rating": rating.average_rating
		});
		publisher.publish(MSG_URL, QUEUE, JSON.stringify(msg))
	})

	app.delete('/api/v1/reviews', async function deleteAll(req, res) {
		await app.reviewsService.deleteAll(req)
		res.status(HTTP_NO_CONTENT).end()

		var msg = JSON.stringify({
			"type" : "delete",
		});
		publisher.publish(MSG_URL, QUEUE, msg);
	})

	app.get('/api/v1/sleep', async function sleep(req, res) {
            await app.reviewsService.sleep(req.db)
			let now = new Date();
			return res.type("text/plain").send(`Sleep time is over: ${now.toLocaleTimeString()}`)
	})
};