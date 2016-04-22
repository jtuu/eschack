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
					except: ['Blocking', 'Item', 'Creature', 'Player', 'Wall', 'Enemy']
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
					'dist/eschack.css': 'src/eschack.scss',
					'dist/ui.css': 'src/ui.scss'
				}
			}
		},
		autoprefixer: {
			options: {
			},
			dist: {
				files: {
					'dist/eschack.css': 'dist/eschack.css',
					'dist/ui.css': 'dist/ui.css'
				}
			}
		},
		pug: {
			compile: {
				options: {
					data: function(dest, src){
						return require('./todo.json')
					}
				},
				files: {
					'index.html': ['src/eschack.jade']
				}
			}
		},
		puglint: {
			index: {
				options: {
					preset: 'clock'
				},
				src: ['src/index.jade']
			}
		},
		prettify: {
			options: {
				indent: 1,
				indent_char: '\t',
				indent_scripts: 'normal',
				wrap_line_length: 0,
				brace_style: 'collapse',
				preserve_newlines: true,
				max_preserve_newlines: 20,
				unformatted: ['pre']
			},
			one: {
				src: 'index.html',
				dest: 'index.html'
			}
		},
		watch: {
			html: {
				files: ['src/eschack.jade', 'todo.json'],
				tasks: ['html']
			},
			sass: {
				files: ['src/eschack.scss', 'src/ui.scss'],
				tasks: ['css']
			},
			js: {
				files: ['src/eschack.js'],
				tasks: ['js']
			}
		},
		copy: {
			index: {
				src: 'index.html',
				dest: 'build/index.html'
			},
			dist: {
				expand: true,
				src: 'dist/*',
				dest: 'build/'
			}
		},
		surge: {
			'eschack': {
				options: {
					project: 'build/',
					domain: 'eschack.surge.sh'
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-pug');
	grunt.loadNpmTasks('grunt-puglint');
	grunt.loadNpmTasks('grunt-prettify');
	grunt.loadNpmTasks('grunt-sass');
	grunt.loadNpmTasks('grunt-autoprefixer');
	grunt.loadNpmTasks('grunt-eslint');
	grunt.loadNpmTasks('grunt-babel');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-surge');
	
	grunt.registerTask('html', ['puglint', 'pug', 'prettify']);
	grunt.registerTask('css', ['sass', 'autoprefixer']);
	grunt.registerTask('js', ['eslint', 'babel', 'uglify']);
	
	grunt.registerTask('default', ['html', 'css', 'js']);
	
	grunt.registerTask('predeploy', ['default', 'copy:index', 'copy:dist']);
	grunt.registerTask('deploy', ['predeploy', 'surge']);
};