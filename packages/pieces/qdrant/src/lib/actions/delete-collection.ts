import { createAction } from "@activepieces/pieces-framework";
import {qdrantAuth} from '../..'
import { QdrantClient } from "@qdrant/js-client-rest";
import { collectionName } from "../common";

export const deleteCollection = createAction({
  auth: qdrantAuth,
  name: 'delete_collection',
  displayName: 'Delete Collection',
  description: 'Delete a collection of your database',
  props: {
    collectionName: collectionName(),
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