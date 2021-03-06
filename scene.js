(function($, THREE, root) {

	"use strict";

	function component(options) {
		var _this = this;
		options = options || {};
		this.container = options.container || $('body');
		this.width = options.width || this.container.width();
		this.height = options.height || this.container.height();
		this.renderer = options.renderer || new THREE.WebGLRenderer({alpha:true});
		this.scene = new THREE.Scene();
		this.camera = options.camera || new THREE.PerspectiveCamera(75, this.width / this.height, 0.01, 1000);
		this.controls = options.controls !== undefined ? options.controls : new THREE.OrbitControls(this.camera);
		this.id = options.id;
		this.class = options.class;
		this.render = options.render === undefined ? true : options.render;
		if (options.stats){
			var stats = new Stats();
		}
		if (options.datGUI){
			this.datGUI = new dat.GUI();
		}
		this.animate = function() {};
		this.init = function() {
			this.renderer.setSize(this.width, this.height);
			this.container.append(this.renderer.domElement);
			if (this.id) this.renderer.domElement.id = this.id;
			if (this.class) $(this.renderer.domElement).addClass(this.class);
			if (options.stats){
				this.container.append(stats.dom);
			}
			if (this.renderer.setClearColor){
				this.renderer.setClearColor(0x000000);
			}
			this.camera.position.z = 5;
			$(root).on('resize', resize);
			if (this.render){
				render();
			}
			return this;
		};
		this.update = function() {
			this.renderer.render(this.scene, this.camera);
		};
		function render() {
			requestAnimationFrame(render);
			if (options.stats){
				stats.update();
			}
			if (typeof TWEEN !== 'undefined'){
				TWEEN.update();
			}
			if (typeof _this.controls === 'object'){
				_this.controls.update();
			}
			_this.animate();
			_this.update();
		}
		function resize() {
			_this.width = _this.container.width();
			_this.height = _this.container.height();
			_this.renderer.setSize(_this.width, _this.height);
			_this.camera.aspect = _this.width / _this.height;
			_this.camera.updateProjectionMatrix();
		}
	};

	Object.assign(component.prototype, {
		Shape:function(geometry, material) {
			var material = material || new THREE.MeshBasicMaterial({wireframe:true});
			var geometry = geometry || new THREE.BoxGeometry();
			var mesh = new THREE.Mesh(geometry, material);
			this.scene.add(mesh);
			return mesh;
		},
		Shader:function(geometry, options) {
			options = options || {};
			var material = new THREE.ShaderMaterial({
				uniforms:options.uniforms || {},
				vertexShader:[
					stringifyShaderChunk(options.vertexParameters),
					'void main(){',
					stringifyShaderChunk(options.vertexInit),
					'#include <begin_vertex>',
					stringifyShaderChunk(options.vertexPosition),
					'#include <project_vertex>',
					'}'
				].join('\n'),
				fragmentShader:[
					stringifyShaderChunk(options.fragmentParameters),
					'void main(){',
					'vec4 diffuseColor = vec4(1.0);',
					stringifyShaderChunk(options.fragmentDiffuse),
					'gl_FragColor = diffuseColor;',
					'}'
				].join('\n'),
				wireframe:true
			});
			return this.Shape(geometry, material);
		},
		Points:function(geometry, material) {
			var material = material || new THREE.PointsMaterial({size:0.1});
			var geometry = geometry || new THREE.BoxGeometry();
			var points = new THREE.Points(geometry, material);
			this.scene.add(points);
			return points;
		},
		PointsShader:function(geometry, options){
			options = options || {};
			var uniforms = options.uniforms || {};
			uniforms.size = uniforms.size || {value:1};
			var material = new THREE.ShaderMaterial({
				uniforms:uniforms,
				vertexShader:[
					'uniform float size;',
					stringifyShaderChunk(options.vertexParameters),
					'void main(){',
					stringifyShaderChunk(options.vertexInit),
					'#include <begin_vertex>',
					stringifyShaderChunk(options.vertexPosition),
					'#include <project_vertex>',
					'float pointSize = size;',
					stringifyShaderChunk(options.pointSize),
					'gl_PointSize = pointSize;',
					'}'
				].join('\n'),
				fragmentShader:[
					stringifyShaderChunk(options.fragmentParameters),
					'void main(){',
					'vec4 diffuseColor = vec4(1.0);',
					stringifyShaderChunk(options.fragmentDiffuse),
					'gl_FragColor = diffuseColor;',
					'}'
				].join('\n')
			});
			return this.Points(geometry, material);
		},
		Line:function(geometry) {
			var material = new THREE.LineBasicMaterial();
			var geometry = geometry || new THREE.BoxGeometry();
			var lines = new THREE.Line(geometry, material);
			this.scene.add(lines);
			return lines;
		},
		LineSegments:function(geometry) {
			var material = new THREE.LineBasicMaterial();
			var geometry = geometry || new THREE.BoxGeometry();
			var lines = new THREE.LineSegments(geometry, material);
			this.scene.add(lines);
			return lines;
		},
		Light:function(type) {
			var light = type || new THREE.SpotLight();
			light.position.set(10, 10, 10);
			this.scene.add(light);
			return light;
		},
		CameraLight:function() {
			var light = new THREE.SpotLight();
			this.scene.add(light);
			light.parent = this.camera;
			return light;
		},
		AxesHelper:function(size) {
			var axesHelper = new THREE.AxesHelper(size);
			this.scene.add(axesHelper);
			return axesHelper;
		},
		Vector3Helper:function(vectors, size) {
			vectors = Array.isArray(vectors) ? vectors : [vectors];
			size = size || 0.1;
			var _this = this;
			$.each(vectors, function(i, vector){
				_this.Shape(new THREE.OctahedronGeometry(size))
				.position.copy(vector);
			});
		},
		add:function(object) {
			var scene = this.scene;
			$.each(arguments, function(i, obj) {
				scene.add(obj);
			});
			return this.scene;
		},
		GUI:function(object, keys, options) {
			if (!this.datGUI || !object) return;
			var gui = this.datGUI;
			keys = keys || Object.keys(object);
			options = options || {};
			var min = options.min !== undefined ? options.min : -10;
			var max = options.max !== undefined ? options.max : 10;
			var step = options.step !== undefined ? options.step : 0.1;
			var names = options.names || [];
			var onChanges = options.onChanges || [];
			$.each(keys, function(i, key) {
				var obj = gui.add(object, key, min, max, step);
				if (names[i]){
					obj.name(names[i]);
				}
				if (Array.isArray(onChanges) && onChanges[i]){
					obj.onChange(onChanges[i]);
				} else if (typeof onChanges === 'function'){
					obj.onChange(onChanges);
				}
			});
			return this.datGUI;
		}
	});

	function stringifyShaderChunk(value) {

		var shaderChunk;

		if (!value){
			shaderChunk = '';
		} else if (typeof value === 'string'){
			shaderChunk = value;
		} else {
			shaderChunk = value.join('\n');
		}

		return shaderChunk;

	}

	window.D3SCENE = function(options) {
		return new component(options).init();
	};

})(jQuery, THREE, window);
