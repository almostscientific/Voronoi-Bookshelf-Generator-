var bbox;
var vorDig
var seedGeo=new THREE.Geometry()
var seeds
var polygonLines, vertexSpheres;
var polyObjs
var verts
var border
var Vec2D = toxi.geom.Vec2D,
    Vec3D= toxi.geom.Vec3D,
    ToxiclibsSupport = toxi.processing.ToxiclibsSupport,
    Ellipse = toxi.geom.Ellipse,
    Circle = toxi.geom.Circle,
    Polygon2D = toxi.geom.Polygon2D,
    Rect = toxi.geom.Rect,
    Triangle2D = toxi.geom.Triangle2D,
    Line2D = toxi.geom.Line2D;
var border;//=new Border()


function doVoronoi(){
  border=new Border()
  seeds=new Seeds();
  
  border.add(new THREE.Vector3(-700,-600,0))
  border.add(new THREE.Vector3(-600,-700,0))
  border.add(new THREE.Vector3(700,-700,0))
  border.add(new THREE.Vector3(700,700,0))
  border.add(new THREE.Vector3(-500,400,0))
  
  // seeds.addSeed(new THREE.Vector3(100.0192,-200,0))
  // seeds.addSeed(new THREE.Vector3(500,25,0))
  // seeds.addSeed(new THREE.Vector3(-100,-100,0))
  // seeds.addSeed(new THREE.Vector3(-400,200,0))
  // seeds.addSeed(new THREE.Vector3(-300,200,0))
  // seeds.addSeed(new THREE.Vector3(-200,200,0))
  
  computeVoronoi()

  if(seeds.getSeedsNumber()==0){
    border.render()
  }
  seeds.renderSeeds()
}

var Seeds = function(){
  this.seedGeo=new THREE.Geometry();
  this.meshes=new Array()
  this.getSeedsNumber = function(){
    return this.seedGeo.vertices.length;
  }
  this.addSeed=function(v){
    this.seedGeo.vertices.push(v)
  }
  this.renderSeeds = function(){
    for (var i = 0; i < this.seedGeo.vertices.length; i++) {
      var geometry = new THREE.SphereGeometry( 10,50,50 );
      var seed = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color: 0xffffff } ) );
      seed.position.x = this.seedGeo.vertices[i].x;
      seed.position.y = this.seedGeo.vertices[i].y;
      seed.position.z = this.seedGeo.vertices[i].z;
      seed.name='seed'
      scene.add( seed );
    }
  }
  this.updateSeedGeo = function(){
    this.seedGeo=new THREE.Geometry()
    // console.log("childre len",scene.children.length)
    for (var i = 0; i < scene.children.length; i++) {
      var child = scene.children[i]
      if(child.name=="seed"){
        // console.log("seed num",this.seedGeo.vertices.length)
        this.seedGeo.vertices.push(new THREE.Vector3( child.position.x,child.position.y,child.position.z))

      }
    };

  }
}

var Border = function(){
  this.borderGeo=new THREE.Geometry();
  this.borderPoly=new Polygon2D()
  this.clipArray= new Array()
  this.add=function(v){
    this.borderGeo.vertices.push(v)
    this.borderPoly.add(new Vec3D(v.x,v.y,v.z))
    // this.update()
  }
  this.makeClipArray=function(){
    this.clipArray=[]
    for (var i = 0; i < this.borderGeo.vertices.length; i++) {
      this.clipArray.push([this.borderGeo.vertices[i].x,this.borderGeo.vertices[i].y])
    }
  }
  this.render=function(){
    var renderGeo=new THREE.Geometry()
    renderGeo.vertices=[]
    for (var i = 0; i < this.borderGeo.vertices.length; i++) {
      renderGeo.vertices.push(this.borderGeo.vertices[i].clone())
    };
    renderGeo.vertices.push(this.borderGeo.vertices[0].clone())

    line = new THREE.Line( renderGeo, 
    new THREE.LineBasicMaterial( { color: 0x00ffff, linewidth: 5 } ) );//blue
    scene.add(line);

  }
}

