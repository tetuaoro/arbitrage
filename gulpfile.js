const { src, dest, series } = require('gulp')
const terser = require('gulp-terser')

function minifyJS() {
	return src('build/*.js')
		.pipe(
			terser({
				toplevel: true,
			})
		)
		.pipe(dest('build'))
}

exports.default = series(minifyJS)
