function findAll(re, subject) {
    var res = [];
    while(r = re.exec(subject)) {
        res.push(r);
    }
    return res;
}

function findAny(re, subject) {
    var res = [],
        p = 0,
        r;

    while(r = re.exec(subject)) {
        var s = r.index;
        if (s > p) {
            res.push([false, subject.slice(p, s)])
        }
        res.push([true, r]);
        p = s + r[0].length;
    }
    if(p < subject.length) {
        res.push([false, subject.slice(p)])
    }
    return res;
}


s = "foo [bar] baz [quux] blah";
r =  /\[(.*?)\]/g;

for (let [matching, match] of findAny(r, s)) {
    console.log(matching, match)
}
