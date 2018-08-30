const bodyParser = require('body-parser')
const express = require('express')
const fnv32 = require('fnv32')
const fs = require('fs')
const multiparty = require('multiparty')

const storedChecksumValues = (
	fs
	.existsSync(
		'./.storedChecksumValues.json',
	)
	? (
		new Set(
			require('./.storedChecksumValues.json')
		)
	)
	: new Set()
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
	(req, res) => {
		const form = (
			new multiparty
			.Form({
				uploadDir: './uploads',
			})
		)

		form
		.parse(
			req,
			(error, fields, { files }) => {
				const [file] = files

				if (error) {
					console
					.error(error)

					res
					.status(500)

					res
					.send('Error writing file.')
				}
				else {
					res
					.send('File successfully uploaded.')

					fs
					.readFile(
						file.path,
						{ encoding: 'utf-8' },
						(error, content) => {
							const checksum = (
								fnv32
								.fnv_1(content)
								.toString(16)
							)

							console.log('Stored checksum:', checksum)

							storedChecksumValues
							.add(checksum)

							fs
							.writeFile(
								'./.storedChecksumValues.json',
								(
									JSON
									.stringify(
										Array
										.from(storedChecksumValues)
									)
								),
								{ encoding: 'utf-8' },
								error => (
									error
									&& console.error(error)
								)
							)
						}
					)
				}
			}
		)
	}
)
.listen(
	3000,
	() => (
		console.log('Web Server started on port [3000]...')
	)
)
