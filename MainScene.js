/**
 * Created by rpatrick on 6/19/16.
 */

function mainScene() {
    if (!Detector.webgl) Detector.addGetWebGLMessage();

    Physijs.scripts.worker = 'physijs_worker.js';
    Physijs.scripts.ammo = 'ammo.js';

    THREE.Cache.enabled = true;

    var BoxMaterial;

    var loader;
    var g_Geometry;// = new THREE.Geometry();

    var container, hex, color;
    var rPass;
    var refractionCube;

    var box = [];
    var boxIndex = 0;

    var camera, cameraTarget, scene, renderer;

    var group, textMesh1, textMesh2, textGeo, material;

    var firstLetter = true;

    var delta = 0.01;
    var composerScene, composer1, renderScene, stats;


    var text = "CIS 371 Pig Dice",

        height = 20,
        size = 70,
        hover = 30,

        curveSegments = 4,

        bevelThickness = 2,
        bevelSize = 1.5,
        bevelSegments = 3,
        bevelEnabled = true,

        font = undefined,

        fontName = "droid/droid_sans", // helvetiker, optimer, gentilis, droid sans, droid serif
        fontWeight = "bold"; // normal bold

    var mirror = false;

    var fontMap = {

        "helvetiker": 0,
        "optimer": 1,
        "gentilis": 2,
        "droid/droid_sans": 3,
        "droid/droid_serif": 4

    };

    var weightMap = {

        "regular": 0,
        "bold": 1

    };

    var reverseFontMap = [];
    var reverseWeightMap = [];

    for (var i in fontMap) reverseFontMap[fontMap[i]] = i;
    for (var i in weightMap) reverseWeightMap[weightMap[i]] = i;

    var targetRotation = 0;
    var targetRotationOnMouseDown = 0;

    var mouseX = 0;
    var mouseXOnMouseDown = 0;

    var windowHalfX = window.innerWidth / 2;
    var windowHalfY = window.innerHeight / 2;

    var fontIndex = 1;
    var tLoader;
    var refractSphere;
    var groundMirror;
    var boxFriction=.99;
    var boxRestitution=.7;
    var groundFriction=.99;
    var groundRestitution=.6;
    var textureLoader = new THREE.TextureLoader();
    var displacementMap = textureLoader.load( "displacement.jpg" );
    var normalMap = textureLoader.load( "normal.jpg" );
    var aoMap = textureLoader.load( "ao.jpg" );

    init();
    animate();

    function decimalToHex(d) {

        var hex = Number(d).toString(16);
        hex = "000000".substr(0, 6 - hex.length) + hex;
        return hex.toUpperCase();

    }

    Physijs.scripts.worker = 'physijs_worker.js';
    Physijs.scripts.ammo = 'ammo.js';

    function init() {

        container = document.createElement('div');
        document.body.appendChild(container);

        BoxMaterial = Physijs.createMaterial(
            //new THREE.MeshPhongMaterial( { color: 0xffffff, specular: 0x111111, shininess: 200}),
            new THREE.MeshPhongMaterial({
                color: 0x660000, specular: 0x888888, shininess: 250,// refractionRatio: 10.1,
                //new THREE.MeshLambertMaterial( { color: 0x660000, specular: 0x888888, shininess: 250,
                //envMap: refractionCube, refractionRatio: 0.85,
                //h: 0, s: 0, l: 1,
                opacity: 1.0,
                premultipliedAlpha: true,
                transparent: true
            }),
            boxFriction,
            boxRestitution
        );

        loader = new THREE.STLLoader();
        g_Geometry = new THREE.Geometry();
        loader.load('./dado1b.stl', function (geometry) {
            //'use strict';
            //g_Geometry=geometry;
            g_Geometry.fromBufferGeometry(geometry);
            if (g_Geometry.faces.length == 0 || g_Geometry.faces.length === undefined) {
                alert("no geometry");
            }
            else {
                //alert("inside loader faces: "+g_Geometry.faces.length);
            }
            g_Geometry.scale(20, 20, 20);
            //alert("faces: "+g_Geometry.faces.length);
        });
        function waitSome() {
            try {
                var test = g_Geometry.faces.length;
            }
            catch (err) {
                setTimeout(waitSome, 50);
            }
        }
        waitSome();
        g_Geometry.
        //alert("faces: "+geometry2.faces.length);
        //var geometry3=new THREE.Geometry();
        //geometry3.fromBufferGeometry(geometry);
        //alert("geo faces length: "+geometry2.faces.length);
        //geometry2.normalize();
        //geometry2.normalize();
        //geometry2.normalize();
        //geometry2.normalize();
        //geometry2.normalize();

        /*var path = "three_js_master/examples/textures/cube/SwedishRoyalCastle/";
         var format = '.jpg';
         var urls = [
         path + 'px' + format, path + 'nx' + format,
         path + 'py' + format, path + 'ny' + format,
         path + 'pz' + format, path + 'nz' + format
         ];

         var cubeTextureLoader = new THREE.CubeTextureLoader();

         refractionCube = cubeTextureLoader.load( urls );
         refractionCube.format = THREE.RGBFormat;
         refractionCube.mapping = THREE.CubeRefractionMapping;*/

        // CAMERA

        camera = new THREE.PerspectiveCamera(45/*30*/, window.innerWidth / window.innerHeight, 1, 1500);
        camera.position.set(0, 400, 700);
        //camera.position.set( 0, 75, 160 );

        cameraTarget = new THREE.Vector3(0, 150, 0);

        // SCENE

        //scene = new THREE.Scene();
        scene = new Physijs.Scene({fixedTimeStep: 1 / 120});
        scene.setGravity(new THREE.Vector3(0, -1050, 0));
        scene.addEventListener(
            'update',
            function () {
                scene.simulate(undefined, 1);
                //physics_stats.update();
            }
        );
        scene.fog = new THREE.Fog(0x000000, 250, 1400);

        // LIGHTS

        var dirLight = new THREE.DirectionalLight(0xffffff, 0.525);
        dirLight.position.set(0, 0, 1).normalize();
        scene.add(dirLight);

        var pointLight = new THREE.PointLight(0xffffff, 1.5);
        pointLight.position.set(0, 100, 90);
        scene.add(pointLight);

        // Get text from hash

        var hash = document.location.hash.substr(1);

        if (hash.length !== 0) {

            var colorhash = hash.substring(0, 6);
            var fonthash = hash.substring(6, 7);
            var weighthash = hash.substring(7, 8);
            var bevelhash = hash.substring(8, 9);
            var texthash = hash.substring(10);

            hex = colorhash;
            pointLight.color.setHex(parseInt(colorhash, 16));

            fontName = reverseFontMap[parseInt(fonthash)];
            fontWeight = reverseWeightMap[parseInt(weighthash)];

            bevelEnabled = parseInt(bevelhash);

            text = decodeURI(texthash);

        } else {

            //pointLight.color.setHSL( Math.random(), 1, 0.5 );
            pointLight.color.setHSL(0.5, 1, 1.0);
            hex = decimalToHex(pointLight.color.getHex());

        }

        material = new THREE.MultiMaterial([
            new THREE.MeshPhongMaterial({color: 0xffffff, shading: THREE.FlatShading}), // front
            new THREE.MeshPhongMaterial({color: 0xffffff, shading: THREE.SmoothShading}) // side
        ]);

        group = new THREE.Group();
        group.position.y = 100;

        scene.add(group);

        loadFont();

        var width = window.innerWidth;
        var height = window.innerHeight;

        // RENDERER

        renderer = new THREE.WebGLRenderer({antialias: true});
        //renderer.autoClearColor = false;
        //renderer.sortObjects = false;

        //renderer.autoClear = false;
        renderer.gammaInput = true;
        renderer.gammaOutput = true;

        // MIRROR planes
        groundMirror = new THREE.Mirror(renderer, camera, {
            color: 0x777777,
            clipBias: 0.003,
            textureWidth: width,
            textureHeight: height
        });

        var ground_material = Physijs.createMaterial(
            //new THREE.MeshBasicMaterial( { color: 0xffffff, opacity: 0.5, transparent: true } ),
            groundMirror.material,
            groundFriction, // high friction
            groundRestitution // low restitution
        );

        var plane = new Physijs.BoxMesh(
            //var plane = new Physijs.Mesh(
            //var plane = new THREE.Mesh(
            //new THREE.PlaneBufferGeometry( 10000, 10000 ),
            new THREE.BoxGeometry(10000, 10000, 1),
            //new THREE.MeshBasicMaterial( { color: 0xffffff, opacity: 0.5, transparent: true } ),
            ground_material,
            0
        );
        plane.position.y = 100;
        //plane.rotation.x = Math.PI / 2;
        plane.rotateX(-Math.PI / 2);
        // 				//plane.rotation.x = -.11;// Math.PI / 2;

        tLoader = new THREE.TextureLoader();

        var planeGeo = new THREE.Mesh(
            new THREE.BoxGeometry(10000, 1, 10000),
            new THREE.MeshBasicMaterial({color: 0x151515, opacity: 0.45, transparent: true})//grey
            //new THREE.MeshBasicMaterial( { color: 0x330000, opacity: 0.45, transparent: true } )//red
        );
        planeGeo.position.y = 101;

        plane.add(groundMirror);
        scene.add(plane);
        scene.add(planeGeo);

        /*var mirrorMesh = new THREE.Mesh( planeGeo, groundMirror.material );
         mirrorMesh.add( groundMirror );
         mirrorMesh.rotateX( - Math.PI / 2 );
         mirrorMesh.position.y = 100;
         scene.add( mirrorMesh );  */

        renderer.setClearColor(scene.fog.color);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        container.appendChild(renderer.domElement);

        var rtParameters = {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBFormat,
            stencilBuffer: true
        };

        var shaderVignette = THREE.VignetteShader;
        var effectVignette = new THREE.ShaderPass(shaderVignette);
        effectVignette.uniforms["offset"].value = 0.95;
        effectVignette.uniforms["darkness"].value = 1.6;
        effectVignette.renderToScreen = true;

        var effectHBlur = new THREE.ShaderPass(THREE.HorizontalBlurShader);
        var effectVBlur = new THREE.ShaderPass(THREE.VerticalBlurShader);
        effectHBlur.uniforms['h'].value = 2 / ( width / 2 );
        effectVBlur.uniforms['v'].value = 2 / ( height / 2 );

        var clearMask = new THREE.ClearMaskPass();
        var renderMask = new THREE.MaskPass(scene, camera);
        var renderMaskInverse = new THREE.MaskPass(scene, camera);

        renderMaskInverse.inverse = true;

        var effectFilmBW = new THREE.FilmPass(0.35, 0.5, 2048, true);

        /*var sphereGeom =  new THREE.SphereGeometry( 80, 64, 32 );
         refractSphereCamera = new THREE.CubeCamera( 0.1, 5000, 512 );
         scene.add( refractSphereCamera );

         refractSphereCamera.renderTarget.mapping = THREE.CubeRefractionMapping;

         var refractMaterial = new THREE.MeshBasicMaterial( {
         color: 0xccccff,
         envMap: refractSphereCamera.renderTarget,
         refractionRatio: 0.985,
         reflectivity: 0.9
         } );

         refractSphere = new THREE.Mesh( sphereGeom, refractMaterial );
         refractSphere.position.set(0,200,100);
         refractSphereCamera.position = refractSphere.position;
         scene.add(refractSphere); */

        rPass = new THREE.RenderPass(scene, camera);
        rPass.clear = false;

        composerScene = new THREE.EffectComposer(renderer, new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, rtParameters));
        composerScene.addPass(rPass);
        //composerScene.addPass( effectVBlur );
        //composerScene.addPass( effectHBlur );
        composerScene.addPass(clearMask);
        composerScene.addPass(renderMaskInverse);

        renderScene = new THREE.TexturePass(composerScene.renderTarget2.texture);

        composer1 = new THREE.EffectComposer(renderer, new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, rtParameters));

        composer1.addPass(renderScene);
        ////composer1.addPass( renderMask );
        //composer1.addPass( effectFilmBW );
        //composer1.addPass( clearMask );
        composer1.addPass(effectVignette);

        // STATS

        stats = new Stats();
        container.appendChild(stats.dom);

        // EVENTS

        document.addEventListener('mousedown', onDocumentMouseDown, false);
        document.addEventListener('touchstart', onDocumentTouchStart, false);
        document.addEventListener('touchmove', onDocumentTouchMove, false);
        document.addEventListener('keypress', onDocumentKeyPress, false);
        document.addEventListener('keydown', onDocumentKeyDown, false);

        /*document.getElementById( "color" ).addEventListener( 'click', function() {

         pointLight.color.setHSL( Math.random(), 1, 0.5 );
         hex = decimalToHex( pointLight.color.getHex() );

         }, false );*/

        /*document.getElementById( "font" ).addEventListener( 'click', function() {

         fontIndex ++;

         fontName = reverseFontMap[ fontIndex % reverseFontMap.length ];

         loadFont();

         }, false );


         document.getElementById( "weight" ).addEventListener( 'click', function() {

         if ( fontWeight === "bold" ) {

         fontWeight = "regular";

         } else {

         fontWeight = "bold";

         }

         loadFont();

         }, false );

         document.getElementById( "bevel" ).addEventListener( 'click', function() {

         bevelEnabled = !bevelEnabled;

         refreshText();

         }, false );*/

        //

        renderScene.uniforms["tDiffuse"].value = composerScene.renderTarget2.texture;

        window.addEventListener('resize', onWindowResize, false);
        //spawnBox();
        scene.simulate();

    }

    function onWindowResize() {

        windowHalfX = window.innerWidth / 2;
        windowHalfY = window.innerHeight / 2;

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);

        composerScene.setSize(window.innerWidth, window.innerHeight);
        composer1.setSize(window.innerWidth, window.innerHeight);

        renderScene.uniforms["tDiffuse"].value = composerScene.renderTarget2.texture;

    }

    //

    function boolToNum(b) {

        return b ? 1 : 0;

    }

    function onDocumentKeyDown(event) {

        if (firstLetter) {

            firstLetter = false;
            text = "";

        }

        var keyCode = event.keyCode;

        // backspace

        if (keyCode == 8) {

            event.preventDefault();

            text = text.substring(0, text.length - 1);
            refreshText();

            return false;

        }

    }

    function onDocumentKeyPress(event) {

        var keyCode = event.which;

        // backspace

        if (keyCode == 13) {
            spawnBox();
            return;
        }

        if (keyCode == 8) {

            event.preventDefault();

        } else {

            var ch = String.fromCharCode(keyCode);
            text += ch;

            refreshText();

        }

    }

    function loadFont() {

        var loader = new THREE.FontLoader();
        loader.load('fonts/' + fontName + '_' + fontWeight + '.typeface.json', function (response) {

            font = response;

            refreshText();

        });

    }

    function createText() {

        textGeo = new THREE.TextGeometry(text, {

            font: font,

            size: size,
            height: height,
            curveSegments: curveSegments,

            bevelThickness: bevelThickness,
            bevelSize: bevelSize,
            bevelEnabled: bevelEnabled,

            material: 0,
            extrudeMaterial: 1

        });

        textGeo.computeBoundingBox();
        textGeo.computeVertexNormals();

        // "fix" side normals by removing z-component of normals for side faces
        // (this doesn't work well for beveled geometry as then we lose nice curvature around z-axis)

        if (!bevelEnabled) {

            var triangleAreaHeuristics = 0.1 * ( height * size );

            for (var i = 0; i < textGeo.faces.length; i++) {

                var face = textGeo.faces[i];

                if (face.materialIndex == 1) {

                    for (var j = 0; j < face.vertexNormals.length; j++) {

                        face.vertexNormals[j].z = 0;
                        face.vertexNormals[j].normalize();

                    }

                    var va = textGeo.vertices[face.a];
                    var vb = textGeo.vertices[face.b];
                    var vc = textGeo.vertices[face.c];

                    var s = THREE.GeometryUtils.triangleArea(va, vb, vc);

                    if (s > triangleAreaHeuristics) {

                        for (var j = 0; j < face.vertexNormals.length; j++) {

                            face.vertexNormals[j].copy(face.normal);

                        }

                    }

                }

            }

        }

        var centerOffset = -0.5 * ( textGeo.boundingBox.max.x - textGeo.boundingBox.min.x );

        textMesh1 = new THREE.Mesh(textGeo, material);

        textMesh1.position.x = centerOffset;
        textMesh1.position.y = hover;
        textMesh1.position.z = 0;

        textMesh1.rotation.x = 0;
        textMesh1.rotation.y = Math.PI * 2;

        group.add(textMesh1);

        if (mirror) {

            textMesh2 = new THREE.Mesh(textGeo, material);

            textMesh2.position.x = centerOffset;
            textMesh2.position.y = -hover;
            textMesh2.position.z = height;

            textMesh2.rotation.x = Math.PI;
            textMesh2.rotation.y = Math.PI * 2;

            group.add(textMesh2);

        }

    }

    function refreshText() {

        group.remove(textMesh1);
        if (mirror) group.remove(textMesh2);

        if (!text) return;

        createText();

    }

    function onDocumentMouseDown(event) {

        event.preventDefault();

        document.addEventListener('mousemove', onDocumentMouseMove, false);
        document.addEventListener('mouseup', onDocumentMouseUp, false);
        document.addEventListener('mouseout', onDocumentMouseOut, false);

        mouseXOnMouseDown = event.clientX - windowHalfX;
        targetRotationOnMouseDown = targetRotation;

    }

    function onDocumentMouseMove(event) {

        mouseX = event.clientX - windowHalfX;

        targetRotation = targetRotationOnMouseDown + ( mouseX - mouseXOnMouseDown ) * 0.02;

    }

    function onDocumentMouseUp(event) {

        document.removeEventListener('mousemove', onDocumentMouseMove, false);
        document.removeEventListener('mouseup', onDocumentMouseUp, false);
        document.removeEventListener('mouseout', onDocumentMouseOut, false);

    }

    function onDocumentMouseOut(event) {

        document.removeEventListener('mousemove', onDocumentMouseMove, false);
        document.removeEventListener('mouseup', onDocumentMouseUp, false);
        document.removeEventListener('mouseout', onDocumentMouseOut, false);

    }

    function onDocumentTouchStart(event) {

        if (event.touches.length == 1) {

            event.preventDefault();

            mouseXOnMouseDown = event.touches[0].pageX - windowHalfX;
            targetRotationOnMouseDown = targetRotation;

        }

    }

    function onDocumentTouchMove(event) {

        if (event.touches.length == 1) {

            event.preventDefault();

            mouseX = event.touches[0].pageX - windowHalfX;
            targetRotation = targetRotationOnMouseDown + ( mouseX - mouseXOnMouseDown ) * 0.05;

        }

    }
    
    function animate() {

        requestAnimationFrame(animate);

        render();
        stats.update();

    }

    function render() {

        group.rotation.y += ( targetRotation - group.rotation.y ) * 0.05;

        camera.lookAt(cameraTarget);
        scene.simulate();
        groundMirror.render();
        /*for($i=0;$i<box2.length;$i++) {
         box2[$i].position.y=-box[$i].position.y+199;
         box2[$i].position.x=box[$i].position.x;
         box2[$i].position.z=box[$i].position.z;
         box2[$i].rotation.y=box[$i].rotation.y;
         box2[$i].rotation.x=box[$i].rotation.x;
         box2[$i].rotation.z=box[$i].rotation.z;
         }*/
        //refractSphere.visible = false;
        //refractSphereCamera.updateCubeMap( renderer, scene );
        //refractSphere.visible = true;

        //renderer.clear();
        //renderer.render( scene, camera );
        //renderer.setViewport( 0, 0, window.innerWidth, window.innerHeight );
        composerScene.render(delta);
        //renderer.setViewport( 0, 0, window.innerWidth, window.innerHeight );
        composer1.render(delta);

    }

    function handleCollision(collided_with, linearVelocity, angularVelocity) {
        /*switch ( ++this.collisions ) {

         case 1:
         this.material.color.setHex(0xcc8855);
         break;

         case 2:
         this.material.color.setHex(0xbb9955);
         break;

         case 3:
         this.material.color.setHex(0xaaaa55);
         break;

         case 4:
         this.material.color.setHex(0x99bb55);
         break;

         case 5:
         this.material.color.setHex(0x88cc55);
         break;

         case 6:
         this.material.color.setHex(0x77dd55);
         break;
         }*/
    }

    function createBox() {

        //alert("faces: "+g_Geometry.faces.length);
        while(BoxMaterial.friction!=boxFriction) {
            BoxMaterial.friction=boxFriction;
            BoxMaterial.restitution=boxRestitution;
        }
        //alert("rest: "+BoxMaterial.restitution);
        //alert("friction: "+BoxMaterial.friction);
        box[boxIndex] = new Physijs.BoxMesh(
            g_Geometry,
            //BoxMaterial,
            Physijs.createMaterial(
                new THREE.MeshPhongMaterial({
                    color: 0x660000, specular: 0x888888, shininess: 250,
                    opacity: 1.0,
                    premultipliedAlpha: true,
                    transparent: true,//
                    displacementMap: displacementMap,
                    displacementScale: 2.436143,
                    displacementBias: - 0.428408
                }),
                boxFriction,
                boxRestitution
            ),
            1000
        );
        //alert("rest: "+box[boxIndex].material.restitution);
        //alert("friction: "+box[boxIndex].material.friction);
        //box[boxIndex].material.friction=boxFriction;
        //box[boxIndex].material.restitution=boxRestitution;
        box[boxIndex].collisions = 0;
        box[boxIndex].position.y = 550;

        box[boxIndex].rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );

        box[boxIndex].castShadow = true;
        box[boxIndex].receiveShadow = true;
        //box[boxIndex].addEventListener('collision', handleCollision);
        //box.addEventListener( 'ready', spawnBox );

        /*geometry3.scale(20,20,20);
         box2[boxIndex] = new THREE.Mesh(
         geometry3,
         material
         );
         //box2[boxIndex].geometry.scale(-1,-1,-1);
         box2[boxIndex].position.y=-350;

         box2[boxIndex].rotation.set(
         box[boxIndex].rotation.x,
         box[boxIndex].rotation.y,
         box[boxIndex].rotation.z
         );

         box2[boxIndex].castShadow = true;
         box2[boxIndex].receiveShadow = true;*/

        scene.add(box[boxIndex]);
        //scene.add( box2[boxIndex] );
        boxIndex++;

        //alert(scene.length);
        //group.add(box);

    };

    //spawnBox = (function() {
    function spawnBox() {
        createBox();
    }
}