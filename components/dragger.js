import { Upload, message } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import FileSaver from 'file-saver';
import { post } from '../lib/apiClient';

const { Dragger } = Upload;

const MESSAGE_SUCCESS_DURATION = 3;
const MESSAGE_FAILURE_DURATION = 7;

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
            const postResponse = await post(url, { headers: { 'content-type': 'application/json' }, data: info.file.response } );
            message.success(`${info.file.name} file uploaded successfully.`, MESSAGE_SUCCESS_DURATION);
            //const blob = new Blob([info.file.response], {type: `${EXCEL_MIME_TYPE};charset=utf-8`});
            //FileSaver.saveAs(blob, "file.xlsx");

        } else if (status === 'error') {
            const details = info.file && info.file.response && info.file.response.msg;
            message.error(`${info.file.name} file upload failed. ${details ? details : ''}`, MESSAGE_FAILURE_DURATION);
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