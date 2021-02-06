// * This is a comment
// .model 2N3819 NJF(Beta=1.304m Betatce=-.5 Rd=1 Rs=1 
//     + Lambda=2.25m Vto=-3 Vtotc=-2.5m Is=33.57f Isr=322.4f 
//     + N=1 Nr=2 Xti=3 Alpha=311.7u Vk=243.6 Cgd=1.6p M=.3622 
//     + Pb=1 Fc=.5 Cgs=2.414p Kf=9.882E-18 Af=1 mfg=Vishay)

import { between, boolean, choice, digits, letters, many, regex, safeword, sepBy, sequenceOf, str, whitespace } from "./StrParse.js";
import { setWindow } from "./Utils.js";

function removeDoubleSpaces(str) {
    if (!str) return str;
    return str.replace(/[\r\t\f\v]/g, ' ').replace(/ {2,}|\n{2,}/g, ' ');
}

function removeSpacesBetweenOperands(str) {
    if (!str) return str;
    return str
        .replace(/([(){}:"'=+\-*\/]+)( +)/g, '$1')   // Spaces after
        .replace(/( +)([(){}:"'=+\-*\/]+)/g, '$2') // Spaces before
}

function removeCommentLines(str) {
    if (!str) return str;
    return str
        .split('\n')
        .filter(x => !x.match(/^\*.*$/g))
        .join('\n');
}

function joinLinesByPlus(str) {
    if (!str) return str;
    return str
        .replace(/\n *\+/g, ' ')
}

function preprocessString(str) {
    return str
        .split('\n')
        .map(x => x.trim())                         // trim
        .filter(x => !x.match(/^\*.*$/g))           // remove comments
        .join('\n')
        .replace(/\n *\+/g, ' ')                    // Join lines that have + concat
        .replace(/([(){}:"'=+\-*\/]+)( +)/g, '$1')  // Spaces after operands
        .replace(/( +)([(){}:"'=+\-*\/]+)/g, '$2')  // Spaces before operands
        .replace(/[\r\t\f\v]/g, ' ').replace(/ {2,}|\n{2,}/g, ' '); // Double whitespace
}


// Syntax: .model <modname> <type>[(<parameter list>)]
export const parameterParser = boolean(
    between(str('('), str(')'))(
        sepBy(whitespace)(
            sequenceOf([
                safeword,
                str('='),
                regex(/^[a-zA-Z0-9+-\.\/]+/), // todo: numberExpr parser (sci and eng formats)
            ]).map(x => [x[0], x[2]])
        ).map(x => Object.fromEntries(x))
    )
)

export const parser = sequenceOf([
    str('.model', false),
    whitespace,
    safeword,
    whitespace,
    safeword,
    parameterParser,
]).map(x => ({
    modname: x[2],
    type: x[4],
    params: x[5],
}))


function prep() {
    let a = document.getElementById('file-content');
    let b = preprocessString(a.innerText)
    return b;
}

setWindow({ prep, parser, preprocessString });


