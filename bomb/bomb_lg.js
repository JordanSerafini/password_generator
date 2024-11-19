const fs = require('fs');
const path = require('path');

function createLargeFiles(folderPath, fileSizeInMB = 100) {
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
    }

    let counter = 0;
    const largeData = Buffer.alloc(fileSizeInMB * 1024 * 1024, 'A');

    function writeFile() {
        const fileName = path.join(folderPath, `large_bomb_${counter}.txt`);
        fs.writeFileSync(fileName, largeData);
        console.log(`Created file: ${fileName}`);
        counter++;
        setImmediate(writeFile);
    }

    writeFile();
}

createLargeFiles('./large_bomb', 500); 
