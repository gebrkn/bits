// range() 

function* range(a, b, step) {

    switch (arguments.length) {
        case 0:
            return;
        case 1:
            b = Number(a);
            a = 0;
            step = 1;
            break;
        case 2:
            a = Number(a);
            b = Number(b);
            step = a < b ? +1 : -1;
            break;
        case 3:
            a = Number(a);
            b = Number(b);
            step = Number(step);
            break;
    }

    if (Number.isNaN(a) || Number.isNaN(b) || Number.isNaN(step))
        return;

    if (a === b || !step)
        return;

    if (a < b) {
        if (step < 0)
            return;
        while (a < b) {
            yield a;
            a += step;
        }
    }

    if (a > b) {
        if (step > 0)
            return;
        while (a > b) {
            yield a;
            a += step;
        }
    }
}

///

let tests = `
    range(5)         => [0, 1, 2, 3, 4]
    range(2, 5)      => [2, 3, 4]
    range(5, 2)      => [5, 4, 3]
    range(1, 7, 2)   => [1, 3, 5]
    range(5, 2, -1)  => [5, 4, 3]
    range(7, 1, -2)  => [7, 5, 3]
    range()          => []
    range(0)         => []
    range(-5)        => []
    range(5, 5)      => []
    range(1, 5, -1)  => []
    range(5, 1, +1)  => []
    range("z")       => []
    range(1, "z")    => []
    range(1, 2, "z") => []
`;

for (let ln of tests.trim().split('\n')) {
    let [a, e] = ln.split('=>');

    a = [...eval(a)];
    e = [...eval(e)];

    if (a.join() !== e.join())
        console.log(`FAILED: [${a}] expected [${e}]`)
}
