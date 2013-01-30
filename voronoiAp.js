
function buildV () {

	var voronoi = new Voronoi();
	var bbox = {xl:-800,xr:800,yt:-800,yb:800};
	var vertices = [{x:-100, y:-200}, {x:50, y:250}, {x:400, y:100}, {x:123, y:28}, {x:550, y:222} /* , ... */];
	// a 'vertex' is an object exhibiting 'x' and 'y' properties. The
	// Voronoi object will add a unique 'voronoiId' property to all
	// vertices. The 'voronoiId' can be used as a key to lookup the
	// associated cell in 'diagram.cells'.
	var diagram = voronoi.compute(vertices, bbox);
  // console.log(diagram.cells[0])

  var polyObj=function(){
    this.site
    this.geo
    this.clipArray=new Array();
    this.clippedPolyGeo=new THREE.Geometry();


    this.sortCW = function(){
      var tmpVerts=new Array()
      for (var i = 0; i < this.geo.vertices.length; i++) {
        //centers
          this.geo.vertices[i].sub(this.site)
        }; 

      this.geo.vertices.sort(cw)
      function cw(a,b){
        var center=new THREE.Vector3(0,0,0)
        if (a.x >= 0 && b.x < 0){
                    return 1;}
        if (a.x == 0 && b.x == 0){
                    return a.y > b.y;}
        // compute the cross product of vectors (center -> a) x (center -> b)
        var det = (a.x-center.x) * (b.y-center.y) - (b.x - center.x) * (a.y - center.y);
        if (det < 0){
                    return 1;}
        if (det > 0){
                    return -1;
        }
        // points a and b are on the same line from the center
        // check which point is closer to the center
        var d1 = (a.x-center.x) * (a.x-center.x) + (a.y-center.y) * (a.y-center.y);
        var d2 = (b.x-center.x) * (b.x-center.x) + (b.y-center.y) * (b.y-center.y);
        return d1 > d2;
      }

      for (var i = 0; i < this.geo.vertices.length; i++) {
        //recenters
        this.geo.vertices[i].add(this.site)
        }; 
    }

    this.makeClipArray = function(){
      for (var i = 0; i < this.geo.vertices.length; i++) {
        this.clipArray.push([this.geo.vertices[i].x,this.geo.vertices[i].y]);
      };
    }
    this.buildClippedPoly = function(points){
      console.log("buildClippedPoly points in",points.length)
      for (var i = 0; i < points.length; i++) {
        console.log(points[i][0])
        this.clippedPolyGeo.vertices.push(new THREE.Vector3(points[i][0],points[i][1],0))
      };
      this.clippedPolyGeo.vertices.push(new THREE.Vector3(points[0][0],points[0][1],0))
      console.log("buildClippedPoly clip",points.length)

    }

  }
  var origPolys=new Array();//an array of polyObjs

  for (var i = 0; i < diagram.cells.length; i++) {
    var po=new polyObj();
    origPolys.push(po)
    origPolys[i].geo=new THREE.Geometry();
    var thisCell=diagram.cells[i]
    for (var j = 0; j < thisCell.halfedges.length; j++) {
      var HEax=thisCell.halfedges[j].edge.va.x
      var HEay=thisCell.halfedges[j].edge.va.y
      var HEbx=thisCell.halfedges[j].edge.vb.x
      var HEby=thisCell.halfedges[j].edge.vb.y
      origPolys[i].geo.vertices.push(new THREE.Vector3(HEax, HEay, 0))
      origPolys[i].geo.vertices.push(new THREE.Vector3(HEbx, HEby, 0))
    };
    origPolys[i].geo.mergeVertices();
    origPolys[i].site=new THREE.Vector3(thisCell.site.x,thisCell.site.y,0);
    origPolys[i].sortCW()
    origPolys[i].geo.vertices.push(origPolys[i].geo.vertices[0])
  };

    // origPolys[0].sortCW()


  var pLine
  pLine = new THREE.Line( origPolys[0].geo, 
          new THREE.LineBasicMaterial( { color: 0xff6600, linewidth: 4 } ) );
          scene.add(pLine);


	var line;
	for (var i = 0; i < diagram.edges.length; i++) {
		var a=diagram.edges[i].va
		var b=diagram.edges[i].vb
		var lineGeo = new THREE.Geometry()
		lineGeo.vertices.push(new THREE.Vector3(a.x,a.y,-10))
		lineGeo.vertices.push(new THREE.Vector3(b.x,b.y,-10))
        line = new THREE.Line( lineGeo, 
        new THREE.LineBasicMaterial( { color: 0x00ff00, linewidth: 4 } ) );
        scene.add(line);
		// scene.add(line)
		// console.log("scene",scene)
	};

	// grid = new THREE.Mesh( new THREE.PlaneGeometry( 100, 100, 100, 100 ), new THREE.MeshBasicMaterial( { color: 0x00ff00, wireframe: true } ) );
	// // gridLevel=drawer.rectangles[drawer.rectangles.length-1].z+1;
	// // grid.translateZ(100);
	// var pos=new THREE.Vector3(200,200,-10)
	// grid.position=pos
	// // console.log("pos",grid.position)

	// grid.name='GRID';
	// scene.add( grid );
	// grid.visible=false

	var particles = new THREE.Geometry();
	var pMaterial =
	      new THREE.ParticleBasicMaterial({
	        color: 0x66ff00,
	        size: 20
	      });
	for (var i = 0; i < vertices.length; i++) {
	      	var pv=new THREE.Vector3(vertices[i].x,vertices[i].y,0)
	      	particles.vertices.push(pv)
	      };      

	 var particleSystem =
	  new THREE.ParticleSystem(
	    particles,
	    pMaterial);
	  scene.add(particleSystem)

// /////////////////////
// //////TEST CLIPPING///
// ///////////////////////////
//   var subjectPolygon = [[-50, -150], [-200, -50], [-350, -150], [-350, -300], [-250, -300], [-200, -250], [-150, -350], [-100, -250], [-100, -200]];
//   // var subjectPolygon=[[-700,-700],[-700,500],[500,500],[500,-500]]
//   var subPolyGeo=new THREE.Geometry();
//   for (var i = 0; i < subjectPolygon.length; i++) {
//   	subPolyGeo.vertices.push(new THREE.Vector3(subjectPolygon[i][0],subjectPolygon[i][1],100))
//   };
//   subPolyGeo.vertices.push(new THREE.Vector3(subjectPolygon[0][0],subjectPolygon[0][1],100))
//   line = new THREE.Line( subPolyGeo, 
//   new THREE.LineBasicMaterial( { color: 0xff00ff, linewidth: 4 } ) );//purple
//   scene.add(line);

//   var clipPolygon = [[-20, -100], [-320, -200], [-300, -300], [-90, -300]];
//   // var  clipPolygon=[[-900,-900],[-900,100],[400,100],[400,-900]]
//   var clipPolyGeo=new THREE.Geometry();
//   for (var i = 0; i < clipPolygon.length; i++) {
//   	// console.log("ack",subjectPolygon[i][1],subjectPolygon[i][2])
//   	clipPolyGeo.vertices.push(new THREE.Vector3(clipPolygon[i][0],clipPolygon[i][1],100))
//   };
//   clipPolyGeo.vertices.push(new THREE.Vector3(clipPolygon[0][0],clipPolygon[0][1],100))
//   line = new THREE.Line( clipPolyGeo, 
//   new THREE.LineBasicMaterial( { color: 0x0000ff, linewidth: 4 } ) );//blue
//   scene.add(line);

//   // var clippedPolygon = clip(clipPolygon, subjectPolygon);
//   var clippedPolygon = clip(subjectPolygon, clipPolygon);

//   var clippedPolyGeo=new THREE.Geometry();
//   for (var i = 0; i < clippedPolygon.length; i++) {
//   	clippedPolyGeo.vertices.push(new THREE.Vector3(clippedPolygon[i][0],clippedPolygon[i][1],100))
//   };
//   clippedPolyGeo.vertices.push(new THREE.Vector3(clippedPolygon[0][0],clippedPolygon[0][1],100))
//   line = new THREE.Line( clippedPolyGeo, 
//   new THREE.LineBasicMaterial( { color: 0xff0000, linewidth: 4 } ) );//red
//   scene.add(line);

/////////////////////
  /// VORONOI CLIPPING/////////
//////////////////////
  // var border=[[-700,-700],[700,-700],[700,700],[-700,700]]
  var border=[[-700,-600],[-600,-700],[700,-700],[700,700],[-500,400]]
  var borderGeo=new THREE.Geometry()
  for (var i = 0; i < border.length; i++) {
    borderGeo.vertices.push(new THREE.Vector3(border[i][0],border[i][1],0))
  };
  borderGeo.vertices.push(new THREE.Vector3(border[0][0],border[0][1],0))

  line = new THREE.Line( borderGeo, 
  new THREE.LineBasicMaterial( { color: 0x00ffff, linewidth: 4 } ) );//blue
  scene.add(line);

  // var test=[[-700,-700],[-700,500],[500,500],[500,-500]]
  // var testGeo=new THREE.Geometry()
  // for (var i = 0; i < test.length; i++) {
  //   testGeo.vertices.push(new THREE.Vector3(test[i][0],test[i][1],0))
  // };
  // testGeo.vertices.push(new THREE.Vector3(test[0][0],test[0][1],0))

  // line = new THREE.Line( testGeo, 
  // new THREE.LineBasicMaterial( { color: 0x0000ff, linewidth: 4 } ) );//blue
  // scene.add(line);


  for (var i = 0; i < origPolys.length; i++) {
    // var i=2
    origPolys[i].makeClipArray()
    ///clip
    // var clipedPoly=clip(test,border)
    var clipedPoly=clip(origPolys[i].clipArray,border)

    // console.log("border ",border)
    // console.log("polyObj ",origPolys[i].clipArray)

    origPolys[i].buildClippedPoly(clipedPoly)
    var pLine
    // console.log(origPolys[i].clippedPolyGeo.vertices)
    pLine = new THREE.Line( origPolys[i].clippedPolyGeo, 
            new THREE.LineBasicMaterial( { color: 0xffff00, linewidth: 4 } ) );
    scene.add(pLine);

  };
  // for (var i = 0; i < origPolys.length; i++) {
  //   origPolys[i].makeClipArray()
  //   ///clip
  //   var clipedPoly=clip(origPolys[i].clipArray,border)
  //   console.log("border ",border)
  //   console.log("polyObj ",origPolys[i].clipArray)

  //   origPolys[i].buildClippedPoly(clipedPoly)

  // };

  // var pLine
  // // console.log(origPolys[i].clippedPolyGeo.vertices)
  // pLine = new THREE.Line( origPolys[i].clippedPolyGeo, 
  //         new THREE.LineBasicMaterial( { color: 0xffff00, linewidth: 4 } ) );
  // scene.add(pLine);


}