function computeVoronoi () {
  // console.log(seeds.seedGeo.vertices.length)
	var voronoi = new Voronoi();
  bbox = {xl:-1400,xr:1400,yt:-1000,yb:1000};
  // console.log("seeds.seedGeo.vertices len",seeds.seedGeo.vertices.length)
	vorDig = voronoi.compute(seeds.seedGeo.vertices, bbox);
  ////////////
  /////// POLYOBJECT
  //////////////
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
      // console.log("buildClippedPoly points in",points.length)
      for (var i = 0; i < points.length; i++) {
        // console.log(points[i][0])
        this.clippedPolyGeo.vertices.push(new THREE.Vector3(points[i][0],points[i][1],0))
      };
      this.clippedPolyGeo.vertices.push(new THREE.Vector3(points[0][0],points[0][1],0))
      // console.log("buildClippedPoly clip",points.length)

    }

  }
// console.log("cellLen",vorDig.cells.length)
/////////////
/////BUILD POLY OBJECTS
//////////////
  polyObjs=new Array();//an array of polyObjs
  for (var i = 0; i < vorDig.cells.length; i++) {
    var po=new polyObj();
    polyObjs.push(po)
    polyObjs[i].geo=new THREE.Geometry();
    var thisCell=vorDig.cells[i]
    for (var j = 0; j < thisCell.halfedges.length; j++) {
      var HEax=thisCell.halfedges[j].edge.va.x
      var HEay=thisCell.halfedges[j].edge.va.y
      var HEbx=thisCell.halfedges[j].edge.vb.x
      var HEby=thisCell.halfedges[j].edge.vb.y
      polyObjs[i].geo.vertices.push(new THREE.Vector3(HEax, HEay, 0))
      polyObjs[i].geo.vertices.push(new THREE.Vector3(HEbx, HEby, 0))
    };
    polyObjs[i].geo.mergeVertices();
    polyObjs[i].site=new THREE.Vector3(thisCell.site.x,thisCell.site.y,0);
    polyObjs[i].sortCW()
    polyObjs[i].geo.vertices.push(polyObjs[i].geo.vertices[0])
  };

/////////////////////////
//////Draws the  Orginal Voronoi
/////////////////////////
  for (var i = 0; i < vorDig.edges.length; i++) {
   var a=vorDig.edges[i].va
   var b=vorDig.edges[i].vb
   var lineGeo = new THREE.Geometry()
   lineGeo.vertices.push(new THREE.Vector3(a.x,a.y,-10))
   lineGeo.vertices.push(new THREE.Vector3(b.x,b.y,-10))
   line = new THREE.Line( lineGeo, 
         new THREE.LineBasicMaterial( { color: 0x00ff00, linewidth: 4 } ) );
   // scene.add(line);
  };


/////////////////////
/// VORONOI CLIPPING/////////
////////////
/////////DRAW POLYGON LINES
/////////////
  scene.remove(polygonLines)
  polygonLines=new THREE.Object3D();
  for (var i = 0; i < polyObjs.length; i++) {
    polyObjs[i].makeClipArray()
    ///clip
    border.makeClipArray()
    var clipedPoly=clip(polyObjs[i].clipArray,border.clipArray)
    polyObjs[i].buildClippedPoly(clipedPoly)
    var pLine
    pLine = new THREE.Line( polyObjs[i].clippedPolyGeo, 
            new THREE.LineBasicMaterial( { color: 0xffff00, linewidth: 4 } ) );
    polygonLines.add(pLine);
  };
  scene.add(polygonLines)

  ////////////////////
  /////BUILD AND RENDER Verts
  ////////////////////
  buildVerts()
  scene.remove(vertexSpheres)
  vertexSpheres=new THREE.Object3D();

  for (var i = 0; i < verts.length; i++) {
    var v=verts[i].v;
    var geometry = new THREE.SphereGeometry( 15,50,50 );
    var vSphere = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color: 0xff00ff } ) );
    vSphere.position.x = v.x;
    vSphere.position.y = v.y;
    vSphere.position.z = v.z;
    vSphere.name='vertex'
    vertexSpheres.add( vSphere );
  }
  scene.add(vertexSpheres)

 
}

