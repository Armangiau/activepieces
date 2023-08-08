import { Property, createAction } from '@activepieces/pieces-framework';
import { convertToFilter, seclectPointsProps } from '../common';
import { qdrantAuth } from '../..';
import { QdrantClient } from '@qdrant/js-client-rest';

export const deletePoints = createAction({
  auth: qdrantAuth,
  name: 'delete_points',
  displayName: 'Delete Points',
  description: 'Delete points of a specific collection',
  props: {
    collectionName: Property.ShortText({
      displayName: 'Collection Name',
      description: 'The name of the collection to delete points from',
      required: true,
    }),
    ...seclectPointsProps,
  },
  run: async ({ auth, propsValue }) => {
    const client = new QdrantClient({
      apiKey: auth.key,
      url: auth.serverAdress,
    });
    if (propsValue.getPointsBy === 'Ids')
      return await client.delete(propsValue.collectionName, {
        points: propsValue.infosToGetPoint['ids'],
      });

    return await client.delete(propsValue.collectionName, {
      filter: convertToFilter(
        propsValue.infosToGetPoint as { must: any; must_not: any }
      ),
    });
  },
});
