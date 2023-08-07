import { createPiece, PieceAuth, Property } from "@activepieces/pieces-framework";
import { addPointsToCollection } from "./lib/actions/add-points";

export const qdrantAuth = PieceAuth.CustomAuth({
  displayName: "Qdrant Connection",
  props: {
    serverAdress: Property.ShortText({
      displayName: "Server Adress",
      required: true,
      description: "The url of the Qdrant instance.",
    }),
    key: PieceAuth.SecretText({
      displayName: "API KEY",
      required: true,
      description: "Enter the API Key of your Qdrant account",
    }),
  },   
  required: true,
})

export const qdrant = createPiece({
  displayName: "Qdrant",
  auth: qdrantAuth,
  minimumSupportedRelease: '0.6.0',
  logoUrl: "https://cdn.activepieces.com/pieces/qdrant.png",
  authors: ['ArmanGiau'],
  actions: [addPointsToCollection], // , collectionList, collectionInfos, deleteCollection, deletePoints, getPoints, searchPoints
  triggers: [],
});
