const fs = require('fs');
const path = require('path');

const data = {
    noms: ['', 'Dupont', 'Martin'],
    prenoms: ['', 'Pierre', 'Sophie'],
    annee_naissance: ['', '1985', '2000'],
    jour_naissance: ['', '15', '07'],
    mois_naissance: ['01', '05', '12'],
    dates_inversees: ['', '19850515', '20001207'],
    couleur_preferee: ['Bleu', 'Vert', 'Rouge'],
    animaux_compagnie: ['Chien', 'Chat', 'Lapin'],
    enfants: ['Paul', 'Emma', 'Lucas'],
    ville_naissance: ['Annecy', 'Paris', 'Lyon'],
    surnoms: ['Mimi', 'Jojo', 'Loulou'],
    code_postal: ['74000', '75000', '69000'],
    emploi: ['Développeur', 'Designer', 'Ingénieur'],
    loisirs: ['Football', 'Musique', 'Lecture'],
    plat_prefere: ['Pizza', 'Sushi', 'Burger']
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

function generatePasswordList() {
    let passwordList = [];

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

    const filePath = path.join(__dirname, 'passwords_exhaustif_tableau.txt');
    fs.writeFileSync(filePath, passwordList.join('\n'), 'utf8');
    console.log(`Dictionnaire ultra-exhaustif généré avec ${passwordList.length} mots de passe possibles !`);
}

generatePasswordList();
