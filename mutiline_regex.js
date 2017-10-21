// Finally! write regexes in JS like a human

function regex(modifiers) {

    return function() {

        function escape(s) {
            return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        }

        var args = [].slice.call(arguments);

        var r = [].map.call(args[0], function (s, i) {
            return s + escape(args[i + 1] || '');
        })
            .join('')
            .replace(/#.*/g, '')
            .replace(/\s+/g, '');

        return new RegExp(r, modifiers);
    }

}

charsToRemove = '^[]-';

re = regex('gm')`
    [${charsToRemove}] # match these chars....
    (?=\\d)            # if followed by a digit
`;

/*
    another option would be extending RegExp:

    regex`...`.g.m

*/


console.log(re)

s = '^keep ^9 [keep [2'

console.log(s.replace(re, '@'))

