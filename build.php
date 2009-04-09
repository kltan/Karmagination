<? 

/**************************************
* This is a simple builder for $hort *
**************************************/

header('Content-Type: text/html; charset=utf-8'); 
?>


<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>$hort builder</title>
<style>
body, textarea { font: 12px "Courier New", Courier, monospace; }
textarea { width: 500px; height: 200px; }
pre {margin:3px 0 }
.passed { color:#0C3 }
.failed { color:#F00; font-weight:bold }
</style>
</head>
<body>


<?
echo 'Config file loading ..........<br />';
require_once('config.php'); // config variables
echo 'Config file loaded.<br /><br />';

echo '$hort source loading ..........<br />';
ob_start(); // start output buffering

foreach($source as $file) {
	require_once($file); 
	echo "\n";
}

$content = ob_get_contents(); // get the output buffer
ob_end_clean(); // don't output the buffer to screen
echo '$hort source loaded.<br /><br />';

// create a development version of the file
echo 'Creating $hort development version ..........<br />';
$fp = fopen($output_file,"w+");
fwrite($fp, $content);
fclose($fp);
echo $output_file.' created.<br /><br />';

// create a minified version of the file
echo 'Creating $hort production version ..........<br />';
$exec_string = 'java -jar yuicompressor-2.4.2.jar '.$output_file.' -o '.$output_min.' 2>&1';
exec($exec_string, $output, $return);


// if error
if ($return)
	echo '<p class="failed">'.implode("<br />",$output).'</p>';

else {
	echo 'short.min.js created.';
	echo '<br /><br /><a href="'.$output_file.'">Get the development version</a>&nbsp;&nbsp;&nbsp;&nbsp;';
	echo '<a href="'.$output_min.'">Get the production version</a>';
}
?>

<div style="display:none" id="hiddenStuff">
<?= file_get_contents('unittest.html'); ?>
</div>

<div id="ya" class="a"></div>
<div id="ji" class="a"></div>
<span class="a"></span>
<b></b>

<? 
if ($jQuery)echo '<script language="javascript" src="jquery-1.3.2.js" type="text/javascript"></script>';
else echo'<script language="javascript" src="short.js" type="text/javascript"></script>';

if($tests) echo '<script src="tests.js" type="text/javascript"></script>';
?>

</body>
</html>