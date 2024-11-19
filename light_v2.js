const fs = require('fs');
const path = require('path');

const data = {
    noms: ['serafini'],
    prenoms: ['jordan', ''],
    annee_naissance: ['1990'],
    jour_naissance: [''],
    mois_naissance: [''],
    couleur_preferee: [''],
    animaux_compagnie: [''],
    enfants: [''],
    ville: [''],
    surnoms: [''],
    code_postal: [''],
    emploi: [''],
    loisirs: [''],
    plat_prefere: [''],
    mots_clé: ['']
};

const separators = ['_', '-', '.', '@'];
const specialChars = ['!', '@', '#', '$', '%'];

// Fonction pour capitaliser la première lettre d'un mot
function capitalizeFirstLetter(word) {
    if (word.length === 0) return '';
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

// Fonction pour générer les substitutions en "leet speak"
function* generateSubstitutions(word) {
    const substitutionMap = {
        'a': ['4', '@'],
        'b': ['8'],
        'e': ['3'],
        'i': ['1', '!'],
        'o': ['0'],
        's': ['5', '$'],
        't': ['7'],
        'g': ['9'],
        'z': ['2'],
        'l': ['1'],
        'b': ['8'],
        'o': ['0'],
        's': ['5', '$'],
        'B': ['8'],
        'O': ['0'],
        'S': ['5', '$']
    };

    function* recurse(index, current) {
        if (index >= word.length) {
            yield current;
            return;
        }

        const char = word[index];
        const lowerChar = char.toLowerCase();

        if (substitutionMap[lowerChar]) {
            for (const substitution of substitutionMap[lowerChar]) {
                // Préserver la casse originale
                const newChar = (char === char.toUpperCase()) ? substitution.toUpperCase() : substitution;
                yield* recurse(index + 1, current + newChar);
            }
        } else {
            yield* recurse(index + 1, current + char);
        }
    }

    yield* recurse(0, '');
}

// Fonction pour générer les variations de casse et les substitutions
function* generateVariations(word) {
    const variations = new Set();
    variations.add(word);
    variations.add(word.toLowerCase());
    variations.add(word.toUpperCase());
    variations.add(capitalizeFirstLetter(word));

    for (const substitution of generateSubstitutions(word)) {
        variations.add(substitution);
        variations.add(substitution.toUpperCase());
        variations.add(capitalizeFirstLetter(substitution));
    }

    for (let variation of variations) {
        yield variation;
    }
}

// Fonction principale pour générer les mots de passe
function JointWords(data, maxWords = 3, separators, specialChars) {
    const wordSet = new Set();

    const fields = Object.keys(data);
    let allWords = [];

    // Collecter tous les mots non vides dans un seul tableau
    for (let field of fields) {
        let words = data[field].filter(word => word && word.length > 0);
        allWords.push(...words);
    }

    // Fonction pour générer les combinaisons
    function generateCombinations(wordsArray, combination = [], start = 0) {
        if (combination.length > 0 && combination.length <= maxWords) {
            // Générer la base du mot en combinant les mots sans séparateur
            let baseWord = combination.join('');
            // Générer les variations de baseWord
            for (let variation of generateVariations(baseWord)) {
                wordSet.add(variation);

                // Ajouter des versions avec caractères spéciaux
                for (let special of specialChars) {
                    wordSet.add(variation + special);
                    wordSet.add(special + variation);
                }
            }

            // Générer les versions avec séparateurs
            for (let sep of separators) {
                let sepWord = combination.join(sep);
                for (let variation of generateVariations(sepWord)) {
                    wordSet.add(variation);

                    // Ajouter des versions avec caractères spéciaux
                    for (let special of specialChars) {
                        wordSet.add(variation + special);
                        wordSet.add(special + variation);
                    }
                }
            }
        }

        if (combination.length === maxWords) return;

        for (let i = start; i < wordsArray.length; i++) {
            generateCombinations(wordsArray, combination.concat(wordsArray[i]), i + 1);
        }
    }

    generateCombinations(allWords);

    return Array.from(wordSet);
}

// Fonction pour écrire les mots de passe dans un fichier texte
function writePasswordsToFile(passwords, filename = 'passwords_combined.txt') {
    const filePath = path.join(__dirname, filename);
    fs.writeFileSync(filePath, passwords.join('\n'), 'utf8');
    console.log(`Dictionnaire généré avec succès dans le fichier ${filename}.`);
}

// Génération des mots de passe et écriture dans le fichier
const wordlist = JointWords(data, 3, separators, specialChars);
writePasswordsToFile(wordlist);
