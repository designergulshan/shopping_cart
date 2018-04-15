'use strict';

// Required Modules
const autoprefixer = require('gulp-autoprefixer');
const browserify = require('browserify');
const browserSync = require('browser-sync');
const del = require('del');
const gulp = require('gulp');
const pump = require('pump');
const reload = browserSync.reload;
const sass = require('gulp-sass');
const source = require('vinyl-source-stream');
const uglify = require('gulp-uglify');
const uglifycss = require('gulp-uglifycss');
const vbuffer = require("vinyl-buffer");

// Scripts Task
gulp.task('scripts', () =>
    browserify({
        entries: 'src/js/main.js',
        debug: true
    })
        .transform("babelify", { presets: ["es2015"] })
        .bundle()
        .pipe(source('bundle.js'))
        .pipe(vbuffer())
        .pipe(gulp.dest('src/js'))
        .pipe(reload({ stream: true }))
);

// Sass Task
gulp.task('sass', () =>
    gulp.src('src/sass/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer('last 4 versions'))
        .pipe(gulp.dest('src/css'))
        .pipe(reload({ stream: true }))
);

// HTML Task
gulp.task('html', () =>
    gulp.src('src/index.html')
        .pipe(reload({ stream: true }))
);

// Browser-Sync Task
gulp.task('browser-sync', () =>
    browserSync({
        server: {
            baseDir: './src/'
        }
    })
);

// Watch Tasks
gulp.task('watch', () => {
    gulp.watch('src/js/!(bundle.js)', ['scripts']);
    gulp.watch('src/sass/**', ['sass']);
    gulp.watch('src/index.html', ['html']);
    gulp.watch('src/templates/**', ['scripts']);
    gulp.watch('src/data/**', ['scripts']);
});

// Build Task
gulp.task('build', () =>
    // delete old build folder if present
    del(['dist']).then(() =>
        // create new build directory for all files
        gulp.src('src/**/*/')
            .pipe(gulp.dest('dist/'))
            .on('end', () => {
                // remove unwanted build files   
                del([
                    'dist/sass',
                    'dist/js/!(bundle.js)'
                ])
                // uglify js
                pump([
                    gulp.src('dist/js/bundle.js'),
                    uglify(),
                    gulp.dest('dist/js')
                ]);
                // uglify css
                pump([
                    gulp.src('dist/css/styles.css'),
                    uglifycss(),
                    gulp.dest('dist/css')
                ]);
            })
    )
);

// Default Task
gulp.task('default', ['scripts', 'sass', 'html', 'browser-sync', 'watch']);