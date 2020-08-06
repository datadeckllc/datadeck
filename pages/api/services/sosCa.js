import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';

const MAX_BUFFER = 50000;

const verifySosCaOutputXlsx = async (newCwd, inputPath, outputPath) => new Promise(resolve => {

    console.log('Creating Readstream for output path', outputPath, 'inputPath', inputPath)
    fs.access(outputPath, fs.F_OK, (err) => {
        if (err) {
            console.error('No XLSX Output File', err);
            return resolve(false);
        }
        console.log('XLSX Output File Detected', outputPath);
        resolve(true);
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
const callSosCa = async (inputFilePath, originalFilename) => {
    const ddpkgPath = path.resolve(process.cwd(), '..', process.env.services.sosCa.goPath);
    const newCwd = path.dirname(inputFilePath);
    const goArgumentInputFile = path.basename(inputFilePath);
    const cmd = ddpkgPath + ' ' + goArgumentInputFile;

    console.log('Executing SOS CA', { 'newCwd': newCwd, 'cmd': cmd, 'inputFilePath': inputFilePath });

    const sosCaProgResult = await new Promise((resolve) => {
        exec(cmd, { cwd: newCwd, maxBuffer: 1024 * MAX_BUFFER }, (err, stdout, stderr) => {
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

    const outputPath = path.resolve(newCwd, process.env.services.sosCa.outputFileName);

    const outputFileCreated = await verifySosCaOutputXlsx(newCwd, goArgumentInputFile, outputPath)
    let status;
    if (sosCaProgResult.err && outputFileCreated) {
        status = 206;
    }
    else if (sosCaProgResult.err) {
        status = 500;
    }
    else {
        status = 200
    }
    return {
        ...sosCaProgResult,
        outputFileCreated,
        outputPath,
        originalFilename,
        status
    }
};

export {
    callSosCa,
}