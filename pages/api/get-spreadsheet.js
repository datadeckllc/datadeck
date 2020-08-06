import {sendJsonResponse} from "./lib";
import fs from 'fs';
import {serializeError} from 'serialize-error';

const setContentDisposition = (res, originalFilename) => {
    const originalFilenameArr = originalFilename.split('.');
    originalFilenameArr.pop();
    const fileNameWithoutExtension = originalFilenameArr.join('.');
    res.setHeader('Content-Disposition', `attachment; filename="${fileNameWithoutExtension}---datadeck.xlsx"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
};


export default async (req, res) => {
    console.log('Received request to get spreadsheet', req.body);
    const sosCaResult = req.body;

    let alreadyResolved=false;
    return new Promise(resolve => {
        if (!sosCaResult.outputFileCreated) {
            const wrappedErr = {
                msg: 'No SOSCA Excel Output File Created by SOSCA Tool',
                err: serializeError(sosCaResult.err)
            };
            console.error(wrappedErr);
            sendJsonResponse(req, res, 500, wrappedErr);
            if (!alreadyResolved) {
                alreadyResolved = true;
                resolve();
            }
            return;
        }

        sosCaResult.filestream = fs.createReadStream(sosCaResult.outputPath);
        sosCaResult.filestream.on('error', err => {
            const wrappedErr = {msg: 'Error reading sosCA Output File', err: serializeError(err)};
            console.error(wrappedErr);
            sendJsonResponse(req, res, 500, wrappedErr);
            if (!alreadyResolved) {
                alreadyResolved = true;
                resolve();
            }
        });

        sosCaResult.err = 'Some error occured'

        setContentDisposition(res, sosCaResult.originalFilename);

        res.status(sosCaResult.status);

        sosCaResult.filestream.pipe(res)
            .on('error', err => {
                const wrappedErr = {msg: 'Error Sending Returning File to Client', err: serializeError(err)};
                console.error(wrappedErr);
                sendJsonResponse(req, res, 500, wrappedErr);
                if (!alreadyResolved) {
                    alreadyResolved = true;
                    resolve();
                }
            })
            .on('close', async () => {
                console.log('Finished.');
                //const msg = sosCaResult. {status: 'success', uuid};
                //sendJsonResponse(req, res, 200, msg);

                // TODO: Make this configurable
                //console.log('Deleting directory', uploadDir);
                // await fs.promises.unlink(uploadDir);

                if (!alreadyResolved) {
                    alreadyResolved = true;
                    resolve();
                }
            });
    });
}