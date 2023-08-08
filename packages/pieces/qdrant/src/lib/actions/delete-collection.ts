import { Property, createAction } from "@activepieces/pieces-framework";
import {qdrantAuth} from '../..'
import { QdrantClient } from "@qdrant/js-client-rest";

export const deleteCollection = createAction({
  auth: qdrantAuth,
  name: 'delete_collection',
  displayName: 'Delete Collection',
  description: 'Delete a collection of your database',
  props: {
    collectionName: Property.ShortText({
      displayName: 'Collection Name',
      description: 'The name of the collection to delete',
      required: true,
    })
  },
  run: async ({auth, propsValue}) => {
    const client = new QdrantClient({
      apiKey: auth.key,
      url: auth.serverAdress,
    });
    const response = await client.deleteCollection(propsValue.collectionName);
    return response
  }
})