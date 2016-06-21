<!DOCTYPE html>
<html lang="en">
<head>
    <title>CIS 371 - PigDice - Ron Patrick</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0">
    <link rel="stylesheet" href="PigDice.css" type="text/css"/>
</head>
<body>

<div id="info">
</div>
<div id="mainContainer"></div>

<script type="text/javascript" src="Other-Dat-GUI/dat-gui/build/dat.gui.js"></script>
<script src="three.js"></script>
<script src="GeometryUtils.js"></script>
<script src="Detector.js"></script>
<script src="js/libs/stats.min.js"></script>
<script src="js/postprocessing/EffectComposer.js"></script>
<script src="js/Mirror.js"></script>
<script src="js/shaders/CopyShader.js"></script>
<script src="js/postprocessing/ShaderPass.js"></script>
<script src="js/postprocessing/FilmPass.js"></script>
<script src="js/shaders/FilmShader.js"></script>
<script src="js/shaders/ConvolutionShader.js"></script>
<script src="js/shaders/VignetteShader.js"></script>
<script src="js/shaders/HorizontalBlurShader.js"></script>
<script src="js/shaders/VerticalBlurShader.js"></script>
<script src="js/postprocessing/TexturePass.js"></script>
<script src="js/postprocessing/RenderPass.js"></script>
<script src="js/postprocessing/MaskPass.js"></script>
<script src="js/postprocessing/BloomPass.js"></script>
<script src="js/loaders/STLLoader.js"></script>
<script type="text/javascript" src="physi.js"></script>
<script type="text/javascript" src="Other-Dat-GUI/dat-gui/tests/jquery.js"></script>
<!--script type="text/javascript" src="build/DAT.GUI.js"></script-->
<!--script type="text/javascript" src="Other-Dat-GUI/dat-gui/src/dat/gui/GUI.js"></script>
<script type="text/javascript" src="Other-Dat-GUI/dat-gui/utils/builder.js"></script>
<script type="text/javascript" src="Other-Dat-GUI/dat-gui/utils/closure.js"></script>
<script type="text/javascript" src="Other-Dat-GUI/dat-gui/utils/build_gui.js"></script>
<script type="text/javascript" src="Other-Dat-GUI/dat-gui/utils/build_color.js"></script-->
<!--script type="text/javascript" src="Other-Dat-GUI/dat-gui/src/dat/controllers/BooleanController.js"></script>
<script type="text/javascript" src="Other-Dat-GUI/dat-gui/src/dat/controllers/ColorController.js"></script>
<script type="text/javascript" src="Other-Dat-GUI/dat-gui/src/dat/controllers/Controller.js"></script>
<script type="text/javascript" src="Other-Dat-GUI/dat-gui/src/dat/controllers/factory.js"></script>
<script type="text/javascript" src="Other-Dat-GUI/dat-gui/src/dat/controllers/FunctionController.js"></script>
<script type="text/javascript" src="Other-Dat-GUI/dat-gui/src/dat/controllers/NumberController.js"></script>
<script type="text/javascript" src="Other-Dat-GUI/dat-gui/src/dat/controllers/NumberControllerBox.js"></script>
<script type="text/javascript" src="Other-Dat-GUI/dat-gui/src/dat/controllers/NumberControllerSlider.js"></script>
<script type="text/javascript" src="Other-Dat-GUI/dat-gui/src/dat/controllers/OptionController.js"></script>
<script type="text/javascript" src="Other-Dat-GUI/dat-gui/src/dat/controllers/StringController.js"></script>
<script type="text/javascript" src="Other-Dat-GUI/dat-gui/src/dat/color/Color.js"></script>
<script type="text/javascript" src="Other-Dat-GUI/dat-gui/src/dat/color/interpret.js"></script>
<script type="text/javascript" src="Other-Dat-GUI/dat-gui/src/dat/color/math.js"></script>
<script type="text/javascript" src="Other-Dat-GUI/dat-gui/src/dat/color/toString.js"></script-->
<!--link href='src/DAT/GUI/GUI.css' media='screen' rel='stylesheet' type='text/css'/-->
<!--script type='text/javascript' src='src/DAT/GUI/GUI.js'></script>
<script type='text/javascript' src='src/DAT/GUI/ControllerNumberSlider.js'></script>
<script type='text/javascript' src='src/DAT/GUI/Controller.js'></script>
<script type='text/javascript' src='src/DAT/GUI/ControllerBoolean.js'></script>
<script type='text/javascript' src='src/DAT/GUI/ControllerString.js'></script>
<script type='text/javascript' src='src/DAT/GUI/ControllerFunction.js'></script>
<script-- type='text/javascript' src='src/DAT/GUI/ControllerNumber.js'></script-->
<script src="MainScene.js"></script>

<script id="fragment_shh" type="x-shader/x-fragment">
    #ifdef GL_ES
    precision highp float;
    #endif

    uniform sampler2D tOne;
    uniform sampler2D tSec;

    varying vec2 vUv;
    
    void main(void) {
        vec3 c;
        vec4 Ca = texture2D(tOne, vUv);
        vec4 Cb = texture2D(tSec, vUv);
        c = Ca.rgb * Ca.a + Cb.rgb * Cb.a * (1.0 - Ca.a);
        gl_FragColor= vec4(c, 1.0);
        
    }
</script>

<script id="vertex_shh" type="x-shader/x-vertex">
    varying vec2 vUv;		
    void main() {
        vUv = uv;
        vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
        gl_Position = projectionMatrix * mvPosition;
    }		
</script>

<script type="text/javascript">
    window.onload = function () {
        mainScene();
    }
</script>
<?php
$doSomething=0;
?>
</body>
</html>

