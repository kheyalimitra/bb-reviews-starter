'use strict';
const HTTP_NO_CONTENT = 204
const HTTP_CREATED = 201
const HTTP_CONFLICT = 409

module.exports = function (app) {

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
		await app.reviewsService.getAverageRating(reviewee_email)
		res.status(HTTP_CREATED).location(req.body.component_name).end()
	})

	app.delete('/api/v1/reviews', async function deleteAll(req, res) {
		await app.reviewsService.deleteAll(req)
		res.status(HTTP_NO_CONTENT).end()
	})

	app.get('/api/v1/sleep', async function sleep(req, res) {
		await app.reviewsService.sleep(req.db)
		let now = new Date();
		return res.type("text/plain").send(`Sleep time is over: ${now.toLocaleTimeString()}`)
	})
};