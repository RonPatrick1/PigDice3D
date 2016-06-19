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
<script src="js/shaders/VignetteShader.js"></script>
<script src="js/shaders/HorizontalBlurShader.js"></script>
<script src="js/shaders/VerticalBlurShader.js"></script>
<script src="js/postprocessing/TexturePass.js"></script>
<script src="js/postprocessing/RenderPass.js"></script>
<script src="js/postprocessing/MaskPass.js"></script>
<script src="js/loaders/STLLoader.js"></script>
<script type="text/javascript" src="physi.js"></script>
<script src="MainScene.js"></script>
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