function clip (subjectPolygon, clipPolygon) {
  // http://rosettacode.org/wiki/Sutherland-Hodgman_polygon_clipping#JavaScript
console.log("inclip sub",subjectPolygon)
console.log("inclip clip",clipPolygon)
    var cp1, cp2, s, e;
    var inside = function (p) {
        return (cp2[0]-cp1[0])*(p[1]-cp1[1]) > (cp2[1]-cp1[1])*(p[0]-cp1[0]);
    };
    var intersection = function () {
        var dc = [ cp1[0] - cp2[0], cp1[1] - cp2[1] ],
            dp = [ s[0] - e[0], s[1] - e[1] ],
            n1 = cp1[0] * cp2[1] - cp1[1] * cp2[0],
            n2 = s[0] * e[1] - s[1] * e[0], 
            n3 = 1.0 / (dc[0] * dp[1] - dc[1] * dp[0]);
        return [(n1*dp[0] - n2*dc[0]) * n3, (n1*dp[1] - n2*dc[1]) * n3];
    };
    var outputList = subjectPolygon;
    cp1 = clipPolygon[clipPolygon.length-1];
    for (j in clipPolygon) {
        var cp2 = clipPolygon[j];
        var inputList = outputList;
        outputList = [];
        s = inputList[inputList.length - 1]; //last on the input list
        for (i in inputList) {
            var e = inputList[i];
            if (inside(e)) {
                if (!inside(s)) {
                  console.log("       inside")
                    outputList.push(intersection());
                }
                outputList.push(e);
            }
            else if (inside(s)) {
                outputList.push(intersection());
            }
            s = e;
        }
        cp1 = cp2;
    }
    console.log("outputlist",outputList)
    return outputList
}
