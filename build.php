<? 
header('Content-Type: text/html; charset=utf-8'); 
require_once('config.php');
?>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>Karmagination builder</title>
<style type="text/css" media="screen">
body, textarea { font: 12px "Courier New", Courier, monospace; }
textarea { width: 500px; height: 200px; }
pre {margin:3px 0 }
.passed { color:#0C3 }
.failed { color:#F00; font-weight:bold }
td { border: 1px solid #000 }
div { border: 1px solid #F00; margin: 2px; background:#FFF; width:100%;}
span { border: 1px solid #0F0; margin: 2px; display:block}
</style>
</head>
<body>

<?

ob_start(); 

foreach($source as $file) {
	require_once($file); 
	echo "\n";
}

$content = ob_get_contents(); // get the output buffer
ob_end_clean(); // don't output the buffer to screen

$output_file = $output.'-'. $version. '.js';
$output_min = $output.'.min-'.$version.'.js';

$fp = fopen($output_file,"w+");
fwrite($fp, $content);
fclose($fp);

$exec_string = 'java -jar yuicompressor-2.4.2.jar '.$output_file.' -o '.$output_min.' 2>&1';
exec($exec_string, $output, $return);

// if error
if ($return)
	echo '<p class="failed">'.implode("<br />",$output).'</p>';

else {
	echo '<a href="'.$output_file.'">Get the development version</a>&nbsp;&nbsp;&nbsp;&nbsp;';
	echo '<a href="'.$output_min.'">Get the production version</a>';
}
?>

<script src="<?=$output_file?>" type="text/javascript"></script>
<script language="javascript">
$(function(){

	$('<div><a href="test">Testing event delegation</a></div>').appendTo(document.body);
	
	$('a').live('click', function(e){
		alert('abc');
		return false;
	});
	
	$('body').live('click', function(e){
		alert('a');	
	});

});
</script>

</body>
</html>