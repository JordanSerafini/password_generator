const fs = require('fs');
const path = require('path');

const data = {
    noms: [],
    prenoms: [],
    annee_naissance: [''],
    jour_naissance: [''],
    mois_naissance: [''],
    couleur_preferee: [],
    animaux_compagnie: [],
    enfants: [],
    ville: [],
    surnoms: [],
    code_postal: [],
    emploi: [],
    loisirs: [],
    plat_prefere: [],
    mots_clé: []
};

// Caractères séparateurs et spéciaux
const separators = ['_', '-', '.', '@', '#', '!', '$', '%', '&', '*', '?', '+', '=', '€', '£', '¥', '₹'];
const specialChars = ['!', '!!', '!!!', '!?', '@', '#', '$', '%', '^', '&', '*', '?', '+', '-', '_', '.', '€', '£'];

// Fonction pour capitaliser la première lettre
function capitalizeFirstLetter(word) {
    if (word.length === 0) return '';
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

// Fonction pour capitaliser chaque mot
function capitalizeEachWord(words) {
    return words
        .split(/(\s|-|_|\.)/)
        .map(word => capitalizeFirstLetter(word))
        .join('');
}

// Fonction pour inverser une chaîne
function reverseString(word) {
    return word.split('').reverse().join('');
}

// Fonction pour générer toutes les substitutions possibles
function* generateSubstitutions(word) {
    const substitutionMap = {
        'a': ['a', '4', '@'],
        'b': ['b', '8'],
        'c': ['c', 'k'],
        'd': ['d'],
        'e': ['e', '3'],
        'f': ['f'],
        'g': ['g', '6'],
        'h': ['h'],
        'i': ['i', '1', '!'],
        'j': ['j'],
        'k': ['k'],
        'l': ['l', '1', '!', '£'],
        'm': ['m'],
        'n': ['n'],
        'o': ['o', '0'],
        'p': ['p'],
        'q': ['q'],
        'r': ['r'],
        's': ['s', '5', '$'],
        't': ['t', '7'],
        'u': ['u'],
        'v': ['v'],
        'w': ['w'],
        'x': ['x', 'ks'],
        'y': ['y', 'i'],
        'z': ['z', '2'],
        'ph': ['f'],
        'ck': ['k'],
        'ee': ['i'],
        'oo': ['u']
    };

    // Liste des clés de substitution triées par longueur décroissante pour gérer les substitutions multi-caractères
    const keys = Object.keys(substitutionMap).sort((a, b) => b.length - a.length);

    function* recurse(index, current) {
        if (index >= word.length) {
            yield current;
            return;
        }

        let substituted = false;
        for (const key of keys) {
            if (key.length > 1 && word.slice(index, index + key.length).toLowerCase() === key.toLowerCase()) {
                substituted = true;
                for (const substitution of substitutionMap[key]) {
                    yield* recurse(index + key.length, current + substitution);
                }
            }
        }

        if (!substituted) {
            const char = word[index].toLowerCase();
            if (substitutionMap[char]) {
                for (const substitution of substitutionMap[char]) {
                    yield* recurse(index + 1, current + substitution);
                }
            } else {
                yield* recurse(index + 1, current + word[index]);
            }
        }
    }

    yield* recurse(0, '');
}

// Fonction pour générer toutes les variations d'un mot
function* generateVariations(word) {
    const variations = new Set();

    // Variations basiques
    variations.add(word);
    variations.add(word.toLowerCase());
    variations.add(word.toUpperCase());
    variations.add(capitalizeFirstLetter(word));
    variations.add(capitalizeEachWord(word));
    variations.add(alternateCase(word));
    variations.add(reverseString(word));
    variations.add(phoneticVariations(word));

    // Substitutions
    for (const substitution of generateSubstitutions(word)) {
        variations.add(substitution);
    }

    for (let variation of variations) {
        yield variation;
    }
}

// Fonction pour ajouter des caractères spéciaux à la fin des variations
function* addSpecialChars(variation) {
    yield variation; // Sans caractère spécial
    for (let char of specialChars) {
        yield variation + char; // Avec un caractère spécial ajouté à la fin
    }
}

// Fonction pour alterner majuscules et minuscules
function alternateCase(word) {
    return word.split('').map((char, index) => {
        return index % 2 === 0 ? char.toLowerCase() : char.toUpperCase();
    }).join('');
}

// Fonction pour générer des variations phonétiques
function phoneticVariations(word) {
    const phoneticMap = {
        'ph': 'f',
        'ck': 'k',
        'x': 'ks',
        'y': 'i',
        'ee': 'i',
        'oo': 'u'
    };
    let result = word;
    for (const [key, value] of Object.entries(phoneticMap)) {
        const regex = new RegExp(key, 'gi');
        result = result.replace(regex, value);
    }
    return result;
}

// Fonction pour capitaliser toutes les données de l'objet `data`
function capitalizeData(data) {
    const capitalizedData = {};
    for (const [key, values] of Object.entries(data)) {
        capitalizedData[key] = values.map(value => capitalizeEachWord(value));
    }
    return capitalizedData;
}

// Capitaliser toutes les données de l'objet `data`
const capitalizedData = capitalizeData(data);

// Fusionner les données originales et capitalisées
const allData = {};
for (const key of Object.keys(data)) {
    allData[key] = Array.from(new Set([...data[key], ...capitalizedData[key]]));
}

// Fonction pour générer des initiales pour les noms et prénoms
function generateInitials(noms, prenoms) {
    const initials = new Set();
    for (let nom of noms) {
        for (let prenom of prenoms) {
            if (nom.length === 0 || prenom.length === 0) continue;
            const nomInitial = nom.charAt(0);
            const prenomInitial = prenom.charAt(0);
            initials.add(`${prenomInitial}${nomInitial}`);
            initials.add(`${prenomInitial.toLowerCase()}${nomInitial.toLowerCase()}`);
            initials.add(`${prenomInitial.toUpperCase()}${nomInitial.toUpperCase()}`);
            initials.add(`${prenomInitial.toLowerCase()}${nomInitial.toUpperCase()}`);
            initials.add(`${prenomInitial.toUpperCase()}${nomInitial.toLowerCase()}`);
        }
    }
    return Array.from(initials);
}

let counter = 0;

// Fonction pour générer des combinaisons spécifiques
async function generateSpecificCombinations(writeStream) {
    const initials = generateInitials(allData.noms, allData.prenoms);

    // Liste des données pour les combinaisons spécifiques
    const dataFields = [
        'jour_naissance',
        'mois_naissance',
        'annee_naissance',
        'couleur_preferee',
        'animaux_compagnie',
        'enfants',
        'ville',
        'surnoms',
        'code_postal',
        'emploi',
        'loisirs',
        'plat_prefere',
        'mots_clé'
    ];

    // Générer les combinaisons spécifiques
    for (let initial of initials) {
        for (let field of dataFields) {
            for (let value of allData[field]) {
                if (value && value.length > 0) {
                    const combination = initial + value;
                    await writeVariationsToStream(combination, writeStream);

                    // Ajouter des combinaisons avec séparateurs
                    for (let sep of separators) {
                        const sepCombination = initial + sep + value;
                        await writeVariationsToStream(sepCombination, writeStream);
                    }
                }
            }
        }

        // Combiner avec les dates de naissance
        for (let annee of allData.annee_naissance) {
            for (let mois of allData.mois_naissance) {
                for (let jour of allData.jour_naissance) {
                    if (annee && mois && jour) {
                        const dateCombinations = [
                            `${initial}${annee}${jour}${mois}`,
                            `${initial}${annee}${mois}${jour}`,
                            `${initial}${jour}${mois}${annee}`,
                            `${initial}${annee}`,
                            `${initial}${mois}`,
                            `${initial}${jour}`,
                            `${initial}${jour}${mois}`,
                            `${initial}${mois}${annee}`,
                            `${initial}${annee}${jour}`,
                            `${initial}${annee}${mois}`,
                            `${initial}${jour}${annee}`,
                            `${initial}${mois}${jour}`
                        ];

                        for (let dateComb of dateCombinations) {
                            await writeVariationsToStream(dateComb, writeStream);

                            // Ajouter des combinaisons avec séparateurs
                            const dateArr = dateComb.slice(initial.length).match(/.{1,2}/g) || [dateComb.slice(initial.length)];
                            for (let sep of separators) {
                                const sepDateComb = `${initial}${sep}${dateArr.join(sep)}`;
                                await writeVariationsToStream(sepDateComb, writeStream);
                            }
                        }
                    }
                }
            }
        }
    }
}

// Fonction principale pour générer la liste de mots de passe
async function generatePasswordList() {
    const filePath = path.join(__dirname, 'passwords.txt');
    const writeStream = fs.createWriteStream(filePath, { flags: 'w', encoding: 'utf8' });

    writeStream.on('error', (err) => {
        console.error('Erreur lors de l\'écriture du fichier:', err);
    });

    // Génération des initiales seules
    const initials = generateInitials(allData.noms, allData.prenoms);
    for (let initial of initials) {
        await writeVariationsToStream(initial, writeStream);
    }

    // Générer les combinaisons spécifiques
    await generateSpecificCombinations(writeStream);

    // Collecte de tous les mots de données
    const dataWords = Object.values(allData).flat().filter(word => word && word.length > 0);

    // Générer toutes les combinaisons possibles de données
    const combinationGen = generateAllCombinations(dataWords);

    // Utilisation de l'asynchronicité pour éviter le blocage
    for (let combination of combinationGen) {
        // Pour chaque combinaison, générer toutes les permutations
        for (let permutation of generatePermutations(combination)) {
            await processCombination(permutation, writeStream);
        }
    }

    writeStream.end();
    writeStream.on('finish', () => {
        console.log(`Dictionnaire généré avec succès ! Total: ${counter} mots de passe générés.`);
    });
}

// Fonction pour générer toutes les combinaisons possibles de données
function* generateAllCombinations(dataWords) {
    const n = dataWords.length;
    // Générer toutes les combinaisons de longueur 1 à n
    for (let r = 1; r <= n; r++) {
        yield* combinations(dataWords, r);
    }
}

// Fonction pour générer toutes les combinaisons de longueur r
function* combinations(arr, r) {
    const n = arr.length;
    if (r > n || r <= 0) return;
    const indices = Array.from({ length: r }, (_, i) => i);
    while (true) {
        const combination = indices.map(i => arr[i]);
        yield combination;

        // Trouver la position à incrémenter
        let i = r - 1;
        while (i >= 0 && indices[i] === i + n - r) i--;
        if (i < 0) break;
        indices[i]++;
        for (let j = i + 1; j < r; j++) {
            indices[j] = indices[j - 1] + 1;
        }
    }
}

// Fonction pour générer toutes les permutations d'une combinaison
function* generatePermutations(arr) {
    if (arr.length === 1) {
        yield arr;
        return;
    }
    for (let i = 0; i < arr.length; i++) {
        const rest = arr.slice(0, i).concat(arr.slice(i + 1));
        for (let perm of generatePermutations(rest)) {
            yield [arr[i]].concat(perm);
        }
    }
}

// Fonction pour traiter une combinaison et écrire les variations
async function processCombination(combination, writeStream) {
    const combined = combination.join('');
    await writeVariationsToStream(combined, writeStream);

    // Ajouter des combinaisons avec séparateurs
    for (let sep of separators) {
        const sepCombined = combination.join(sep);
        if (sepCombined.length > 0) {
            await writeVariationsToStream(sepCombined, writeStream);
        }
    }

    // Ajouter des caractères spéciaux avant et après
    for (let char of specialChars) {
        const preCombined = `${char}${combined}`;
        const postCombined = `${combined}${char}`;
        if (preCombined.length > 0) {
            await writeVariationsToStream(preCombined, writeStream);
        }
        if (postCombined.length > 0) {
            await writeVariationsToStream(postCombined, writeStream);
        }
    }

    // Attendre que l'event loop ait une chance de traiter d'autres tâches
    await new Promise(resolve => setImmediate(resolve));
}

// Fonction pour écrire les variations dans le flux en gérant la backpressure
async function writeVariationsToStream(text, writeStream) {
    for (let variation of generateVariations(text)) {
        for (let withSpecialChar of addSpecialChars(variation)) {
            if (!writeStream.write(withSpecialChar + '\n')) {
                await new Promise(resolve => writeStream.once('drain', resolve));
            }
            counter++;

            // Afficher le compteur tous les 100 000 mots de passe générés
            if (counter % 100000 === 0) {
                console.log(`Progression: ${counter} mots de passe générés.`);
            }
        }
    }
}

// Exécuter la génération des mots de passe
generatePasswordList().catch(err => {
    console.error('Erreur lors de la génération des mots de passe:', err);
});
