// Finally! write regexes in JS like a human

RegExp.from = function (str, ...args) {

    let buf = [str.raw[0]],
        n = 1;

    for (let arg of args) {
        buf.push(String(arg));
        buf.push(str.raw[n++]);
    }

    let src = [...buf.join('')],
        len = src.length,
        p = 0,
        out = '',
        flags = new Set(),
        isVerbose = false,
        inClass = false
    ;

    // we need 2 chars lookeahead
    src.push('', '');

    let isLetter = c => /[A-Za-z]/.test(c);
    let isWhitespace = c => /[ \t\n\r\v\f]/.test(c);

    while (p < len) {

        // escape - add '\' and the next char
        if (src[p] === '\\') {
            out += src[p++];
            out += src[p++];
            continue;
        }

        // start a class
        if (src[p] === '[') {
            out += src[p++];
            inClass = true;
            continue;
        }

        // in a class, copy all as is even if verbose
        if (inClass) {
            if (src[p] === ']')
                inClass = false;
            out += src[p++];
            continue;
        }

        // (?flags)
        if (src[p] === '(' && src[p + 1] === '?' && isLetter(src[p + 2])) {
            let q = p + 2,
                flagstr = '';

            while (isLetter(src[q]))
                flagstr += src[q++];

            if (src[q] === ')') {
                // add flags, continue from after the ')'
                flags = new Set(flagstr);
                isVerbose = flags.delete('x');
                p = q + 1;
                continue;
            }

            // not valid flags, add '(' and move on 
            // (will probably fail later on)
            out += src[p++];
            continue;
        }

        // vebose whitespace - skip
        if (isVerbose && isWhitespace(src[p])) {
            p++;
            continue;
        }

        // vebose #comment - skip until \n
        if (isVerbose && src[p] === '#') {
            while (p < len && src[p++] !== '\n')
                ;
            continue;
        }

        // everything else
        out += src[p++];
    }

    return new RegExp(out, [...flags].join(''));
}

// example

let number_re = RegExp.from`(?xig)

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

    # exponent
    (
        e
        [+-] ?  # sign, optional
        \d+     # integer
    )
    ? # exponent is optional
`;

let test = "some numbers 123 and 1.23 and .23 and -1.e3 and 123.456e8 and 1.23E+45"

console.log('regex   ', number_re);
console.log('matches ', test.match(number_re));