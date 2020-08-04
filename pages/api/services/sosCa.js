import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';

const getSosCaOutputXlsxReadStream = async (newCwd, inputPath) => new Promise(resolve => {
    const outputPath = path.resolve(newCwd, process.env.services.sosCa.outputFileName);
    console.log('Creating Readstream for output path', outputPath, 'inputPath', inputPath)
    fs.access(outputPath, fs.F_OK, (err) => {
        if (err) {
            console.error('No XLSX Output File', err);
            return resolve(null);
        }
        console.log('XLSX Output File Detected', outputPath);
        resolve(fs.createReadStream(outputPath));
    });
});


/*
    returns {
        err,
        stdout,
        stderr,
        fileStream
    }
 */
const callSosCa = async (inputFilePath) => {
    const ddpkgPath = path.resolve(process.cwd(), '..', process.env.services.sosCa.goPath);
    const newCwd = path.dirname(inputFilePath);
    const goArgumentInputFile = path.basename(inputFilePath);
    const cmd = ddpkgPath + ' ' + goArgumentInputFile;

    console.log('Executing SOS CA', { 'newCwd': newCwd, 'cmd': cmd, 'inputFilePath': inputFilePath });

    const soscaResult = await new Promise((resolve) => {
        exec(cmd, { cwd: newCwd }, (err, stdout, stderr) => {
            if (err) {
                console.error(`exec error: ${err}`);
                console.error(`Standard Out: ${stdout} Standard Err: ${stderr}`);
                return resolve({
                    err,
                    stdout,
                    stderr
                });
            }

            console.log(`Standard Out: ${stdout} Standard Err: ${stderr}`);
            resolve({ err: null, stdout, stderr})
        });
    });

    return {
        ...soscaResult,
        filestream: await getSosCaOutputXlsxReadStream(newCwd, goArgumentInputFile)
    }
};

module.exports = {
    callSosCa,
}