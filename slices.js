function array() {
    return new Proxy([], {

        set(self, key, val) {
            key = key.split(',')
            key[0] = Number(key[0] || 0);
            key[1] = Number(key[1] || self.length);
            key[2] = Number(key[2] || 1);
            console.log(key)

            let i = key[0];
            for (let x of val) {
                self[i] = x;
                i += key[2];
                if (i >= key[1])
                    break;
            }
        }
    });
}

function* repeat(x, n = Number.MAX_SAFE_INTEGER) {
    while (n--)
        yield x;
}

function* count(start = 0, stop = Number.MAX_SAFE_INTEGER) {
    while (start < stop)
        yield start++;

}

a = array();

a[[,30]] = count();
a[[,,3]] = repeat('fizz');
a[[,,5]] = repeat('buzz');
a[[,,15]] = repeat('fizzbuzz');

console.log(a);
