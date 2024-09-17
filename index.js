const fs = require('fs');
const path = require('path');

const data = {
    noms: [''],
    prenoms: [''],
    annee_naissance: [''],
    jour_naissance: [''],
    mois_naissance: [''],
    dates_inversees: [''],
    couleur_preferee: ['Bleu', 'Vert', 'Rouge'],
    animaux_compagnie: [],
    enfants: [],
    ville_naissance: ['Annecy', 'Lyon'],
    surnoms: ['Jojo', 'Loulou'],
    code_postal: ['74000', '74370', '69000'],
    emploi: ['Développeur', 'Ingénieur'],
    loisirs: ['Football', 'Musique', 'Lecture'],
    plat_prefere: ['Pizza', 'Sushi', 'Burger']
};

const separators = ['', '_', '-', '.', '@', '#', '!', '$', '%', '&', '*', '?', '+', '='];
const specialChars = ['!', '@', '#', '$', '%', '^', '&', '*', '?', '+', '-'];

// Génère des variations en minuscules, majuscules, etc.
function generateVariations(word) {
    const variations = [];
    variations.push(word.toLowerCase());
    variations.push(word.toUpperCase());
    variations.push(word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
    variations.push(word.charAt(0).toLowerCase() + word.slice(1).toUpperCase());
    return variations;
}

// Génère une version en leet speak
function leetSpeak(word) {
    return word.replace(/a/g, '@')
               .replace(/e/g, '3')
               .replace(/i/g, '1')
               .replace(/o/g, '0')
               .replace(/s/g, '$');
}

// Génère des combinaisons entre éléments avec séparateurs
function generateCombinations(elements) {
    let combinations = [];

    elements.forEach((e1) => {
        elements.forEach((e2) => {
            separators.forEach((sep) => {
                combinations.push(`${e1}${sep}${e2}`);
                combinations.push(`${e2}${sep}${e1}`);
            });
        });
    });

    return combinations;
}

// Génère des initiales à partir des prénoms et noms
function generateInitials(noms, prenoms) {
    let initials = [];
    noms.forEach((nom) => {
        prenoms.forEach((prenom) => {
            const nomInitial = nom.charAt(0).toUpperCase();
            const prenomInitial = prenom.charAt(0).toUpperCase();
            initials.push(`${prenomInitial}${nomInitial}`);
            initials.push(`${prenomInitial.toLowerCase()}${nomInitial.toLowerCase()}`);
        });
    });
    return initials;
}

// Ajout de combinaisons simples Prénom + Nom + Code postal
function generateSpecificCombinations() {
    let specificList = [];
    data.prenoms.forEach((prenom) => {
        data.noms.forEach((nom) => {
            data.code_postal.forEach((cp) => {
                // Génération sans séparateurs
                specificList.push(`${prenom}${nom}${cp}`);
                // Génération avec des séparateurs
                separators.forEach((sep) => {
                    specificList.push(`${prenom}${sep}${nom}${sep}${cp}`);
                });
            });
        });
    });

    return specificList;
}

// Écriture en fichier par lots
function writeToFile(passwordList) {
    const filePath = path.join(__dirname, 'passwords_exhaustif_tableau.txt');
    const batchSize = 100000; // Limite de taille pour chaque écriture

    for (let i = 0; i < passwordList.length; i += batchSize) {
        const batch = passwordList.slice(i, i + batchSize);
        fs.appendFileSync(filePath, batch.join('\n') + '\n', 'utf8');
    }

    console.log(`Dictionnaire ultra-exhaustif généré avec ${passwordList.length} mots de passe possibles !`);
}

// Fonction principale pour générer la liste de mots de passe
function generatePasswordList() {
    let passwordList = [];

    // Génération des combinaisons spécifiques sans séparateurs (comme Jordanserafini74370)
    passwordList = passwordList.concat(generateSpecificCombinations());

    // Ajout des autres méthodes de génération (variations, combinaisons, etc.)
    let variations = [];

    Object.keys(data).forEach((key) => {
        data[key].forEach((info) => {
            variations = variations.concat(generateVariations(info));
        });
    });

    let leetVariations = variations.map(leetSpeak);
    variations = variations.concat(leetVariations);

    const initials = generateInitials(data.noms, data.prenoms);
    variations = variations.concat(initials);

    passwordList = passwordList.concat(generateCombinations(variations));

    let extraCombinations = [];
    passwordList.forEach((pwd) => {
        specialChars.forEach((char) => {
            extraCombinations.push(`${pwd}${char}`);
            extraCombinations.push(`${char}${pwd}`);
            extraCombinations.push(`${pwd}${char}123`);
        });
    });

    passwordList = passwordList.concat(extraCombinations);

    data.jour_naissance.forEach((jour, index) => {
        const mois = data.mois_naissance[index];
        const annee = data.annee_naissance[index];
        const dateInverse = data.dates_inversees[index];

        const dates = [
            `${jour}${mois}${annee}`, 
            `${annee}${mois}${jour}`,
            `${dateInverse}`, 
            `${annee}`, 
            `${jour}-${mois}-${annee}`,
        ];

        dates.forEach((date) => {
            variations.forEach((variante) => {
                passwordList.push(`${variante}${date}`);
                passwordList.push(`${date}${variante}`);
            });
        });
    });

    writeToFile(passwordList);
}

generatePasswordList();
