<?php
    
    $replaceArray = array(
	'ui/jq.ui.js' => array(
	    '$' => 'jq',
	    'isjq' => 'is$'
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