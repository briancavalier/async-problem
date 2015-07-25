'use strict';

import { runNode, all, coroutine } from 'creed';
import { readFile } from 'fs';
import { join } from 'path';

// joinPath :: String -> String -> String
const joinPath = init => tail => join(init, tail);

// readFileP :: String -> String -> Promise Error Buffer
const readFileP = encoding => file => runNode(readFile, file, {encoding});

// pipe :: (a -> b) -> (b -> c) -> (a -> c)
const pipe = (f, g) => x => g(f(x));

// concatFiles :: String -> Promise Error String
const concatFiles = coroutine(function* (dir) {
    const readUtf8P = pipe(joinPath(dir), readFileP('utf8'));

    const index = yield readUtf8P('index.txt');
    const results = yield all(index.match(/^.*(?=\n)/gm).map(readUtf8P));
    return results.join('');
});

const main = () => {
    concatFiles(process.argv[2])
        .then(s => process.stdout.write(s));
};

if (process.argv[1] === __filename) main();
