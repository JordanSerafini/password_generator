const fs = require('fs');
const path = require('path');

const data = {
    nom: '',
    prenom: '',
    annee_naissance: '',
    jour_naissance: '',
    mois_naissance: '01',
    date_inversee: '',
    couleur_preferee: 'Bleu',
    animaux_compagnie: ['Chien', 'Chat'],
    enfants: ['Paul', 'Emma'],
    ville_naissance: 'Paris',
    surnom: 'Mimi',
    code_postal: '74000',
    emploi: 'Développeur',
    loisirs: ['Football', 'Musique'],
    plat_prefere: 'Pizza'
};

const separators = ['', '_', '-', '.', '@', '#', '!', '$', '%', '&', '*', '?', '+', '='];
const specialChars = ['!', '@', '#', '$', '%', '^', '&', '*', '?', '+', '-'];

function generateVariations(word) {
    const variations = [];
    variations.push(word.toLowerCase());
    variations.push(word.toUpperCase());
    variations.push(word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
    variations.push(word.charAt(0).toLowerCase() + word.slice(1).toUpperCase());
    return variations;
}

function leetSpeak(word) {
    return word.replace(/a/g, '@')
               .replace(/e/g, '3')
               .replace(/i/g, '1')
               .replace(/o/g, '0')
               .replace(/s/g, '$');
}

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

function generateInitials() {
    const nomInitial = data.nom.charAt(0).toUpperCase();
    const prenomInitial = data.prenom.charAt(0).toUpperCase();
    return [
        `${prenomInitial}${nomInitial}`,
        `${prenomInitial.toLowerCase()}${nomInitial.toLowerCase()}`
    ];
}

function generatePasswordList() {
    let passwordList = [];

    let variations = [];
    Object.values(data).forEach((info) => {
        if (Array.isArray(info)) {
            info.forEach((element) => {
                variations = variations.concat(generateVariations(element));
            });
        } else {
            variations = variations.concat(generateVariations(info));
        }
    });

    let leetVariations = variations.map(leetSpeak);
    variations = variations.concat(leetVariations);

    const initials = generateInitials();
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

    const dates = [
        `${data.jour_naissance}${data.mois_naissance}${data.annee_naissance}`, 
        `${data.annee_naissance}${data.mois_naissance}${data.jour_naissance}`,
        `${data.date_inversee}`, 
        `${data.annee_naissance}`, 
        `${data.jour_naissance}-${data.mois_naissance}-${data.annee_naissance}`,
    ];

    dates.forEach((date) => {
        variations.forEach((variante) => {
            passwordList.push(`${variante}${date}`);
            passwordList.push(`${date}${variante}`);
        });
    });

    const filePath = path.join(__dirname, 'passwords_exhaustif.txt');
    fs.writeFileSync(filePath, passwordList.join('\n'), 'utf8');
    console.log(`Dictionnaire ultra-exhaustif généré avec ${passwordList.length} mots de passe possibles !`);
}

generatePasswordList();
