const fs = require('fs');
const path = require('path');

function createFileBomb(folderPath, maxFiles = 100) {
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
    }

    let counter = 0;

    function writeFile() {
        if (counter >= maxFiles) {
            console.log(`Created ${maxFiles} files. Stopping.`);
            return;
        }

        const fileName = path.join(folderPath, `bomb_${counter}.txt`);
        const content = `This is bomb file number ${counter}\n`.repeat(100);

        fs.writeFileSync(fileName, content, 'utf8');
        console.log(`Created file: ${fileName}`);
        counter++;

        setImmediate(writeFile);
    }

    writeFile();
}

// Exemple avec 100 fichiers max
createFileBomb('./bomb_folder', 100);
