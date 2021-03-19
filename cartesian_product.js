function cart(...a) {

    let p = a.map(() => 0);
    let r = [];

    while (1) {
        r.push(p.map((q, i) => a[i][q]));
        for (let i = a.length - 1; i >= 0; i--) {
            if (++p[i] < a[i].length)
                break;
            if (i === 0)
                return r;
            p[i] = 0;
        }
    }
}

console.log(cart([1,2,3], [11, 22]))