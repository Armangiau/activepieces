import { googleDriveAuth } from '../..';
import { createAction, Property } from '@activepieces/pieces-framework';

export const downloadFileAndExtractTextFrom = createAction({
  auth: googleDriveAuth,
  name: 'extract_text_gdrive_file',
  displayName: 'Extract text',
  description: 'Extract text from google drive file',
  props: {
    fileId: Property.ShortText({
      displayName: 'File ID',
      description: 'The ID of the file to extract the text',
      required: true,
    })
  },
  run: async ({ auth, propsValue }) => {
    const dlresponse = await fetch(`https://www.googleapis.com/drive/v3/files/${propsValue.fileId}/export?mimeType=text/plain`, {
        headers: {
          'Authorization': `Bearer ${auth.access_token}`
        }
      });
    const blobFile = await dlresponse.blob()
    const blobTextFile = await blobFile.text();
    return blobTextFile;
  },
});
