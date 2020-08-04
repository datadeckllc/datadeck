import fs from 'fs';
import {serializeError } from 'serialize-error';
import formidable from 'formidable';
import { v4 as uuidv4 } from 'uuid';
import { runMiddleware } from './middleware';
import timeout from 'connect-timeout';
const test = require('./services/sosCa');
const { callSosCa } = require('./services/sosCa');
const haltOnTimedout = (req, res, next) => {
  if (!req.timedout) {
    next();
  }
};

// Disable the JSON body parser so we get a stream
export const config = {
  api: {
    bodyParser: false,
  },
};

const sendJsonResponse = (req, res, code, data) => {
  if (res.headersSent) {
    return console.error('Response headers already sent.  Will not attempt to re-send response', data);
  }
  res.status(code).json(data);
};

const ensureDirExists = async targetDir => fs.promises.mkdir(targetDir, { recursive: true });

const setContentDisposition = res => {
  res.setHeader('Content-Disposition', `attachment; filename="${process.env.services.sosCa.outputFileName}"`);
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
};

export default async (req, res) => {
  // Run the middleware: https://nextjs.org/docs/api-routes/api-middlewares
  await runMiddleware(req, res, timeout(process.env.api.timeout))
  // Add all other middleware here
  await runMiddleware(req, res, haltOnTimedout);

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

            console.log('Finished parsing uploaded file', {fullPath: files.file.path, originalFilename: files.file.name, uuid});

            console.log('Calling SOS CA');
            const sosCaResult = await callSosCa(files.file.path);
            console.log('Finished Calling SOS CA.', sosCaResult);

            if (!sosCaResult.filestream) {
              const wrappedErr = {msg: 'No SOSCA Excel Output File Created by SOSCA Tool', err: serializeError(err)};
              console.error(wrappedErr);
              alreadyResolved=true;
              sendJsonResponse(req, res, 500, wrappedErr);
              if (!alreadyResolved) {
                resolve();
              }
              return;
            }

            sosCaResult.filestream.on('error', err => {
              const wrappedErr = {msg: 'Error reading sosCA Output File', err: serializeError(err)};
              console.error(wrappedErr);
              alreadyResolved=true;
              sendJsonResponse(req, res, 500, wrappedErr);
              if (!alreadyResolved) {
                resolve();
              }
            });

            if (sosCaResult.err) {
              console.log('Partial results detected');
              res.status(206); // Let the pipe finish the partial results
            }

            setContentDisposition(res);

            sosCaResult.filestream.pipe(res)
                .on('error', err => {
              const wrappedErr = {msg: 'Error Sending Returning File to Client', err: serializeError(err)};
              console.error(wrappedErr);
              alreadyResolved=true;
              sendJsonResponse(req, res, 500, wrappedErr);
              if (!alreadyResolved) {
                resolve();
              }
            })
                .on('close', async () => {
                  console.log('Finished.');
                  //const msg = sosCaResult. {status: 'success', uuid};
                  //sendJsonResponse(req, res, 200, msg);

                  console.log('Deleting directory', uploadDir);
                  // await fs.promises.unlink(uploadDir);
                  alreadyResolved = true;
                  if (!alreadyResolved) {
                    resolve();
                  }
                });
          }
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