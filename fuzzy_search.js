// fuzzy search a list, like SublimeText autocompletion

/**
 *
 * @param word Search string
 * @param list List of strings
 * @param transform Optionally, transform each found letter
 * @returns {*} List of matching strings
 */
function fuzzyMatch(word, list, transform) {

    transform = transform || function(x) { return x };

    return list.map(function (elem) {
        var ie = 0, iw = 0, res = "";

        while (1) {
            if (iw == word.length) {
                return res + elem.slice(ie);
            }
            if (ie == elem.length) {
                return null;
            }
            if (word[iw] == elem[ie]) {
                res += transform(elem[ie++]);
                iw++;
            } else {
                res += elem[ie++];
            }
        }
    }).filter(Boolean);
}


lst = [
    "document",
    "dcm",
    "my documents",
    "do not match",
    "doc",
    "foobar"
];

m = fuzzyMatch("dcm", lst, function(x) {
    return x.toUpperCase();
});

console.log(m);
