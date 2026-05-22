interface ClientDocRequest<T = undefined> extends DatabaseRequest<T> {
  discord: Discord;
}
export async function handleClientDoc<T extends import('firebase/firestore').DocumentData> (request: ClientDocRequest<T>): Promise<{ ok: boolean }>;
export async function handleClientDoc<T extends import('firebase/firestore').DocumentData>(method: "GET", request: ClientDocRequest): Promise<{ok: true, data: T } | { ok: false, data: undefined }>;
/**
 * Handles getting, setting, and updating documents in the Firestore database. If the method is "GET", it will return the document data. If the method is not "GET", it will set or update the document with the provided data.
 *
 * @template {DocumentData} T
 * @param {"GET" | DatabaseRequest<T>} method The root collection for the document.
 * @param {DatabaseRequest} request The segments to construct the path with, they are appended to the path.
 * @returns {Promise<P extends "GET" ? T : string>} Either the document data if the method is "GET", or the [STATUSCODE]: STATUSTEXT.
 */
export async function handleClientDoc<T extends import('firebase/firestore').DocumentData> (method: "GET" | ClientDocRequest<T>, request?: ClientDocRequest): Promise<{ ok: boolean; } | { ok: true, data: T } | { ok: false, data: undefined }> {
  const { discord, ...restRequest } = request ? request : method as ClientDocRequest<T>;
  try {
    const accessToken = discord.auth.access_token;
    const userId = discord.auth.user.id;
    if (!accessToken) {
      throw new Error("Missing Discord access token");
    }

    // Sanitize the request data to avoid CORS issues when serializing cross-origin objects

    const jsonData = JSON.stringify(restRequest.method === "POST" ? { ...restRequest, data: restRequest.data, method: "POST" } : { ...restRequest, method: "GET" });
    const response = await fetch(`/api/docs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Auth-Bearer-Token": `Bearer ${ accessToken }`,
        "X-Auth-User-Id": userId,
      },
      body: jsonData,
    });
    if (method === "GET") {
      return await response.json();
    }
    return await response.json();
  } catch (error) {
    console.error("Error handling client document:", error);
    throw new Error(`Error: ${ error instanceof Error ? error.message : "Unknown error" }`);
  }
}

// function sanitizeForSerialization(obj: any): any {
//   if (obj === null || typeof obj !== "object") {
//     return obj;
//   }

//   if (Array.isArray(obj)) {
//     return obj.map(item => sanitizeForSerialization(item));
//   }

//   const sanitized: any = {};
//   for (const key in obj) {
//     if (Object.prototype.hasOwnProperty.call(obj, key)) {
//       const value = obj[key];

//       if (value === null || typeof value !== "object") {
//         sanitized[key] = value;
//       } else if (value.toJSON && typeof value.toJSON === "function") {
//         // Handle objects with toJSON method (like Timestamp)
//         try {
//           sanitized[key] = value.toJSON();
//         } catch {
//           // Skip if toJSON fails (likely cross-origin object)
//           continue;
//         }
//       } else if (Array.isArray(value)) {
//         sanitized[key] = value.map(item => sanitizeForSerialization(item));
//       } else if (key === "author" && value.id && value.username) {
//         // For Discord user objects, only extract safe properties
//         sanitized[key] = {
//           id: value.id,
//           username: value.username,
//           avatar: value.avatar,
//           discriminator: value.discriminator,
//         };
//       } else if (typeof value === "object") {
//         sanitized[key] = sanitizeForSerialization(value);
//       }
//     }
//   }

//   return sanitized;
// }

export default handleClientDoc;
