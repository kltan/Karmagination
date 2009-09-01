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
div { border: 1px solid #F00; margin: 2px; background:#FFF; }
span { border: 1px solid #0F0; margin: 2px; display:block}

#tryHeight {
height: 100px;
padding: 20px;
}
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
<? if (!$jQuery) { ?><script src="<?=$output_file?>" type="text/javascript"></script><? } 
else { ?><script src="jquery-1.3.2.js" type="text/javascript"></script><? } ?>
<script language="javascript">
$(function(){
	if(window.console && console.profile)
		console.profile('Benchmark');

	$('a').animate({ 
		opacity: 0,
		marginLeft: 550
	}, 1000)
	.animate({ 
		opacity: 1,
		marginLeft: 50
	}, 1000);

	$('div').animate({
		width: '500px'
	}, 1000);
	
	$('a').live('click', function(e){
		alert(this.innerHTML);
		return false;
	});
	
	$('a').live('click', function(e){
		alert('This is the second');
		return false;
	});
	
	$('body').live('click', function(e){
		alert('This can\'t fire when anchor return false');
	});
	
	$('a').bind('click', function(e){
		alert('This is native anchor bind');
		return false;
	});
	
	$('body').bind('click', function(e){
		alert('This is native body bind');
		return false;
	});
	
	if(window.console && console.profile)
		console.profileEnd('Benchmark');
		$('div').hover(function(){ this.style.backgroundColor ='#000' }, function(){ this.style.backgroundColor ='white' });
		$(document.body).click(function(){alert('hi2');});
});

</script>
<div id="tryHeight">a</div>
<a href="#">te<b>s</b>t</a>
</body>
</html>