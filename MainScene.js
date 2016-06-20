/**
 * Created by rpatrick on 6/19/16.
 */

function mainScene() {
    if (!Detector.webgl) Detector.addGetWebGLMessage();

    Physijs.scripts.worker = 'physijs_worker.js';
    Physijs.scripts.ammo = 'ammo.js';

    THREE.Cache.enabled = true;

    var BoxMaterial, cubeMaterial;

    var loader;
    var g_Geometry;// = new THREE.Geometry();

    var container, hex, color;
    var rPass;
    var refractionCube;

    var box = [];
    var boxIndex = 0;

    var camera, cameraTarget, scene, renderer;

    var group, textMesh1, textMesh2, textGeo, material;
    var textDist=700.0;

    var firstLetter = true;
    var plane;

    var delta = 0.01;
    var preComposerScene, composerScene, composer1, renderScene, stats;

    var text = "CIS 371 Pig Dice",

        height = 20,
        size = 30,
        hover = 50,

        curveSegments = 10,

        bevelThickness = 2,
        bevelSize = 1.5,
        bevelSegments = 10,
        bevelEnabled = true,

        font = undefined,

        //fontName = "droid/droid_sans", // helvetiker, optimer, gentilis, droid sans, droid serif
        //fontName = "gentilis",
        fontName = "optimer",
        //fontName = "helvetiker",
        //fontName = "droid/droid_serif",
        fontWeight = "regular"; // regular bold

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

    var groundMirror, groundMirror2;
    var boxFriction=.999;
    var boxRestitution=.7;
    var groundFriction=.999;
    var groundRestitution=.6;

    var sceneCube, cameraCube;
    var vertShader, fragShader, uniforms, ground_material, material_shh;

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

        // CAMERA

        camera = new THREE.PerspectiveCamera(45/*30*/, window.innerWidth / window.innerHeight, 1, 1500);
        camera.position.set(0, 400, 700);
        //camera.position.set( 0, 75, 160 );

        cameraTarget = new THREE.Vector3(0, 150, 0);
        cameraCube = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 100000 );

        // SCENE

        sceneCube = new THREE.Scene();
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
        //scene.add( new THREE.AmbientLight( 0x222222 ) );

        var r_envMap = "textures/skybox/";
        var urls_envMap = [ r_envMap + "px.jpg", r_envMap + "nx.jpg",
            r_envMap + "py.jpg", r_envMap + "ny.jpg",
            r_envMap + "pz.jpg", r_envMap + "nz.jpg" ];
        var textureCube_envMap = new THREE.CubeTextureLoader().load( urls_envMap );
        textureCube_envMap.format = THREE.RGBFormat;
        textureCube_envMap.mapping = THREE.CubeReflectionMapping;
        // Skybox
        var shader_envMap = THREE.ShaderLib[ "cube" ];
        shader_envMap.uniforms[ "tCube" ].value = textureCube_envMap;
        var material_envMap = new THREE.ShaderMaterial( {
            fragmentShader: shader_envMap.fragmentShader,
            vertexShader: shader_envMap.vertexShader,
            uniforms: shader_envMap.uniforms,
            depthWrite: false,
            side: THREE.BackSide
        } );
        var mesh_envMap = new THREE.Mesh( new THREE.BoxGeometry( 100000, 100000, 100000 ), material_envMap );
        mesh_envMap.position.x=0;//5000;
        mesh_envMap.position.y=0;//-4900;
        mesh_envMap.position.z=0;//-50000;
        //camera.add( mesh_envMap );
        sceneCube.add( mesh_envMap );

        var cubeShader = THREE.ShaderLib[ "cube" ];
        cubeMaterial = new THREE.ShaderMaterial( {
            fragmentShader: cubeShader.fragmentShader,
            vertexShader: cubeShader.vertexShader,
            uniforms: cubeShader.uniforms,
            depthWrite: false,
            side: THREE.BackSide
        } );
        cubeMaterial.uniforms[ "tCube" ].value = textureCube_envMap;
        //var ambient = new THREE.AmbientLight( 0xffffff );
        //sceneCube.add( ambient );

        /*var pointLight = new THREE.PointLight( 0xff0000, 0.5 );
        pointLight.position.z = 2500;
        scene.add( pointLight );
        var pointLight2 = new THREE.PointLight( 0xff6666, 1 );
        camera.add( pointLight2 );
        var pointLight3 = new THREE.PointLight( 0x0000ff, 0.5 );
        pointLight3.position.x = - 1000;
        pointLight3.position.z = 1000;
        scene.add( pointLight3 );*/

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
            new THREE.MeshPhongMaterial({
                color: 0xffffff,
                shading: THREE.FlatShading,
                metalness: 1.0,
                roughness: 0.4
                //transparent: true,
                //opacity: 0.7
            }), // front
            new THREE.MeshPhongMaterial({
                color: 0xffffff,
                shading: THREE.SmoothShading,
                metalness: 1.0,
                roughness: 0.4
                //transparent: true,
                //opacity: 0.7
            }) // side
        ]);
        cubeMaterial.color=0xff0000;
        cubeMaterial.roughness=0.4;
        cubeMaterial.metalness=1.0;
        cubeMaterial.transparent=true;
        cubeMaterial.opacity=0.5;
        //material=cubeMaterial;



        group = new THREE.Group();
        group.position.y = hover;

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


        var planeSize=500;
        tLoader = new THREE.TextureLoader();

        var planeGeo = new THREE.Mesh(
            new THREE.CylinderGeometry(planeSize, planeSize, 1, 200),
            new THREE.MeshBasicMaterial({color: 0x151515, opacity: 0.45, transparent: true})//grey
            //new THREE.MeshBasicMaterial( { color: 0x330000, opacity: 0.45, transparent: true } )//red
        );
        planeGeo.position.y = 101;

        scene.add(planeGeo);

        /*var mirrorMesh = new THREE.Mesh( planeGeo, groundMirror.material );
         mirrorMesh.add( groundMirror );
         mirrorMesh.rotateX( - Math.PI / 2 );
         mirrorMesh.position.y = 100;
         scene.add( mirrorMesh );  */

        renderer.setClearColor(scene.fog.color);
        renderer.autoClear = false;
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setFaceCulling( THREE.CullFaceNone );
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
        effectVignette.clear=false;

        var effectHBlur = new THREE.ShaderPass(THREE.HorizontalBlurShader);
        var effectVBlur = new THREE.ShaderPass(THREE.VerticalBlurShader);
        effectHBlur.uniforms['h'].value = 2 / ( width / 2 );
        effectVBlur.uniforms['v'].value = 2 / ( height / 2 );
        //effectVBlur.renderToScreen=true;

        var clearMask = new THREE.ClearMaskPass();
        clearMask.clear=false;
        var renderMask = new THREE.MaskPass(scene, camera);
        var renderMaskInverse = new THREE.MaskPass(scene, camera);
        renderMaskInverse.clear=false;

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
        rPass.clear =false;
        var envPass=new THREE.RenderPass(sceneCube, cameraCube);
        envPass.clear=true;
        var effectBloom = new THREE.BloomPass(  );
        effectBloom.clear = false;
        effectBloom.renderToScreen = true;
        //preComposerScene = new THREE.EffectComposer(renderer, new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, rtParameters));
        //preComposerScene.addPass(envPass);
        //preComposerScene.addPass(rPass);
        //var renderScene2 = new THREE.TexturePass(preComposerScene.renderTarget2.texture);

        composerScene = new THREE.EffectComposer(renderer, new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, rtParameters));
        composerScene.autoClear=false;
        //composerScene.addPass(renderScene2);
        composerScene.addPass(envPass);

        composerScene.addPass(rPass);
        //composerScene.addPass(effectBloom);
        //composerScene.addPass( effectVBlur );
        //composerScene.addPass( effectHBlur );
        //composerScene.addPass(clearMask);
        //composerScene.addPass(renderMaskInverse);

        renderScene = new THREE.TexturePass(composerScene.renderTarget2.texture);

        // MIRROR planes
        groundMirror = new THREE.Mirror(renderer, camera, {
            opacity: .1, transparent: true,
            color: 0x777777,
            clipBias: 0.003,
            textureWidth: width,
            textureHeight: height
        });
        groundMirror.rotation.x=Math.PI/2;

        ground_material = Physijs.createMaterial(
            //new THREE.MeshBasicMaterial( { color: 0xffffff, opacity: 0.5, transparent: true } ),
            groundMirror.material,
            //material_shh,
            //composerScene.renderTarget2.texture,
            groundFriction, // high friction
            groundRestitution // low restitution
        );

        plane = new Physijs.CylinderMesh(
            //var plane = new Physijs.Mesh(
            //var plane = new THREE.Mesh(
            //new THREE.PlaneBufferGeometry( 10000, 10000 ),
            new THREE.CylinderGeometry(planeSize, planeSize, 10,200,5,false),
            //new THREE.MeshBasicMaterial( { color: 0xffffff, opacity: 0.5, transparent: true } ),
            ground_material,
            //multMat,
            0
        );

        plane.position.y = 100;
        plane.rotation.x=Math.PI;
        plane.add(groundMirror);
        scene.add(plane);
        //sceneCube.add(plane);
        //plane.rotation.z=Math.PI;
        ////plane.rotateX(-Math.PI / 2);
        // 				//plane.rotation.x = -.11;// Math.PI / 2;

        composer1 = new THREE.EffectComposer(renderer, new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, rtParameters));
        composer1.autoClear=false;
        //renderScene.renderToScreen=true;
        //renderScene.clear=false;
        composer1.addPass(renderScene);
        //renderMask.clear=false;
        //renderMask.renderToScreen=true;
        //composer1.addPass( renderMask );
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
        document.addEventListener('keyup', onDocumentKeyUp, false);

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
        cameraCube.aspect = window.innerWidth / window.innerHeight;
        cameraCube.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);

        composerScene.setSize(window.innerWidth, window.innerHeight);
        composer1.setSize(window.innerWidth, window.innerHeight);

        renderScene.uniforms["tDiffuse"].value = composerScene.renderTarget2.texture;

    }

    //

    function boolToNum(b) {

        return b ? 1 : 0;

    }

    var RotX=0;
    var RotY=0;
    var RotZ=0;
    var shiftDown=false;
    function onDocumentKeyUp(event) {
        /*var keyCode = event.keyCode;

        if(keyCode==16) {
            shiftDown=false;
        }*/
    }
    function onDocumentKeyDown(event) {

        if (firstLetter) {

            firstLetter = false;
            text = "";

        }

        var keyCode = event.keyCode;

        /*if(keyCode==16) {
            shiftDown=true;
        }
        // backspace
        console.log("down: "+keyCode);
        var addTo=Math.PI/8;
        if(shiftDown) {
            addTo=-Math.PI/8;
        }
        if(keyCode==81) {
            RotX += addTo;
            if (RotX == 2 * Math.PI) {
                RotX = 0;
            }
            console.log(RotX);
            return;
        }
        if(keyCode==87) {
            RotY += addTo;
            if (RotY == 2 * Math.PI) {
                RotY = 0;
            }
            console.log(RotY);
            return;
        }
        if(keyCode==69) {
            RotZ += addTo;
            if (RotZ == 2 * Math.PI) {
                RotZ = 0;
            }
            console.log(RotZ);
            return;
        }*/

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

        //textMesh1.position.x = centerOffset;
        //textMesh1.position.y = hover;
        //textMesh1.position.z = 0;
        group.position.x=centerOffset;

        group.add(textMesh1);
        //camera.add
        //scene.add(textMesh1);

        /*if (mirror) {

            textMesh2 = new THREE.Mesh(textGeo, material);

            textMesh2.position.x = centerOffset;
            textMesh2.position.y = -hover;
            textMesh2.position.z = height;

            textMesh2.rotation.x = Math.PI;
            textMesh2.rotation.y = Math.PI * 2;

            //group.add(textMesh2);

        }*/

    }

    function refreshText() {

        group.remove(textMesh1);
        //scene.remove(textMesh1);
        //if (mirror) group.remove(textMesh2);

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

        //group.rotation.y += ( targetRotation - group.rotation.y ) * 0.05;

        //plane.rotation.x=RotX;
        //plane.rotation.y=RotY;
        //plane.rotation.z=RotZ;
        cameraTarget.x=0;
        cameraTarget.y=150;
        cameraTarget.z=0;
        if(box[boxIndex-1]) {
            if(box[boxIndex-1].position.y<480) {
                cameraTarget.x=box[boxIndex-1].position.x;
                cameraTarget.y=box[boxIndex-1].position.y;
                cameraTarget.z=box[boxIndex-1].position.z;
            }
        }
        camera.lookAt(cameraTarget);
        if(textMesh1) {
            //textMesh1.position.x = cameraTarget.x;//+centerOffset;
            //textMesh1.position.y = cameraTarget.y;
            //textMesh1.position.z = cameraTarget.z;//400;
            textMesh1.rotation.copy(camera.rotation);
            textMesh1.position.copy(camera.position);
            textMesh1.position.lerp(cameraTarget, textDist / camera.position.distanceTo(cameraTarget));
        }
        //camera.lookAt(textMesh1);
        cameraCube.rotation.copy( camera.rotation );
        //cameraCube.position.copy( camera.position );
        scene.simulate();
        groundMirror.render();
        //groundMirror2.render();
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
        //preComposerScene.render(delta);
        //renderer.render(sceneCube,cameraCube);
        //renderer.render(scene,camera);

        composerScene.render(delta);
        //renderer.setViewport( 0, 0, window.innerWidth, window.innerHeight );
        composer1.render(delta);
        //renderer.render(sceneCube,cameraCube);
    }

    var source = document.createElement('source');
    source.src = 'Untitled.wav';
    function handleCollision(collided_with, linearVelocity, angularVelocity) {
        var max=10.0;
        if(Math.abs(linearVelocity.x)>(max*4) ||
            Math.abs(linearVelocity.y)>(max*7) ||
            Math.abs(linearVelocity.z)>(max*4)){
        /*if(Math.abs(angularVelocity.x)>max ||
            Math.abs(angularVelocity.y)>max ||
            Math.abs(angularVelocity.z)>max) {*/
            /*console.log("linearVelx: "+linearVelocity.x);
             console.log("linearVely: "+linearVelocity.y);
             console.log("linearVelz: "+linearVelocity.z);
             console.log("angularVElx: "+angularVelocity.x);
             console.log("angularVEly: "+angularVelocity.y);
             console.log("angularVElz: "+angularVelocity.z);*/
            var audio = document.createElement('audio');
            audio.appendChild(source);
            audio.play();
        }
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
                //new THREE.MeshPhongMaterial({
                new THREE.MeshStandardMaterial({
                    color: 0xf00000, specular: 0x111111, shininess: 250,
                    //opacity: 1.0,
                    premultipliedAlpha: true,
                    //transparent: true,
                    roughness: 0.4,
                    metalness: 1.0
                }),
                //cubeMaterial,
                boxFriction,
                boxRestitution
            ),
            1000
        );

        box[boxIndex].collisions = 0;
        box[boxIndex].position.y = 550;

        box[boxIndex].rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );

        box[boxIndex].castShadow = true;
        box[boxIndex].receiveShadow = true;
        box[boxIndex].addEventListener('collision', handleCollision);

        scene.add(box[boxIndex]);
        boxIndex++;

    }

    //spawnBox = (function() {
    function spawnBox() {
        createBox();
    }
}