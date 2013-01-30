var container;
var camera, controls, scene, renderer;
var grid;
// var isCtrlDown=false, isShiftDown=false;

function threeINIT() {
	setUpCamera();
	setUpControls();
	setUpWorld();
	setUpLights();
	setUpRenderer();
	container = document.getElementById( 'container' );
	container.appendChild( renderer.domElement );
	window.addEventListener( 'resize', onWindowResize, false );
    document.addEventListener( 'mousemove', onDocumentMouseMove, false );
    document.addEventListener( 'mousedown', onDocumentMouseDown, false );
    document.addEventListener( 'keydown', onDocumentKeyDown, false );
    document.addEventListener( 'keyup', onDocumentKeyUp, false );
    document.addEventListener( 'mouseup', onDocumentMouseUp, false );
    projector = new THREE.Projector();
    // setUpParticles();
	buildV();


}

function animate() {
	requestAnimationFrame( animate, camera);
	controls.update();
	render(); 
}

function render() {
    // ray = projector.pickingRay( mouse3D.clone(), camera );
    // var intersects = ray.intersectObjects( scene.children );
    // if ( intersects.length > 0 ) {
    //     intersector = getRealIntersector( intersects );
    //     if ( intersector ) {
    //         setVoxelPosition( intersector );
    //         rollOverMesh.position = voxelPosition;
    //     }
    // }
	renderer.render( scene, camera );
}

function setUpCamera () {
    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.z = 1500;
}
function setUpControls () {
    controls = new THREE.TrackballControls( camera );
    controls.rotateSpeed = 1.0;
    controls.zoomSpeed = 0.1;
    controls.panSpeed = 0.8;
    controls.noZoom = false;
    controls.noPan = false;
    controls.noRotate = false;
    controls.staticMoving = false;
    controls.dynamicDampingFactor = 0.3;
    controls.keys = [ 65, 83, 68 ];
    controls.addEventListener( 'change', render );
}
function setUpWorld () {
    scene = new THREE.Scene();
    // scene.fog = new THREE.Fog( 0xffffff );           
    // scene.fog = new THREE.FogExp2( 0xffffff, 0.002 );           
}
function setUpLights () {
    light = new THREE.DirectionalLight( 0xffffff );
    light.position.set( 1, 1, 1 );
    scene.add( light );

    light = new THREE.DirectionalLight( 0x002288 );
    light.position.set( -1, -1, -1 );
    scene.add( light );

    light = new THREE.AmbientLight( 0x222222 );
    scene.add( light );
}
function setUpRenderer () {
    renderer = new THREE.WebGLRenderer( { antialias: false } );
    renderer.setClearColor( 0x222222, 1 );
    renderer.setSize( window.innerWidth, window.innerHeight );
}
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
    controls.handleResize();
    render();
}

function onDocumentMouseDown( event ) {
    event.preventDefault();

}


function onDocumentMouseMove( event ) {
	// console.log(( event.clientX ),event.clientY )
    event.preventDefault();
}

function onDocumentMouseUp( event ) {
    event.preventDefault();
    mouseDown=false;
}
function onDocumentKeyDown( event ) {

    switch( event.keyCode ) {

        // case 16: isShiftDown = true; break;
        // case 17: isCtrlDown = true; break;
        // case 68: isPanDown = true; break;
        // case 90: isMoveDown =true; break; //Z
        // case 65: isDrawDown =true; break; //A
        // case 27: isEscapeDown = true; deselectAll(); break; //escape
        // case 79: isOutputDown = true; output(); break; //O

    }

}

function onDocumentKeyUp( event ) {

    switch( event.keyCode ) {

        // case 16: isShiftDown = false; break;
        // case 17: isCtrlDown = false; break;
        // case 68: isPanDown = false; break;
        // case 90: isMoveDown =false; break;
        // case 65: isDrawDown =false; break;
        // case 27: isEscapeDown = false; break;
        // case 79: isOutputDown = false; break;



    }
}
