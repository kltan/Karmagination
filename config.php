<?
// Settings for Karmagination

$version = '0.1';
$time = date('Y-m-d h:i:s A', time());

$build = file_get_contents('build.version');
$next = (int)$build + 1 . '';

echo 'Build ' . $build . '<br />';

$handle = fopen('build.version', 'w+');
fwrite($handle, $next);
fclose($handle);


$source = array(
	'source/core.js',
	'source/adding.js',
	'source/iterator.js',
	'source/manipulate.js',
	'source/traverse.js',
	'source/attribute.js',
	'source/ajax.js',
	'source/include.js',
	'source/event.js',
	'source/css.js',
	//'source/fx.js',
	'source/fx2.js',
	'source/utilities.js',
	'source/class.js',
	'source/sizzle.js',
	'source/selector.js',
);

$output = 'karma';
$jQuery = true;
$jQuery = false;
?>