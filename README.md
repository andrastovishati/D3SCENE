# D3SCENE
Easy THREEJS scene setup.

## Usage

```javascript
// Create a new scene.
var D3 = D3SCENE({
  container:$('#scene')
});
// Create a new mesh, and add to the scene.
var shape = D3.Shape();
shape.position.x = 1;
```

## Dependencies

### required
THREE.js
jQuery.js
### optional
TWEEN.js
OrbitControls.js
stats.js
dat.GUI.js
