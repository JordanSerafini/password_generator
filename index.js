const fs = require('fs');
const path = require('path');

const data = {
    nom: 'Kante',
    prenom: 'Marie',
    annee_naissance: '1995',
    jour_naissance: '13',
    mois_naissance: '07',
    date_inversee: '950713', 
    couleur_preferee: 'Bleu',
    animaux_compagnie: ['Chien', 'Chat'],
    enfants: ['Paul', 'Emma'],
    ville_naissance: 'Paris',
    surnom: 'Mimi'
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
