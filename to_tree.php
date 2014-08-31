<?php

// functions to convert flat lists to trees

// multilevel numbering to tree
function levels_to_tree($a) {
    $tree = array();
    foreach($a as $k => $v) {
        $b = &$tree;
        foreach(explode('.', $k) as $n) {
            $a = &$b;
            $b = &$b[$n]['sub'];
        }
        $a[$n]['title'] = $v;
    }
    return $tree;
}

$a = array(
    '1' => 'Level 1',
    '1.1' => 'Level 1.1',
    '1.2' => 'Level 1.2',
    '1.2.1' => 'Level 1.2.1',
    '1.2.2' => 'Level 1.2.2',
    '2' => 'Level 2',
    '2.1' => 'Level 2.1',
    '3' => 'Level 3'
);

print_r(levels_to_tree($a));

//------------------------------------------------------------

// parent-id to tree
function pid_to_tree($a) {
    $tree = array();
    foreach($a as $e) {
        foreach($e as $k => $v)
            $tree[$e['id']][$k] = $v;
        $tree[$e['parent']]['sub'] []= &$tree[$e['id']];
    }
    return $tree[0];
}

$a = array(
    array('id' => 1, 'parent' => 0, 'name' => 'A'),
    array('id' => 2, 'parent' => 0, 'name' => 'B'),
    array('id' => 3, 'parent' => 1, 'name' => 'Son of A'),
    array('id' => 4, 'parent' => 2, 'name' => 'Son of B'),
    array('id' => 5, 'parent' => 3, 'name' => 'Son of son of A 1'),
    array('id' => 6, 'parent' => 3, 'name' => 'Son of son of A 2'),
    array('id' => 7, 'parent' => 0, 'name' => 'C'),
    array('id' => 8, 'parent' => 7, 'name' => 'Son of C'),
);

print_r(pid_to_tree($a));

