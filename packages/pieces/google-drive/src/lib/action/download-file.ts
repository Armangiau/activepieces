import { googleDriveAuth } from '../..';
import { createAction, Property } from '@activepieces/pieces-framework';

export const downloadFile = createAction({
  auth: googleDriveAuth,
  name: 'download_ggdrive_file',
  displayName: 'Download file',
  description: 'Download a selected file from google drive file',
  props: {
    fileId: Property.ShortText({
      displayName: 'File ID',
      description: 'The ID of the file to download',
      required: true,
    }),
    mimeType: Property.ShortText({
      displayName: 'MIME type',
      description: 'The MIME type of the file to download',
      required: true,
    }),
  },
  run: async ({ auth, propsValue }) => {
    const googledlCall = (url: string) =>
      fetch(url, {
        headers: {
          Authorization: `Bearer ${auth.access_token}`,
        },
      }).then((response) =>
        response.ok ? response.blob() : Promise.reject(response)
      );

    // the google drive API doesn't allowed downloading google documents but we can export them to office formats
    if (
      [
        'application/vnd.google-apps.folder',
        'application/vnd.google-apps.spreadsheet',
        'application/vnd.google-apps.presentation',
      ].includes(propsValue.mimeType)
    ) {
      switch (propsValue.mimeType) {
        case 'application/vnd.google-apps.document':
          propsValue.mimeType =
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
          break;
        case 'application/vnd.google-apps.spreadsheet':
          propsValue.mimeType =
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          break;
        case 'application/vnd.google-apps.presentation':
          propsValue.mimeType =
            'application/vnd.openxmlformats-officedocument.presentationml.presentation';
          break;
      }
      const exportURL = `https://www.googleapis.com/drive/v3/files/${propsValue.fileId}/export?mimeType=${propsValue.mimeType}`;
      try {
        const exportFile = await googledlCall(exportURL);
        return Buffer.from(await exportFile.arrayBuffer());
      } catch (error) {
        throw new Error(
          `Error when download file:\n\tDownload file response: ${
            (error as Error).message
          }`
        );
      }
    } else {
      const dlURL = `https://www.googleapis.com/drive/v3/files/${propsValue.fileId}?alt=media`;
      try {
        const dlFile = await googledlCall(dlURL);
        return Buffer.from(await dlFile.arrayBuffer());
      } catch (error) {
        throw new Error(
          `Error when download file:\n\tDownload file response: ${
            (error as Error).message
          }`
        );
      }
    }
  },
});
