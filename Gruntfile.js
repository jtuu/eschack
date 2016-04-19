module.exports = function(grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		eslint: {
			options: {
				configFile: 'src/eslint.json'
			},
			target: ['src/rl.js']
		},
		babel: {
			options: {
				sourceMap: true,
				presets: ['es2015', 'es2015-loose', 'stage-3']
			},
			dist: {
				files: {
					'src/rl-babel.js': 'src/rl.js'
				}
			},
		},
		uglify: {
			options: {
				banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
				sourceMap: true,
				mangle: {
					except: ['Player', 'Wall', 'Enemy']
				},
				compress: {
					unsafe: true,
					dead_code: true,
					conditionals: true,
					comparisons: true,
					booleans: true,
					loops: true,
					unused: true,
					warnings: true,
					negate_iife: true,
					pure_getters: true,
					drop_console: true,
					keep_fargs: false,
					if_return: true,
					screw_ie8: true
				}
			},
			build: {
				src: 'src/rl-babel.js',
				dest: 'dist/rl.min.js'
			}
		},
		sass: {
			options: {
				sourceMap: true
			},
			dist: {
				files: {
					'dist/rl.css': 'src/rl.scss'
				}
			}
		},
		autoprefixer: {
			options: {
			},
			dist: {
				files: {
					'dist/rl.css': 'dist/rl.css'
				}
			}
		},
		pug: {
			compile: {
				options: {
					data: {
						debug: false
					}
				},
				files: {
					'index.html': ['src/rl.jade']
				}
			}
		},
		watch: {
			html: {
				files: ['src/rl.jade'],
				tasks: ['html']
			},
			sass: {
				files: ['src/rl.scss'],
				tasks: ['css']
			},
			js: {
				files: ['src/rl.js'],
				tasks: ['js']
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-pug');
	grunt.loadNpmTasks('grunt-sass');
	grunt.loadNpmTasks('grunt-autoprefixer');
	grunt.loadNpmTasks('grunt-eslint');
	grunt.loadNpmTasks('grunt-babel');
	grunt.loadNpmTasks('grunt-contrib-uglify');

	
	grunt.registerTask('html', ['pug'])
	grunt.registerTask('css', ['sass', 'autoprefixer']);
	grunt.registerTask('js', ['eslint', 'babel', 'uglify']);

};