////////////////
////////////////
////////////////
////////////////


function buildVerts(){
  ////////////////////
  /////VERT OBJECT
  ////////////////////
  var Vert = function(){
    this.v=new THREE.Vector3()
    this.edgeV=new Array()

    this.cleanEdgeV = function(){
      var dupe;
      for (var i = 0; i < this.edgeV.length; i++) {
        var ev =this.edgeV[i]
        if (ev.equals(this.v)){
        dupe=i
            this.edgeV.splice(dupe,1)
            return

        }
      };
    }
  }
  ////////////////////
  /////BUILD VERTS
  ////////////////////
  verts=new Array()
  for (var i = 0; i < polyObjs.length; i++) {
     var poly = polyObjs[i]
     for (var j = 0; j < poly.clippedPolyGeo.vertices.length; j++) {
       var nVerts=poly.clippedPolyGeo.vertices.length
       // console.log("thisV", roundVector(poly.clippedPolyGeo.vertices[j]) )

       var thisV=roundVector(poly.clippedPolyGeo.vertices[j])
       var nextV=roundVector(poly.clippedPolyGeo.vertices[(j+1)%nVerts])
       // console.log("idx",j, nVerts,(j+1)%nVerts, (j+nVerts-1)%nVerts )
       var prevV=roundVector(poly.clippedPolyGeo.vertices[(j+nVerts-1)%nVerts])

       var vertexPresent=false
       var nextVPresent=false
       var prevVPresent=false
       // console.log("verts len",verts.length)

       if (verts.length>0){

         for (var k = 0; k < verts.length; k++) {//for all the verts
          // console.log("ack",k)
           var thisVert=verts[k]
           if(thisVert.v.equals(thisV)){ //if this vert is the one we are adding
            vertexPresent=true;
              for (var l = 0; l < thisVert.edgeV.length; l++) {
                var thisEdgeV=thisVert.edgeV[l];
                if(thisEdgeV.equals(nextV)){
                  nextVPresent=true
                }
                if(thisEdgeV.equals(prevV)){
                  prevVPresent=true
                }
              }
              if(!nextVPresent && !nextV.equals(thisV)){
                thisVert.edgeV.push(nextV)
              }
              if(!prevVPresent && !prevV.equals(thisV)){
                thisVert.edgeV.push(prevV)
              }
            }
          };

        if(!vertexPresent){
          var newVert=new Vert()
          newVert.v=thisV
          newVert.edgeV.push(nextV)
          newVert.edgeV.push(prevV)
          verts.push(newVert)
         }
       }else{
        //else this is the first vertex
         var newVert=new Vert()
         // newVert.v=thisV
         newVert.edgeV.push(nextV)
         newVert.edgeV.push(prevV)
         verts.push(newVert)
       }
     };
  };

  for (var i = 0; i < verts.length; i++) {
      verts[i].cleanEdgeV()
  }


}

function roundVector (v){
  var precision=1
  v.setX( Math.floor((v.x)*precision)/precision )
  v.setY( Math.floor((v.y)*precision)/precision )
  v.setZ( Math.floor((v.z)*precision)/precision )
  return v
}

function clip (subjectPolygon, clipPolygon) {
  // http://rosettacode.org/wiki/Sutherland-Hodgman_polygon_clipping#JavaScript

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
                  // console.log("       inside")
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
    // console.log("outputlist",outputList)
    return outputList
}
