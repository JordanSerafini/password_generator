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

function JointWords(data, maxWords = 3, separators, specialChars) {
    let wordlist = [];

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
            wordlist.push(baseWord);

            // Ajouter des versions avec séparateurs
            for (let sep of separators) {
                wordlist.push(combination.join(sep));
            }

            // Ajouter des versions avec caractères spéciaux à la fin et au début
            for (let special of specialChars) {
                wordlist.push(baseWord + special);
                wordlist.push(special + baseWord);

                // Versions avec séparateurs et caractères spéciaux
                for (let sep of separators) {
                    let separatedWord = combination.join(sep);
                    wordlist.push(separatedWord + special);
                    wordlist.push(special + separatedWord);
                }
            }
        }

        if (combination.length === maxWords) return;

        for (let i = start; i < wordsArray.length; i++) {
            generateCombinations(wordsArray, combination.concat(wordsArray[i]), i + 1);
        }
    }

    generateCombinations(allWords);

    return wordlist;
}
