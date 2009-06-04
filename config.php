<?
// Settings for yShort

$version = '0.3';
$time = date('Y-m-d h:i:s A', time());

$source = array(
	'source/core.js',
	'source/manipulate.js',
	'source/traverse.js',
	'source/attribute.js',
	'source/ajax.js',
	'source/get.js',
	'source/event.js',
	'source/css.js',
	'source/fx.js',
	'source/utilities.js',
	'source/class.js',
	'source/sizzle.js',
	//'source/sly.js',
	'source/selector.js',
);

$jQuery = true;
//$jQuery = false;

$tests = true;
$tests = false;

$output_file = 'Karma.js';
$output_min = 'Karma.min.js';

?>