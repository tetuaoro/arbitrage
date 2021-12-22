const minify = require('@node-minify/core')
const jsonminify = require('@node-minify/jsonminify')
const fs = require('fs')

function zion(dir) {
	fs.readdirSync(`${__dirname}/${dir}`, { withFileTypes: true }).forEach((fileOrDir) => {
		if (fileOrDir.isDirectory()) zion(`${dir}/${fileOrDir.name}`)

		if (fileOrDir.isFile() && fileOrDir.name.endsWith('.json'))
			minify({
				compressor: jsonminify,
				input: `${__dirname}/${dir}/${fileOrDir.name}`,
				output: `${__dirname}/${dir}/${fileOrDir.name}`,
				callback: function (err, min) {
					if (err) console.error(err)
				},
			})
	})
}

;(() => {
	console.log('Minify files start')
	zion('build')
})()
