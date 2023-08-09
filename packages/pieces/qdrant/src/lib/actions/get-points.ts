import { createAction } from "@activepieces/pieces-framework";
import { seclectPointsProps, convertToFilter, collectionName } from "../common";
import { qdrantAuth } from "../..";
import { QdrantClient } from "@qdrant/js-client-rest";
import { isArray } from "lodash";

export const getPoints = createAction({
  auth: qdrantAuth,
  name: 'get_points',
  displayName: 'Get Points',
  description: 'Get the points of a specific collection',
  props: {
    collectionName: collectionName(),
    ...seclectPointsProps
  },
  run: async ({ auth, propsValue }) => {
    const client = new QdrantClient({
      apiKey: auth.key,
      url: auth.serverAdress,
    })
    const collectionName = propsValue.collectionName['name'] as string

    if (propsValue.getPointsBy === 'Ids') {
      const ids = propsValue.infosToGetPoint['ids']
      return await client.retrieve(collectionName, {
        ids: isArray(ids) ? ids : [ids]
      })
    }
    
    else {
      const filtering = propsValue.infosToGetPoint as { must: any; must_not: any }
      return await client.scroll(collectionName, {
        filter: convertToFilter(filtering)
      })
    }
  }
})