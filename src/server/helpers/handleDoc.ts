import { doc, getDoc, setDoc, updateDoc, DocumentReference, DocumentData, UpdateData, collection, getDocs, CollectionReference } from "firebase/firestore";
import { type FirebaseOptions, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import dotenv from "dotenv";

dotenv.config();
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

type Segments = [string[], string[], string[], string[]] | [string[], string[], string[]] | [string[], string[], string[]] | [string[], string[]] | [string[]];
function buildSegments (request: DatabaseRequest<any>): Segments {
  const { privateId, channelId, guildId, userId, messageId } = request;
  const segments: string[] = [];
  if (guildId) {
    segments.push(guildId);
    if (channelId) {
      const channelSegments: string[] = [...segments, "channels"];
      segments.push("channels", channelId);
      const privateSegments: string[] = [...segments, "privates"];
      if (privateId) {
        segments.push("privates", privateId);
      }
      if (messageId) {
        const messageSegments: string[] = [...segments, "messages"]
        segments.push("messages", messageId);
        if (segments.includes("privates")) {
          return [segments, channelSegments, privateSegments, messageSegments];
        }
        return [segments, channelSegments];
      } else {
        if (segments.includes("privates")) {
          return [segments, channelSegments];
        }
        return [segments] as Segments;
      }
    }
  } else if (userId) {
    segments.push(userId);
  } else {
    throw new Error("Either guildId or userId must be provided");
  }
  return [segments] as Segments;
}

export async function handleDoc<T extends DocumentData> (request: DatabaseRequest<T>): Promise<undefined>;
export async function handleDoc<T extends DocumentData>(method: "GET", request: DatabaseRequest): Promise<T>;
/**
 * Handles getting, setting, and updating documents in the Firestore database. If the method is "GET", it will return the document data. If the method is not "GET", it will set or update the document with the provided data.
 *
 * @template {DocumentData} T
 * @param {"GET" | T} method The data to set or update the document with, or the string "GET" to get the document data.
 * @param {DatabaseRequest<T>} request The segments to construct the path with, they are appended to the path.
 * @returns {Promise<P extends "GET" ? T : undefined>}
 */
export async function handleDoc<T extends DocumentData> (method: "GET" | DatabaseRequest<T>, request?: DatabaseRequest): Promise<undefined | T> {
  const { wantsDocs, kind = "messages", root = "guilds", data } = method === "GET" ? request! : method;
  const segments = buildSegments(method === "GET" ? request! : method);
  // let guildCol: Awaited<ReturnType<typeof getDocs>> | null = null;
  // let channelCol: Awaited<ReturnType<typeof getDocs>> | null = null;
  // let privateCol: Awaited<ReturnType<typeof getDocs>> | null = null;
  // if (segments.length > 1) {
  //   guildCol = await getDocs(collection(db, root));
  //   channelCol = await getDocs(collection(db, root, ...segments[1]));
  //   if (segments.length > 2) {
  //     privateCol = await getDocs(collection(db, root, ...segments[2]));
  //   }
  // }
  if (wantsDocs) {
    if (kind === "messages") segments[0].push(kind);
    const colRef = collection(db, root, ...segments[0]) as CollectionReference<T, T>;
    const querySnap = await getDocs(colRef);
    const docs: T[] = [];
    if (querySnap.empty) {
      console.warn("No documents found");
      return;
    } else {
      querySnap.forEach((docSnap) => {
        if (docSnap.exists()) {
          docs.push(docSnap.data() as T);
        }
      });
      return docs as unknown as T;
    }
  }
  const docRef = doc(db, root, ...segments[0]) as DocumentReference<T, T>;
  const docSnap = await getDoc(docRef);
  if (method === "GET" || (request && request.method === "GET")) {
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      throw new Error("Document does not exist");
    }
  } else {
    if (data) {
      if (docSnap.exists()) {
        await updateDoc(docRef, data as UpdateData<T>);
      } else {
        // if (guildCol && guildCol.empty) {
        //   throw new Error("Guild Collection does not exist");
        // }
        // if (channelCol && channelCol.empty) {
        //   throw new Error("Channel Collection does not exist");
        // }
        // if (privateCol && privateCol.empty) {
        //   throw new Error("Private Collection does not exist");
        // }
        //@ts-ignore
        await setDoc(docRef, data);
      }
    } else {
      throw new Error("No data provided for set");
    }
  }
}
