<? header('Content-type: text/css'); ?>
@charset "utf-8";
/* CSS Document */

<? 
ob_start();
sleep(10); 
echo 'body {
background:#000;
color:#FFF;
}';
ob_flush();
?>



