'use strict';

const gulp = require('gulp');
const eslint = require('gulp-eslint');

gulp.task('clean', () => {
  return del(['build/']);
});

// task to run es lint.
gulp.task('lint', () =>
  gulp.src(['*.js', '*/**/*.js', '!test/**', '!build/**', '!node_modules/**', '!ext/**'])
    .pipe(eslint())
    .pipe(eslint.format())
);

gulp.task('build', gulp.series('clean', 'lint'));
gulp.task('default', gulp.series('lint'));
