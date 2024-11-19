const fs = require('fs');
const path = require('path');

const data = {
    noms: ['serafini'],
    prenoms: ['', 'jordan'],
    annee_naissance: ['1990'],
    jour_naissance: [''],
    mois_naissance: [''],
    couleur_preferee: [''],
    animaux_compagnie: [''],
    enfants: [''],
    ville: ['annecy'],
    surnoms: [''],
    code_postal: ['74370'],
    emploi: [''],
    loisirs: [''],
    plat_prefere: [''],
    mots_clé: ['', '']
};

const separators = ['_', '-', '.', '@'];
const specialChars = ['!', '@', '#', '$', '%'];

function capitalizeFirstLetter(word) {
    if (word.length === 0) return '';
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

function* generateSubstitutions(word) {
    const substitutionMap = {
        'a': ['a', '4'],
        'e': ['e', '3'],
        'i': ['i', '1'],
        'o': ['o', '0'],
        's': ['s', '5']
    };

    function* recurse(index, current) {
        if (index >= word.length) {
            yield current;
            return;
        }

        const char = word[index].toLowerCase();
        if (substitutionMap[char]) {
            for (const substitution of substitutionMap[char]) {
                yield* recurse(index + 1, current + substitution);
            }
        } else {
            yield* recurse(index + 1, current + word[index]);
        }
    }

    yield* recurse(0, '');
}

function* generateVariations(word) {
    const variations = new Set();
    variations.add(word);
    variations.add(word.toLowerCase());
    variations.add(word.toUpperCase());
    variations.add(capitalizeFirstLetter(word));

    for (const substitution of generateSubstitutions(word)) {
        variations.add(substitution);
    }

    for (let variation of variations) {
        yield variation;
    }
}

function* addSpecialChars(variation) {
    yield variation;
    for (let char of specialChars) {
        yield variation + char;
    }
}

function* generateCombinations(data) {
    const dataFields = Object.values(data).flat().filter(word => word && word.length > 0);

    for (let word1 of dataFields) {
        for (let word2 of dataFields) {
            if (word1 !== word2) {
                for (let word3 of dataFields) {
                    if (word1 !== word3 && word2 !== word3) {
                        yield word1 + word2 + word3;
                        for (let sep of separators) {
                            yield word1 + sep + word2 + sep + word3;
                        }
                    }
                }
            }
        }
    }
}

async function writeVariationsToStream(variations, writeStream) {
    for (let variation of variations) {
        for (let withSpecialChar of addSpecialChars(variation)) {
            if (!writeStream.write(withSpecialChar + '\n')) {
                await new Promise(resolve => writeStream.once('drain', resolve));
            }
        }
    }
}

async function generatePasswordList() {
    const filePath = path.join(__dirname, 'passwords_combined.txt');
    const writeStream = fs.createWriteStream(filePath, { flags: 'w', encoding: 'utf8' });

    writeStream.on('error', (err) => {
        console.error('Erreur lors de l\'écriture du fichier:', err);
    });

    const combinations = generateCombinations(data);
    
    for (let combination of combinations) {
        const variations = generateVariations(combination);
        await writeVariationsToStream(variations, writeStream);
    }

    writeStream.end();
    writeStream.on('finish', () => {
        console.log('Dictionnaire généré avec succès.');
    });
}

generatePasswordList().catch(err => {
    console.error('Erreur lors de la génération des mots de passe:', err);
});
