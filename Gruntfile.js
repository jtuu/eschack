module.exports = function(grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		eslint: {
			options: {
				configFile: 'src/eslint.json'
			},
			target: ['src/eschack.js']
		},
		babel: {
			options: {
				sourceMap: true,
				presets: ['es2015', 'es2015-loose', 'stage-3']
			},
			dist: {
				files: {
					'src/eschack-babel.js': 'src/eschack.js'
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
				src: 'src/eschack-babel.js',
				dest: 'dist/eschack.min.js'
			}
		},
		sass: {
			options: {
				sourceMap: true
			},
			dist: {
				files: {
					'dist/eschack.css': 'src/eschack.scss'
				}
			}
		},
		autoprefixer: {
			options: {
			},
			dist: {
				files: {
					'dist/eschack.css': 'dist/eschack.css'
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
					'index.html': ['src/eschack.jade']
				}
			}
		},
		watch: {
			html: {
				files: ['src/eschack.jade'],
				tasks: ['html']
			},
			sass: {
				files: ['src/eschack.scss'],
				tasks: ['css']
			},
			js: {
				files: ['src/eschack.js'],
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