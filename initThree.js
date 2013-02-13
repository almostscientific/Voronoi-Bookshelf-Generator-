var container;
var camera, controls, scene, renderer;
var grid;
var mouse3D=new THREE.Vector3();
var projector, ray;
var intersected
var SELECTED
var plane
offset = new THREE.Vector3()
var Vec2D = toxi.geom.Vec2D,
    Vec3D= toxi.geom.Vec3D,
    ToxiclibsSupport = toxi.processing.ToxiclibsSupport,
    Ellipse = toxi.geom.Ellipse,
    Circle = toxi.geom.Circle,
    Polygon2D = toxi.geom.Polygon2D,
    Rect = toxi.geom.Rect,
    Triangle2D = toxi.geom.Triangle2D,
    Line2D = toxi.geom.Line2D,
    TriangleMesh = toxi.geom.mesh.TriangleMesh;

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
    plane = new THREE.Mesh( new THREE.PlaneGeometry( 2000, 2000, 8, 8 ), new THREE.MeshBasicMaterial( { color: 0xff0000, opacity: 0.25, transparent: true, wireframe: true } ) );
    plane.name="PLANE"
    plane.visible = false;
    scene.add( plane );
    // setUpParticles();
	// buildV();
    doVoronoi()


}

function animate() {
	requestAnimationFrame( animate, camera);
	controls.update();
	render(); 
}

function render() {
    // var vector = new THREE.Vector3( mouse3D.x, mouse3D.y, 1 );
    // projector.unprojectVector( vector, camera );
    // var raycaster = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );
    // var intersects = raycaster.intersectObjects( scene.children );

    // if ( intersects.length > 0 ) {
    //     //if we have intersected something
    //     if ( intersected != intersects[ 0 ].object ) {
    //         //if we have intersected something new
    //         //update intersected
    //         intersected = intersects[ 0 ].object;
    //     }
    // } else {
    //     // we have not intersected anything
    //     intersected = null;
    // }
    // console.log(intersected)
    // if(SELECTED != null && SELECTED.name=="seed"){
    //     console.log("SELECTED naed seed",SELECTED)
    //     seeds.updateSeedGeo()
    //     computeVoronoi()
    // }

	renderer.render( scene, camera );
}
// function getRealIntersector( intersects ) {
//                 console.log("GRI")

//     for( i = 0; i < intersects.length; i++ ) {
//         intersector = intersects[ i ];
//         // if ( intersector.object != rollOverMesh ) {
//             return intersector;
//         // }
//     }
//     return null;
// }

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
    renderer.setClearColor( 0xff2222, 1 );
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

    var vector = new THREE.Vector3( mouse3D.x, mouse3D.y, 0.5 );
    projector.unprojectVector( vector, camera );

    var raycaster = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );

    var intersects = raycaster.intersectObjects( scene.children );

    if ( intersects.length > 0 ) {

        controls.enabled = false;

        SELECTED = intersects[ 0 ].object;

        var intersects = raycaster.intersectObject( plane );
        offset.copy( intersects[ 0 ].point ).sub( plane.position );

        container.style.cursor = 'move';
        console.log(intersects[ 0 ].point)
        if(SELECTED.name=="PLANE"){
            // console.log("ADD",vector)
            // console.log(mouse3D)
            console.log(seeds.seedGeo.vertices.length)
            var pointVec=new THREE.Vector3(intersects[ 0 ].point.x,intersects[ 0 ].point.y,0)
            pointVec=roundVector(pointVec)
            console.log(pointVec)
            seeds.addSeed(pointVec)
            seeds.renderSeeds()

            // seeds.updateSeedGeo()
            computeVoronoi()


        }

    }


}


function onDocumentMouseMove( event ) {
    event.preventDefault();
    mouse3D.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse3D.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    var vector = new THREE.Vector3( mouse3D.x, mouse3D.y, 0.5 );
    projector.unprojectVector( vector, camera );
    var raycaster = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );

    if ( SELECTED ) {
        var intersects = raycaster.intersectObject( plane );
        SELECTED.position.copy( intersects[ 0 ].point.sub( offset ) );
        // SELECTED.Geometry.vertex.x=SELECTED.position.x
        // SELECTED.y=SELECTED.position.y
        // SELECTED.z=SELECTED.position.z
        // seedGeo.vericesNeesNeedUpdate
        if(SELECTED.name=="seed"){
            seeds.updateSeedGeo()
            computeVoronoi()
        }
        return;
    }

    var intersects = raycaster.intersectObjects( scene.children );
    if ( intersects.length > 0 ) {
        // console.log(intersects.length)
        if ( intersected != intersects[ 0 ].object ) {
            intersected = intersects[ 0 ].object;
            plane.position.copy( intersected.position );
            plane.lookAt( camera.position );
        }
        container.style.cursor = 'pointer';
    } else {
        if ( intersected ) intersected.material.color.setHex( intersected.currentHex );
        intersected = null;
        container.style.cursor = 'auto';

    }
}

function onDocumentMouseUp( event ) {

    event.preventDefault();

    controls.enabled = true;

    if ( intersected ) {
        plane.position.copy( intersected.position );
        SELECTED = null;
    }

    container.style.cursor = 'auto';}
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
