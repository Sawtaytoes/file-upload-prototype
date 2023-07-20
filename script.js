const getUploadedChecksums = checksumValues => (
	fetch(
		'/checksumValues',
		{
			body: (
				JSON
				.stringify({
					checksumValues,
				})
			),
			headers: {
				'Content-Type': 'application/json',
			},
			method: 'POST',
		}
	)
	.then(response => (
		response
		.json()
	))
	.catch(console.error)
)

const dispatchPreviouslyUploadedFiles = fileInfos => uploadedChecksums => {
	const filesToUpload = (
		fileInfos
		.filter(({ checksumValue }) => (
			!(
				uploadedChecksums
				.find(uploadedChecksum => (
					uploadedChecksum === checksumValue
				))
			)
		))
		.map(({ file }) => (
			file
		))
	)

	const previouslyUploadedFiles = (
		uploadedChecksums
		.map(uploadedChecksum => (
			fileInfos
			.find(({ checksumValue }) => (
				checksumValue === uploadedChecksum
			))
			.file
			.name
		))
		.map(fileName => (
			`<li>${fileName}</li>`
		))
	)

	uploadedChecksums
	.length > 0
	&& (
		document
		.getElementById('previously-uploaded-files')
		.innerHTML = (`
			<h2>
				Previously Uploaded Files
			</h2>
			<ul>
				${previouslyUploadedFiles}
			</ul>
		`)
	)

	return filesToUpload
}

const getVideoSizes = files => (
	Promise
	.all(
		Array
		.from(files)
		.map(file => ({
			type: file.type,
			url: (
				console.log(file)||
				URL
				.createObjectURL(file)
			),
		}))
		.map(({ type, url }) => {
			const videoElement = (
				document
				.createElement('video')
			)

			videoElement
			.type = type

			videoElement
			.src = url

			return videoElement
		})
		.map(videoElement => (
			new Promise(resolve => {
				const intervalId = (
					setInterval(() => {
						if (
							videoElement
							.duration
						) {
							clearInterval(
								intervalId
							)

							resolve(
								videoElement
								.duration
							)
						}
					})
				)
			})
		))
		.reduce(
			(promises, promise) => (
				promises
				.concat(promise)
			),
			[],
		)
	)
	.then(videoDurations => (
		console.log({videoDurations})||
		videoDurations
		.map(videoDuration => (
			videoDuration / 60
		))
		.reduce((total, fileSize) => (
			console.log({total})||
			console.log({fileSize})||
			total + fileSize
		))
	))
)

const sendFiles = files => (
	files
	.length > 0
	&& (
		document
		.getElementById('newly-uploaded-files')
		.innerHTML = (`
			<h2>
				Newly Uploaded Files
			</h2>
			<ul id="newly-uploaded-files-list"></ul>
		`)
	)
	&& (
		files
		.reduce(
			(promise, file) => {
				const formData = (
					new FormData()
				)

				formData
				.append(
					'files',
					file,
					file.name,
				)

				return (
					promise
					.then(
						fetch(
							'/file',
							{
								body: formData,
								method: 'POST',
							}
						)
						.then(() => (
							document
							.getElementById('newly-uploaded-files-list')
							.innerHTML = (`
								${
									document
									.getElementById('newly-uploaded-files-list')
									.innerHTML
								}
								<li>${file.name}</li>
							`)
						))
						.catch(console.error)
					)
				)
			},
			Promise.resolve(),
		)
	)
)

const getFileInfo = (file, callback) => {
	// const checksum = (
	// 	new Checksum('fnv32')
	// )

	const reader = new FileReader()

	reader
	.addEventListener(
		'loadend',
		({ currentTarget }) => {
			// checksum
			// .updateStringly(
			// 	currentTarget
			// 	.result
			// )

			// const checksumValue = (
			// 	checksum
			// 	.result
			// 	.toString(16)
			// )

			// console.log({
			// 	checksumValue,
			// 	name: file.name,
			// })

			callback({
				// checksumValue,
				// content: (
				// 	currentTarget
				// 	.result
				// ),
				file,
			})
		}
	)

	reader
	.readAsText(file)
}

window
.uploadFiles = () => {
	let fileInfos = []

	const { files } = (
		document
		.querySelector('[name="files"]')
	)

	Array
	.from(
		files
	)
	.forEach(file => (
		getFileInfo(
			file,
			fileInfo => {
				fileInfos
				.push(fileInfo)

				if (fileInfos.length === files.length) {
					// fileInfos = (
					// 	Array
					// 	.from(
					// 		new Set(
					// 			fileInfos
					// 			.map(({ checksumValue }) => (
					// 				checksumValue
					// 			))
					// 		)
					// 	)
					// 	.map(deduplicatedChecksumValue => (
					// 		fileInfos
					// 		.find(({ checksumValue }) => (
					// 			checksumValue === deduplicatedChecksumValue
					// 		))
					// 	))
					// )

					document
					.getElementById('number-of-duplicates')
					.innerHTML = (
						'Number of duplicate images: '
						.concat(files.length - fileInfos.length)
					)

					Promise
					.resolve(
						files
						// fileInfos
						// .map(({ checksumValue }) => (
						// 	checksumValue
						// ))
					)
					// .then(getUploadedChecksums)
					// .then(
					// 	dispatchPreviouslyUploadedFiles(
					// 		fileInfos
					// 	)
					// )
					.then(getVideoSizes)
					// .then(sendFiles)
					.then(console.log)
					.catch(console.error)
				}
			}
		)
	))
}
