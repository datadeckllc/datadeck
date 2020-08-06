import { Upload, message } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import FileSaver from 'file-saver';
import axios from '../lib/apiClient';
import contentDisposition from 'content-disposition';
import utilStyles from '../styles/utils.module.css'
import {useState} from 'react';

const { Dragger } = Upload;

const MESSAGE_SUCCESS_DURATION = 5;
const MESSAGE_FAILURE_DURATION = 15;

const UPLOAD_MESSAGE_UPLOAD = 'UPLOAD FILE';
const UPLOAD_MESSAGE_PROCESSING = 'PROCESSING FILE...';

const EXCEL_MIME_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

export default () => {
    const [uploadMessage, setUploadMessage] = useState(UPLOAD_MESSAGE_UPLOAD);

    const props = {
        accept: EXCEL_MIME_TYPE,
        name: 'file',
        multiple: false,
        showUploadList: false,
        action: `${process.env.apiClient.url}/seed-data`,
        onChange: async info => {
            //console.log('Received upload response.  info', info);
            const { status } = info.file;
            if (status !== 'uploading') {
                console.log(info.file, info.fileList);
                setUploadMessage(UPLOAD_MESSAGE_PROCESSING);
            }
            else {
                setUploadMessage(UPLOAD_MESSAGE_UPLOAD);
            }
            if (status === 'done') {
                const spreadsheetRes = await axios.post(`${process.env.apiClient.url}/get-spreadsheet`, info.file.response,{ responseType: 'arraybuffer', headers: { 'content-type': 'application/json' } } )
                    .catch(err => {
                        const errMsg = `FAILURE: Processing of ${info.file.name} generated an error.  Error message: ${err.message}.`;
                        console.error(errMsg, err);
                        message.error(errMsg, MESSAGE_FAILURE_DURATION);
                        setUploadMessage(errMsg);
                    });
                if (!spreadsheetRes) {
                    return;
                }

                var spreadsheetName = contentDisposition.parse(spreadsheetRes.headers['content-disposition']).parameters.filename;

                if (spreadsheetRes.status === 206) {
                    const errMsg = `PARTIAL SUCCESS: Processing of ${info.file.name} generated an error, but a spreadsheet with potential partial results was created.  Spreadsheet will download with partial results.`;
                    console.error(errMsg);
                    message.error(errMsg, MESSAGE_FAILURE_DURATION);
                    setUploadMessage(errMsg);
                }else {
                    const msg = `SUCCESS: ${info.file.name} file uploaded and processed successfully.  Spreadsheet will download.`;
                    message.success(msg, MESSAGE_SUCCESS_DURATION);
                    setUploadMessage(msg);
                }

                const blob = new Blob([spreadsheetRes.data], {type: `${EXCEL_MIME_TYPE};charset=utf-8`});
                FileSaver.saveAs(blob, spreadsheetName);

            } else if (status === 'error') {
                const details = info.file && info.file.response && info.file.response.msg;
                const errMsg = `FAILED:${info.file.name} file upload failed. ${details ? details : ''}`;
                console.error(errMsg);
                message.error(errMsg, MESSAGE_FAILURE_DURATION);
                setUploadMessage(errMsg)
            }
        },
    };

   return (
       <div>
            <div className={`${utilStyles.headingMd} ${utilStyles.red} ${utilStyles.center}`}>{uploadMessage}</div>
            <Dragger {...props}>

                <p className="ant-upload-drag-icon">
                    <InboxOutlined/>
                </p>
                <p className="ant-upload-text">Click or Drag LandVision CSV File Here</p>
                <p className="ant-upload-hint">
                    Only a single CSV file supported at this time
                </p>
            </Dragger>
       </div>)

}