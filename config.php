<?
// Settings for yShort

$version = '0.1';
$time = date('Y-m-d h:i:s A', time());

$source = array(
	'source/core.js',
//	'source/sly.js',
	'source/sizzle.js',
	'source/manipulate.js',
	'source/traverse.js',
	'source/attribute.js',
	'source/ajax.js',
	'source/event.js',
	'source/css.js',
	'source/fx.js',
	'source/utilities.js',
);
$jQuery = true;
$jQuery = false;

$tests = true;
$tests = false;

$output_file = 'short.js';
$output_min = 'short.min.js';

?>