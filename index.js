const fs = require('fs');
const path = require('path');

const data = {
    noms: [''],
    prenoms: [''],
    annee_naissance: [''],
    jour_naissance: [''],
    mois_naissance: [''],
    couleur_preferee: ['Bleu', 'Vert', 'Rouge'],
    animaux_compagnie: [],
    enfants: [],
    ville_naissance: ['Annecy', 'Lyon'],
    surnoms: ['', ''],
    code_postal: ['74000', '74370', '69000'],
    emploi: ['', ''],
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

    variations.push(alternateCase(word));
    variations.push(leetSpeak(word));

    return variations;
}

function leetSpeak(word) {
    return word.replace(/a/g, '@')
               .replace(/e/g, '3')
               .replace(/i/g, '1')
               .replace(/o/g, '0')
               .replace(/s/g, '$')
               .replace(/l/g, '1')
               .replace(/t/g, '7');
}

// Fonction pour alterner majuscules/minuscules dans un mot
function alternateCase(word) {
    return word.split('').map((char, index) => {
        return index % 2 === 0 ? char.toUpperCase() : char.toLowerCase();
    }).join('');
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

function generateSpecificCombinations() {
    let specificList = [];
    data.prenoms.forEach((prenom) => {
        data.noms.forEach((nom) => {
            data.code_postal.forEach((cp) => {
                specificList.push(`${prenom}${nom}${cp}`);
                specialChars.forEach((char) => {
                    specificList.push(`${prenom}${nom}${cp}${char}`);
                });
                data.jour_naissance.forEach((jour) => {
                    data.mois_naissance.forEach((mois) => {
                        data.annee_naissance.forEach((annee) => {
                            specificList.push(`${prenom}${nom}${cp}${jour}${mois}${annee}`);
                        });
                    });
                });
                separators.forEach((sep) => {
                    specificList.push(`${prenom}${sep}${nom}${sep}${cp}`);
                });
            });
        });
    });

    return specificList;
}

function writeBatchToFile(passwordList, batchNumber) {
    const filePath = path.join(__dirname, `passwords_batch_${batchNumber}.txt`);
    fs.writeFileSync(filePath, passwordList.join('\n') + '\n', 'utf8');
}

function generatePasswordList() {
    let passwordList = [];
    let batchNumber = 1;
    let batchSize = 1000000;
    let currentBatch = [];

    const addPasswordsToBatch = (newPasswords) => {
        currentBatch = currentBatch.concat(newPasswords);
        if (currentBatch.length >= batchSize) {
            writeBatchToFile(currentBatch, batchNumber);
            batchNumber++;
            currentBatch = [];
        }
    };

    addPasswordsToBatch(generateSpecificCombinations());

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

    addPasswordsToBatch(generateCombinations(variations));

    let extraCombinations = [];
    passwordList.forEach((pwd) => {
        specialChars.forEach((char) => {
            extraCombinations.push(`${pwd}${char}`);
            extraCombinations.push(`${char}${pwd}`);
            extraCombinations.push(`${pwd}${char}123`);
        });
    });

    addPasswordsToBatch(extraCombinations);

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
                addPasswordsToBatch([`${variante}${date}`, `${date}${variante}`]);
            });
        });
    });

    if (currentBatch.length > 0) {
        writeBatchToFile(currentBatch, batchNumber);
    }

    console.log(`Dictionnaire généré avec succès dans plusieurs fichiers !`);
}

generatePasswordList();
