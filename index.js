const bodyParser = require('body-parser')
const express = require('express')
const fnv32 = require('fnv32')
const fs = require('fs')
const multipart = require('connect-multiparty')

const storedChecksumValues = new Set()
const multipartMiddleware = (
	multipart({
		autoFiles: true,
	})
)

express()
.use(
	express
	.static('./')
)
.use(
	bodyParser
	.json()
)
.get(
	'/',
	(req, res) => {
		res
		.send(
			fs
			.readFileSync(
				'./index.html',
				{ encoding: 'utf-8' }
			)
		)
	}
)
.post(
	'/checksumValues',
	(req, res) => {
		const { checksumValues } = req.body

		console.log(
			'checksumValues',
			checksumValues,
		)

		res
		.send(
			checksumValues
			.filter(checksum => (
				storedChecksumValues
				.has(checksum)
			))
		)
	}
)
.post(
	'/file',
	multipartMiddleware,
	(req, res) => {
		console.log('files', req.files)

		res.send('saved')

		// fnv32
		// .fnv_1a(
		// 	req
		// 	.body
		// 	.blob
		// )
	}
)
.listen(
	3000,
	() => (
		console.log('Web Server started on port [3000]...')
	)
)
