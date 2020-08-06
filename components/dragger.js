import { Upload, message } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import FileSaver from 'file-saver';
import axios from '../lib/apiClient';
import contentDisposition from 'content-disposition';

const { Dragger } = Upload;

const MESSAGE_SUCCESS_DURATION = 5;
const MESSAGE_FAILURE_DURATION = 15;

const EXCEL_MIME_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

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
        }
        if (status === 'done') {
            const spreadsheetRes = await axios.post(`${process.env.apiClient.url}/get-spreadsheet`, info.file.response,{ responseType: 'arraybuffer', headers: { 'content-type': 'application/json' } } )
                .catch(err => {
                    const errMsg = `Processing of ${info.file.name} generated an error.  Error message: ${err.message}.`;
                    console.error(errMsg, err);
                    message.error(errMsg, MESSAGE_FAILURE_DURATION);
                });
            if (!spreadsheetRes) {
                return;
            }

            var spreadsheetName = contentDisposition.parse(spreadsheetRes.headers['content-disposition']).parameters.filename;

            if (spreadsheetRes.status === 206) {
                const errMsg = `Processing of ${info.file.name} generated an error, but a spreadsheet with potential partial results was created.  Spreadsheet will download with partial results.`;
                console.error(errMsg);
                message.error(errMsg, MESSAGE_FAILURE_DURATION);
            }else {
                message.success(`${info.file.name} file uploaded and processed successfully.  Spreadsheet will download.`, MESSAGE_SUCCESS_DURATION);
            }

            const blob = new Blob([spreadsheetRes.data], {type: `${EXCEL_MIME_TYPE};charset=utf-8`});
            FileSaver.saveAs(blob, spreadsheetName);

        } else if (status === 'error') {
            const details = info.file && info.file.response && info.file.response.msg;
            const errMsg = `${info.file.name} file upload failed. ${details ? details : ''}`;
            console.error(errMsg);
            message.error(errMsg, MESSAGE_FAILURE_DURATION);
        }
    },
};

export default () =>
    (
        <Dragger {...props}>
            <p className="ant-upload-drag-icon">
                <InboxOutlined />
            </p>
            <p className="ant-upload-text">Click or Drag LandVision CSV File Here</p>
            <p className="ant-upload-hint">
                Only a single CSV file supported at this time
            </p>
        </Dragger>)