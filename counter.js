// python's collections.Counter

class Counter extends Map {
    constructor(iter) {
        super();
        this.update(iter);
    }

    get(x) {
        return this.has(x) ? super.get(x) : 0;
    }

    update(iter) {
        for (let x of iter) {
            this.set(x, this.get(x) + 1);
        }
    }

    subtract(iter) {
        for (let x of iter) {
            this.set(x, this.get(x) - 1);
        }
    }

    mostCommon(n) {
        return [...this.entries()]
            .map((x, i) => [x, i])
            .sort((cx, cy) => cy[0][1] - cx[0][1] || cx[1] - cy[1])
            .map(cx => cx[0])
            .slice(0, n);
    }

    * elements() {
        for (let [x, n] of this.entries()) {
            while (n-- > 0) {
                yield x;
            }
        }
    }
}

//

let c = new Counter('abracadabra');

console.log(c.get('a'))
console.log(c.get('x'))
console.log([...c.mostCommon(3)])
console.log([...c.mostCommon()])
console.log([...c.elements()])
