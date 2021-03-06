import fs from 'fs';
import {serializeError} from 'serialize-error';
import formidable from 'formidable';
import {v4 as uuidv4} from 'uuid';
import {runMiddleware} from './middleware';

import {sendJsonResponse} from "./lib";
import { callSosCa } from './services/sosCa';

const setKeepAliveAndTimeouts = (req, res, next) => {
    req.socket.setKeepAlive();

    req.socket.on('timeout', () => {
        console.log('Socket timed out');
    });

    req.socket.on( "error", err => {
        console.log('Socket error', err);
    } );

    req.socket.on( "end", () => {
        console.log('Socket end');
    } );

    req.setTimeout(process.env.api.timeout, () => {
        console.log("Server timed out.  Milliseconds: ", process.env.api.timeout);
    });

    next();
};

// Disable the JSON body parser so we get a stream
export const config = {
    api: {
        bodyParser: false,
    },
};

const ensureDirExists = async targetDir => fs.promises.mkdir(targetDir, { recursive: true });


export default async (req, res) => {
    // Run the middleware: https://nextjs.org/docs/api-routes/api-middlewares
    await runMiddleware(req, res, setKeepAliveAndTimeouts);

    const uuid = uuidv4();

    const uploadDir = `/tmp/dataDeck/seedData/${uuid}`;
    await ensureDirExists(uploadDir);

    let alreadyResolved = false;
    return new Promise(resolve => {
        const form = new formidable.IncomingForm({uploadDir});
        form.parse(req, async (err, fields, files) => {
                try {
                    if (err) {
                        const wrappedErr = {msg: 'Error reading posted file', err: serializeError(err)};
                        console.error(wrappedErr);
                        sendJsonResponse(req, res, 500, wrappedErr);
                        alreadyResolved=true;
                        if (!alreadyResolved) {
                            resolve();
                        }
                        return;
                    }

                    const originalFilename = files.file.name;
                    console.log('Finished parsing uploaded file', {fullPath: files.file.path, originalFilename, uuid});

                    console.log('Calling SOS CA');
                    const sosCaResult = await callSosCa(files.file.path, originalFilename);
                    console.log('Finished Calling SOS CA.', sosCaResult);

                    delete sosCaResult.stdout;
                    sendJsonResponse(req, res, 200, sosCaResult);
                    alreadyResolved=true;
                    resolve();}
                catch (err) {
                    const wrappedErr = {msg: 'Unhandled error reading posted file', err: serializeError(err)};
                    console.error(wrappedErr);
                    sendJsonResponse(req, res, 500, wrappedErr);
                    alreadyResolved=true;
                    if (!alreadyResolved) {
                        resolve();
                    }
                }
            }
        )
    });
}