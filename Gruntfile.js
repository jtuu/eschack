module.exports = function(grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		'depend-concat':{
			depends_doctag: {
				options: {
					method: {
						type: 'doctag',
						tag: 'depends'
					}
				},
				src: ['src/js/**/*.js'],
				dest: 'misc/eschack.js'
			}
		},
		concat: {
			dist: {
				src: ['misc/eschack.js'],
				dest: 'misc/eschack.js',
				options: {
					banner: '(function(global){\n "use strict";\n',
					footer: '\n}(window));'
				}
			}
		},
		eslint: {
			options: {
				configFile: 'misc/eslint.json'
			},
			target: ['misc/eschack.js']
		},
		babel: {
			options: {
				sourceMap: true,
				presets: ['es2015', 'es2015-loose', 'stage-3']
			},
			dist: {
				files: {
					'misc/eschack-babel.js': 'misc/eschack.js'
				}
			},
		},
		uglify: {
			options: {
				banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
				sourceMap: true,
				mangle: {
					except: ['Blocking', 'Item', 'Weapon', 'Armor', 'Creature', 'Player', 'Wall', 'Enemy', 'Jackalope', 'Honeybadger', 'Corpse', 'Redcap', 'Stair']
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
				src: 'misc/eschack-babel.js',
				dest: 'dist/eschack.min.js'
			}
		},
		sass: {
			options: {
				sourceMap: true
			},
			dist: {
				files: {
					'dist/eschack.css': 'src/scss/eschack.scss',
					'dist/ui.css': 'src/scss/ui.scss'
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
						return require('./src/jade/todo.json')
					}
				},
				files: {
					'index.html': ['src/jade/eschack.jade']
				}
			}
		},
		puglint: {
			index: {
				options: {
					preset: 'clock'
				},
				src: ['src/jade/index.jade']
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
				files: ['src/jade/*'],
				tasks: ['html']
			},
			sass: {
				files: ['src/scss/*'],
				tasks: ['css']
			},
			js: {
				files: ['src/js/**/*'],
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
	grunt.loadNpmTasks('grunt-depend-concat');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-eslint');
	grunt.loadNpmTasks('grunt-babel');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-surge');
	
	grunt.registerTask('html', ['puglint', 'pug', 'prettify']);
	grunt.registerTask('css', ['sass', 'autoprefixer']);
	grunt.registerTask('js', ['depend-concat', 'concat', 'eslint', 'babel', 'uglify']);
	
	grunt.registerTask('default', ['html', 'css', 'js']);
	
	grunt.registerTask('predeploy', ['default', 'copy:index', 'copy:dist']);
	grunt.registerTask('deploy', ['predeploy', 'surge']);
};