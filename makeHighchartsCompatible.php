<?php
    /*
     * This is a simple find and replace script, just run after pulling from an update branch
     */
    $replaceArray = array(
	'jq.mobi.js' => array(
	    '.replace(' => '.toString().replace(',   // Fixes "Uncaught TypeError: Object #<SVGAnimatedString> has no method 'replace'"
	    '.trim(' => '.toString().trim(',   // Fixes "Uncaught TypeError: Object #<SVGAnimatedString> has no method 'replace'"
		'.toString().toString()' => '.toString()'
	),
	'ui/jq.ui.js' => array(
	    '$' => 'jq',
	    'isjq' => 'is$',
	)
    );
    
    foreach ($replaceArray as $fileName => $replaceData) {
	$file = file_get_contents($fileName);
	if (!$file)
	    continue;
	
	foreach ($replaceData as $search => $replace)
	    $file = str_replace ($search, $replace, $file);
	
	file_put_contents($fileName, $file);
    }