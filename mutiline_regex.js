// Finally! write regexes in JS like a human

RegExp.ext = function (str, ...args) {
    let re = str.raw[0] + args.map((a, n) => a + str.raw[n + 1]),
        flags = '',
        m = re.match(/^\(\?([a-z]+)\)/);

    if (m) {
        re = re.slice(m[0].length);
        flags += m[1];
    }

    let fs = new Set(flags);

    if (fs.delete('x')) {
        re = re
            .replace(/\\{2}/g, '\\x5c')
            .replace(/\\#/g, '\\x23')
            .replace(/#.*/g, '')
            .replace(/\s+/g, '')
            .trim();
    }

    return new RegExp(re, [...fs].join(''));
}

// example

let number_re = RegExp.ext`(?xig)

    #
    # a number in the scientific notation
    #

    # optional sign
    [+-] ?

    # mantissa
    (

        # 12, 12. and 12.34
        (
            \d+           # integer part
            ( \. \d* ) ?  # float part, optional
        )

        |  # or

        # .12
        (
            \. \d+
        )
    )

    # exponent, optional
    (
        e
        [+-] ?  # sign, optional
        \d+     # integer
    )
    ?
`;

let test = "some numbers 123 and 1.23 and .23 and 123.456e8 and 1.23E+45"

console.log('regex   ', number_re);
console.log('matches ', test.match(number_re));