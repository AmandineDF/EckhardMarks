class Parallax {
  constructor(intensity, smoothing) {
    this.intensity = intensity;
    this.smoothing = smoothing;

    this.mouse = { x: -1, y: -1 };
    this.mouseDelta = { x: 0, y: 0 };

    this.currentDelta = { x: 0, y: 0 };

    this.queryElements(); //targeted elements

    window.addEventListener("mousemove", event => {
      this.mouse = { x: event.clientX, y: event.clientY };
      let origin = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
      this.mouseDelta = {
        x: event.clientX - origin.x,
        y: event.clientY - origin.y
      };
    });

    this.update();
  }

  getMovement() {
    return {
      x: -this.currentDelta.x * this.intensity,
      y: -this.currentDelta.y * this.intensity
    };
  }

  queryElements() {
    this.elements = document.querySelectorAll("[data-depth]");
  }

  update() {
    this.currentDelta.x +=
      (this.mouseDelta.x - this.currentDelta.x) * this.smoothing;
    this.currentDelta.y +=
      (this.mouseDelta.y - this.currentDelta.y) * this.smoothing;
    let p = this.getMovement();
    this.elements.forEach(element => {
      let depth = element.getAttribute("data-depth");
      let target = { x: p.x * depth, y: p.y * depth };
      TweenMax.set(element, {
        x: target.x + "px",
        y: target.y + "px",
        force3D: true
      });
    });
  }
}

let parallax = new Parallax(0.3, 0.05);

function update() {
  parallax.update();
  requestAnimationFrame(update);
}

window.onload = function() {
  setTimeout(function(){
    var loader = TweenMax.to(".loader",0.5,{opacity:0});
    scroll();
    update();
  },500);

  //WEBGL

  var scene = new THREE.Scene();

  var camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );
  camera.position.z = 10;

  var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight /*updateStyle*/);
  document.body.appendChild(renderer.domElement); //create a <canvas> element

  let canvas = document.querySelector("canvas");
  canvas.height = window.innerHeight;
  canvas.width = window.innerWidth;

  window.onresize = function() {
    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;
  };

  //LIGHTS

  var light = new THREE.PointLight(0xffffff, 20, 100);
  light.position.set(0, 85, 25);
  scene.add(light);

  var ambientLight = new THREE.AmbientLight(0xdedede);
  scene.add(ambientLight);

  //CONTROLS
  var controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.campingFactor = 0.25;
  controls.enableZoom = false;

  //OBJ
  var objLoader = new THREE.OBJLoader();
  objLoader.setPath("obj/");

  var objMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    wireframe: true
  });

  objLoader.load(
    "submariner.obj",
    function(object) {
      object.traverse(function(node) {
        if (node.isMesh) node.material = objMaterial;
      });

      object.position.set(0, 0, 0);
      object.scale.set(6.5, 6.5, 6.5);

      scene.add(object);
    },
    function(xhr) {
      console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
    },
    function(error) {
      console.log("An error happened");
    }
  );

  function animate() {
    requestAnimationFrame( animate );
    renderer.render( scene, camera );
  }
  animate();

}

//CHANGE SCROLL SPEED
let scrollSpeed = 1.2;

function scroll(){
  let index = 0;
  let canWheel = true;

  TweenMax.set(window,{scrollTo: 0});

  let nbPage = document.querySelectorAll("section").length;

  //INIT TRACKER
  if(document.querySelector(".tracker") !== null){
    for(let i = 0; i<nbPage; i++)
    {
      let div = document.createElement("div");
      document.querySelector(".tracker").append(div);
    }
  }  

  function setIndex(newIndex){

    if(canWheel){
      if(newIndex >= 0 && newIndex < nbPage){
        index = newIndex;
      }else{
        return;
      }

      canWheel = false;
      setTimeout(()=>{ canWheel = true },2000);
      let tween = TweenMax.to(window, scrollSpeed ,{scrollTo: index * window.innerHeight, ease: Power3.easeOut});
      tween.eventCallback("onStart",function(){
        animation(index);
      });
    }
   
  }

  //ANIMATIONS
  let tl = new TimelineMax();
  function animation(index){
    let query = `section:nth-of-type(${index+1})`;

    //FORCE PREVIOUS TIMELINE TO FINISH
    tl.totalProgress(1).kill();

    tl = new TimelineMax();

    if(index == 0)
      tl.delay(1);
    if(document.querySelector(query + " .line") !== null)
      tl.from(query + " .line",1,{scaleX:0});

    tl.add("START");

    if(document.querySelector(query + " h2") !== null)
      tl.from(query + " h2",1,{scale:0.5,opacity:0},"START");
    
    if(document.querySelector(query + " h3") !== null)
      tl.from(query + " h3",1,{opacity:0, delay: 0.5},"START");

    if(document.querySelector(query + " .firstpageBg") !== null)
      tl.from(query + " .firstpageBg",1,{opacity:0, delay: 0.5},"START");

    if(document.querySelector(query + " .background, " + query + " .slicedbg") !== null)
      tl.from(query + " .background, " + query + " .slicedbg",1,{scale:2,opacity:0},"START");
  
    tl.add("IMAGE");
  
    if(document.querySelector(query + " .themetitle") !== null)
      tl.from(query + " .themetitle",1,{opacity:0},"IMAGE");
  
    if(document.querySelector(query + " .rollimg") !== null)
      tl.from(query + " .rollimg", .5,{scaleY: 0, delay: .3, ease: Power3.easeOut},"IMAGE");
  
    tl.add("CONTENT","-=0.3");
    if(document.querySelector(query + " .content") !== null)
      tl.from(query + " .content",1,{opacity:0},"CONTENT");
  
    if(document.querySelector(query + " .appearlast") !== null)
      tl.from(query + " .appearlast",1,{opacity:0,delay:0.3},"CONTENT");


    //SET CURRENT TRACKER DOT
    if(document.querySelector(".tracker") !== null){
      document.querySelectorAll(".tracker div").forEach(function(element){
        element.classList.remove("active");
      });
      document.querySelector(`.tracker div:nth-of-type(${index+1})`).classList.add("active");
    }
  
  }

  //SCROLL
  window.onwheel = function(e){
    e.preventDefault();
    setIndex(index + Math.sign(e.deltaY));
  }

  //TRACKER CLICKS
  if(document.querySelector(".tracker") !== null){
    document.querySelectorAll(".tracker div").forEach(function(element){
      element.onclick = function(){
          var index = 0;
          node = element;
          while ( (node = node.previousElementSibling) ) {
              index++;
          }

          setIndex(index);
      }
    });
  }

  setIndex(0);
}





