function downloadAttachment(baseUrl: string, id: number): string {
  return `${baseUrl}/download/${id}/`;
}

function downloadFile(baseUrl: string, bucket: string, id: number): string {
  return `${baseUrl}/download/${bucket}/${id}/`;
}

function downloadStaticFile(baseUrl: string, name: string): string {
  return `${baseUrl}/download/${name}/`;
}

function getAttachment(baseUrl: string, id: number): string {
  return `${baseUrl}/${id}/`;
}

function getAttachmentData(baseUrl: string, id: number): string {
  return `${baseUrl}/data/${id}/`;
}

function getFile(baseUrl: string, bucket: string, id: number): string {
  return `${baseUrl}/${bucket}/${id}/`;
}

function getFileData(baseUrl: string, bucket: string, id: number): string {
  return `${baseUrl}/data/${bucket}/${id}/`;
}

function getStaticFile(baseUrl: string, name: string): string {
  return `${baseUrl}/${name}/`;
}

function uploadAttachment(baseUrl: string): string {
  return `${baseUrl}//`;
}

function uploadFile(baseUrl: string, bucket: string): string {
  return `${baseUrl}/${bucket}/`;
}

function createMessage(baseUrl: string): string {
  return `${baseUrl}/messages/`;
}

function createPasswordResetCode(baseUrl: string): string {
  return `${baseUrl}/users/reset-password/`;
}

function createSession(baseUrl: string): string {
  return `${baseUrl}/sessions/`;
}

function createUser(baseUrl: string): string {
  return `${baseUrl}/users/`;
}

function deleteSession(baseUrl: string, sessionId: number): string {
  return `${baseUrl}/sessions/${sessionId}/`;
}

function deleteUser(baseUrl: string): string {
  return `${baseUrl}/users/`;
}

function getInstanceInfo(baseUrl: string, rateLimits: boolean): string {
  return `${baseUrl}/?${rateLimits}`;
}

function getSelf(baseUrl: string): string {
  return `${baseUrl}/users/@me/`;
}

function getSessions(baseUrl: string): string {
  return `${baseUrl}/sessions/`;
}

function getUser(baseUrl: string, userId: number): string {
  return `${baseUrl}/users/${userId}/`;
}

function getUserWithUsername(baseUrl: string, username: string): string {
  return `${baseUrl}/users/${username}/`;
}

function resetPassword(baseUrl: string): string {
  return `${baseUrl}/users/reset-password/`;
}

function updateProfile(baseUrl: string): string {
  return `${baseUrl}/users/profile/`;
}

function updateUser(baseUrl: string): string {
  return `${baseUrl}/users/`;
}

function verifyUser(baseUrl: string, code: number): string {
  return `${baseUrl}/users/verify/?${code}`;
}

/** Pandemonium websocket payloads sent by the client to the server. */
export type ClientPayload = ClientPayloadPing | ClientPayloadAuthenticate;

export interface ClientPayloadPing {
  /**
   * The payload the client is supposed to periodically send the server to not get disconnected.
   *
   * The interval where these pings are supposed to be sent can be found in the `HELLO` payload
   * of the {@link ServerPayload} enum.
   *
   * -----
   *
   * > **Note**
   * >
   * > You are supposed to send your first ping in a connection after `RAND * heartbeat_interval` seconds,
   * `RAND` being a random floating number between 0 and 1.
   * >
   * > This is done to avoid immediately overloading Pandemonium by connecting if it ever has to go down.
   *
   * ### Example
   *
   * ```json
   * {
   *   "op": "PING"
   * }
   * ```
   */
  type: "_PING";
}

export interface ClientPayloadAuthenticate {
  /**
   * The first payload the client is supposed to send. The data of this payload is expected to
   * be a session token obtained from the {@link createSession} route.
   *
   * -----
   *
   * ### Example
   *
   * ```json
   * {
   *   "op": "AUTHENTICATE",
   *   "d": "eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoyMzQxMDY1MjYxMDU3LCJzZXNzaW9uX2lkIjoyMzQxMDgyNDMxNDg5fQ.j-nMmVTLXplaC4opGdZH32DUSWt1yD9Tm9hgB9M6oi4" // You're not supposed to use this example token (eckd)
   * }
   * ```
   */
  op: "_AUTHENTICATE";
  d: string;
}

/**
 * The CreatePasswordResetCode payload. This is used when a user wants to generate a code
 * to reset their password, most commonly because they forgot their old one.
 *
 * -----
 *
 * ### Example
 *
 * ```json
 * {
 *   "email": "someemail@ma.il"
 * }
 * ```
 */
export interface CreatePasswordResetCode {
  /** The user's email. */
  email: string;
}

/**
 * Represents a single rate limit for Effis.
 *
 * -----
 *
 * ### Example
 *
 * ```json
 * {
 *   "reset_after": 60,
 *   "limit": 5,
 *   "file_size_limit": 30000000
 * }
 * ```
 */
export interface EffisRateLimitConf {
  /** The amount of seconds after which the rate limit resets. */
  reset_after: number;
  /** The amount of requests that can be made within the `reset_after` interval. */
  limit: number;
  /** The maximum amount of bytes that can be sent within the `reset_after` interval. */
  file_size_limit: number;
}

/**
 * Rate limits that apply to Effis (The CDN).
 *
 * -----
 *
 * ### Example
 *
 * ```json
 * {
 *   "assets": {
 *     "reset_after": 60,
 *     "limit": 5,
 *     "file_size_limit": 30000000
 *   },
 *   "attachments": {
 *     "reset_after": 180,
 *     "limit": 20,
 *     "file_size_limit": 500000000
 *   },
 *   "fetch_file": {
 *     "reset_after": 60,
 *     "limit": 30
 *   }
 * }
 * ```
 */
export interface EffisRateLimits {
  /** Rate limits for the asset buckets. */
  assets: EffisRateLimitConf;
  /** Rate limits for the attachment bucket. */
  attachments: EffisRateLimitConf;
  /** Rate limits for the file fetching endpoints. */
  fetch_file: RateLimitConf;
}

/** All the possible error responses that are returned from Eludris HTTP microservices. */
export type ErrorResponse = ErrorResponseUnauthorized | ErrorResponseForbidden | ErrorResponseNotFound | ErrorResponseConflict | ErrorResponseMisdirected | ErrorResponseValidation | ErrorResponseRateLimited | ErrorResponseServer;

export interface ErrorResponseUnauthorized extends SharedErrorData {
  /**
   * The error when the client is missing authorization. This error often occurs when the user
   * doesn't pass in the required authentication or passes in invalid credentials.
   *
   * -----
   *
   * ### Example
   *
   * ```json
   * {
   *   "type": "UNAUTHORIZED",
   *   "status": 401,
   *   "message": "The user is missing authentication or the passed credentials are invalid"
   * }
   * ```
   */
  type: "_UNAUTHORIZED";
}

export interface ErrorResponseForbidden extends SharedErrorData {
  /**
   * The error when a client *has* been succesfully authorized but does not have the required
   * permissions to execute an action.
   *
   * -----
   *
   * ### Example
   *
   * ```json
   * {
   *   "type": "FORBIDDEN",
   *   "status": 403,
   *   "message": "The user is missing the requried permissions to execute this action",
   * }
   * ```
   */
  type: "_FORBIDDEN";
}

export interface ErrorResponseNotFound extends SharedErrorData {
  /**
   * The error when a client requests a resource that does not exist.
   *
   * -----
   *
   * ### Example
   *
   * ```json
   * {
   *   "type": "NOT_FOUND",
   *   "status": 404,
   *   "message": "The requested resource could not be found"
   * }
   * ```
   */
  type: "_NOT_FOUND";
}

export interface ErrorResponseConflict extends SharedErrorData {
  /**
   * The error when a client's request causes a conflict, usually when they're trying to create
   * something that already exists.
   *
   * -----
   *
   * ### Example
   *
   * ```json
   * {
   *   "type": "CONFLICT",
   *   "status": 409,
   *   "message": "The request couldn't be completed due to conflicting with other data on the server",
   *   "item": "username",
   * }
   * ```
   */
  type: "_CONFLICT";
  /** The conflicting item. */
  item: string;
}

export interface ErrorResponseMisdirected extends SharedErrorData {
  /**
   * The error when a server isn't able to reduce a response even though the client's request
   * isn't explicitly wrong. This usually happens when an instance isn't configured to provide a
   * response.
   *
   * -----
   *
   * ### Example
   *
   * ```json
   * {
   *   "type": "MISDIRECTED",
   *   "status": 421,
   *   "message": "Misdirected request",
   *   "info": "The instance isn't configured to deal with unbased individuals"
   * }
   * ```
   */
  type: "_MISDIRECTED";
  /** Extra information about what went wrong. */
  info: string;
}

export interface ErrorResponseValidation extends SharedErrorData {
  /**
   * The error when a request a client sends is incorrect and fails validation.
   *
   * -----
   *
   * ### Example
   *
   * ```json
   * {
   *   "type": "VALIDATION",
   *   "status": 422,
   *   "message": "Invalid request",
   *   "value_name": "author",
   *   "info": "author name is a bit too cringe"
   * }
   * ```
   */
  type: "_VALIDATION";
  /** The name of the value that failed validation. */
  value_name: string;
  /** Extra information about what went wrong. */
  info: string;
}

export interface ErrorResponseRateLimited extends SharedErrorData {
  /**
   * The error when a client is rate limited.
   *
   * -----
   *
   * ### Example
   *
   * ```json
   * {
   *   "type": "RATE_LIMITED",
   *   "status": 429,
   *   "message": "You have been rate limited",
   *   "retry_after": 1234
   * }
   * ```
   */
  type: "_RATE_LIMITED";
  /** The amount of milliseconds you're still rate limited for. */
  retry_after: number;
}

export interface ErrorResponseServer extends SharedErrorData {
  /**
   * The error when the server fails to process a request.
   *
   * Getting this error means that it's the server's fault and not the client that the request
   * failed.
   *
   * -----
   *
   * ### Example
   *
   * ```json
   * {
   *   "type": "SERVER",
   *   "status": 500,
   *   "message": "Server encountered an unexpected error",
   *   "info": "Server got stabbed 28 times"
   * }
   * ```
   */
  type: "_SERVER";
  /** Extra information about what went wrong. */
  info: string;
}

/**
 * Represents a file stored on Effis.
 *
 * -----
 *
 * ### Example
 *
 * ```json
 * {
 *   "id": 2195354353667,
 *   "name": "das_ding.png",
 *   "bucket": "attachments",
 *   "metadata": {
 *     "type": "IMAGE",
 *     "width": 1600,
 *     "height": 1600
 *   }
 * }
 * ```
 */
export interface FileData {
  /** The file's ID. */
  id: number;
  /** The file's name. */
  name: string;
  /** The bucket the file is stored in. */
  bucket: string;
  /** Whether the file is marked as a spoiler. */
  spoiler?: boolean;
  /** The {@link FileMetadata} of the file. */
  metadata: FileMetadata;
}

/**
 * The enum representing all the possible Effis supported file metadatas.
 *
 * -----
 *
 * ### Examples
 *
 * ```json
 * {
 *   "type": "TEXT"
 * }
 * {
 *   "type": "IMAGE",
 *   "width": 5120,
 *   "height": 1440
 * }
 * {
 *   "type": "VIDEO",
 *   "width": 1920,
 *   "height": 1080
 * }
 * {
 *   "type": "OTHER"
 * }
 * ```
 */
export type FileMetadata = FileMetadataText | FileMetadataImage | FileMetadataVideo | FileMetadataOther;

export interface FileMetadataText {
  type: "Text";
}

export interface FileMetadataImage {
  type: "Image";
  /** The image's width in pixels. */
  width?: number | null;
  /** The image's height in pixels. */
  height?: number | null;
}

export interface FileMetadataVideo {
  type: "Video";
  /** The video's width in pixels. */
  width?: number | null;
  /** The video's height in pixels. */
  height?: number | null;
}

export interface FileMetadataOther {
  type: "Other";
}

/**
 * The data format for uploading a file.
 *
 * This is a `multipart/form-data` form.
 *
 * -----
 *
 * ### Example
 *
 * ```sh
 * curl \
 *   -F file=@trolley.mp4 \
 *   -F spoiler=true \
 *   https://cdn.eludris.gay/attachments/
 * ```
 */
export interface FileUpload {
  file: unknown;
  spoiler: boolean;
}

/**
 * Represents information about the connected Eludris instance.
 *
 * -----
 *
 * ### Example
 *
 * ```json
 * {
 *   "instance_name": "eludris",
 *   "description": "The *almost* official Eludris instance - ooliver.",
 *   "version": "0.3.2",
 *   "message_limit": 2000,
 *   "oprish_url": "https://api.eludris.gay",
 *   "pandemonium_url": "wss://ws.eludris.gay/",
 *   "effis_url": "https://cdn.eludris.gay",
 *   "file_size": 20000000,
 *   "attachment_file_size": 25000000,
 *   "rate_limits": {
 *     "oprish": {
 *       "info": {
 *         "reset_after": 5,
 *         "limit": 2
 *       },
 *       "message_create": {
 *         "reset_after": 5,
 *         "limit": 10
 *       },
 *       "rate_limits": {
 *         "reset_after": 5,
 *         "limit": 2
 *       }
 *     },
 *     "pandemonium": {
 *       "reset_after": 10,
 *       "limit": 5
 *     },
 *     "effis": {
 *       "assets": {
 *         "reset_after": 60,
 *         "limit": 5,
 *         "file_size_limit": 30000000
 *       },
 *       "attachments": {
 *         "reset_after": 180,
 *         "limit": 20,
 *         "file_size_limit": 500000000
 *       },
 *       "fetch_file": {
 *         "reset_after": 60,
 *         "limit": 30
 *       }
 *     }
 *   }
 * }
 * ```
 */
export interface InstanceInfo {
  /** The instance's name. */
  instance_name: string;
  /**
   * The instance's description.
   *
   * This is between 1 and 2048 characters long.
   */
  description: string | null;
  /** The instance's Eludris version. */
  version: string;
  /** The maximum length of a message's content. */
  message_limit: number;
  /** The URL of the instance's Oprish (REST API) endpoint. */
  oprish_url: string;
  /** The URL of the instance's Pandemonium (WebSocket API) endpoint. */
  pandemonium_url: string;
  /** The URL of the instance's Effis (CDN) endpoint. */
  effis_url: string;
  /** The maximum file size (in bytes) of an asset. */
  file_size: number;
  /** The maximum file size (in bytes) of an attachment. */
  attachment_file_size: number;
  /** The instance's email address if any. */
  email_address?: string | null;
  /**
   * The rate limits that apply to the connected Eludris instance.
   *
   * This is not present if the `rate_limits` query parameter is not set.
   */
  rate_limits?: InstanceRateLimits | null;
}

/**
 * Represents all rate limits that apply to the connected Eludris instance.
 *
 * -----
 *
 * ### Example
 * ```json
 * {
 *   "oprish": {
 *     "info": {
 *       "reset_after": 5,
 *       "limit": 2
 *     },
 *     "message_create": {
 *       "reset_after": 5,
 *       "limit": 10
 *     },
 *     "rate_limits": {
 *       "reset_after": 5,
 *       "limit": 2
 *     }
 *   },
 *   "pandemonium": {
 *     "reset_after": 10,
 *     "limit": 5
 *   },
 *   "effis": {
 *     "assets": {
 *       "reset_after": 60,
 *       "limit": 5,
 *       "file_size_limit": 30000000
 *     },
 *     "attachments": {
 *       "reset_after": 180,
 *       "limit": 20,
 *       "file_size_limit": 500000000
 *     },
 *     "fetch_file": {
 *       "reset_after": 60,
 *       "limit": 30
 *     }
 *   }
 * }
 * ```
 */
export interface InstanceRateLimits {
  /** The instance's Oprish rate limit information (The REST API). */
  oprish: OprishRateLimits;
  /** The instance's Pandemonium rate limit information (The WebSocket API). */
  pandemonium: RateLimitConf;
  /** The instance's Effis rate limit information (The CDN). */
  effis: EffisRateLimits;
}

/**
 * The Message payload. This is returned when you're provided information about a pre-existing
 * message.
 *
 * -----
 *
 * ### Example
 *
 * ```json
 * {
 *   "author": {
 *      "id": 48615849987333,
 *      "username": "mlynar",
 *      "social_credit": 9999.
 *      "badges": 256,
 *      "permissions": 8
 *   }
 *   "content": "Hello, World!"
 * }
 * ```
 */
export interface Message extends MessageCreate {
  /** The message's author. */
  author: User;
}

/**
 * The MessageCreate payload. This is used when you want to create a message using the REST API.
 *
 * -----
 *
 * ### Example
 *
 * ```json
 * {
 *   "content": "Hello, World!"
 * }
 * ```
 */
export interface MessageCreate {
  /**
   * The message's content. This field has to be at-least 2 characters long. The upper limit
   * is the instance's {@link InstanceInfo} `message_limit`.
   *
   * The content will be trimmed from leading and trailing whitespace.
   */
  content: string;
  _disguise?: MessageDisguise | null;
}

/**
 * A temporary way to mask the message's author's name and avatar. This is mainly used for
 * bridging and will be removed when webhooks are officially supported.
 *
 * -----
 *
 * ### Example
 *
 * ```json
 * {
 *   "name": "Jeff",
 *   "avatar": "https://some-u.rl/to/some-image.png"
 * }
 * ```
 */
export interface MessageDisguise {
  /** The name of the message's disguise. */
  name: string | null;
  /** The URL of the message's disguise. */
  avatar: string | null;
}

/**
 * Rate limits that apply to Oprish (The REST API).
 *
 * -----
 *
 * ### Example
 *
 * ```json
 * {
 *   "getInstanceInfo": {
 *     "reset_after": 5,
 *     "limit": 2
 *   },
 *   "createMessage": {
 *     "reset_after": 5,
 *     "limit": 10
 *   },
 *   "createUser": {
 *   },
 * }
 * ```
 */
export interface OprishRateLimits {
  /** Rate limits for the {@link getInstanceInfo} endpoint. */
  get_instance_info: RateLimitConf;
  /** Rate limits for the {@link createMessage} endpoint. */
  create_message: RateLimitConf;
  /** Rate limits for the {@link createUser} endpoint. */
  create_user: RateLimitConf;
  /** Rate limits for the {@link verifyUser} endpoint. */
  verify_user: RateLimitConf;
  /** Rate limits for the {@link getSelf}, {@link getUser} and {@link get_user_from_username} endpoints. */
  get_user: RateLimitConf;
  /**
   * Rate limits for the {@link getSelf}, {@link getUser} and {@link get_user_from_username} endpoints for
   * someone who hasn't made an account.
   */
  guest_get_user: RateLimitConf;
  /** Rate limits for the {@link updateUser} enpoint. */
  update_user: RateLimitConf;
  /** Rate limits for the {@link updateProfile} enpoint. */
  update_profile: RateLimitConf;
  /** Rate limits for the {@link deleteUser} enpoint. */
  delete_user: RateLimitConf;
  /** Rate limits for the {@link createPasswordResetCode} enpoint. */
  create_password_reset_code: RateLimitConf;
  /** Rate limits for the {@link resetPassword} enpoint. */
  reset_password: RateLimitConf;
  /** Rate limits for the {@link createSession} endpoint. */
  create_session: RateLimitConf;
  /** Rate limits for the {@link getSessions} endpoint. */
  get_sessions: RateLimitConf;
  /** Rate limits for the {@link deleteSession} endpoint. */
  delete_session: RateLimitConf;
}

/**
 * The DeleteCredentials payload. This is used in multiple places in the API to provide extra
 * credentials for deleting important user-related stuff.
 *
 * -----
 *
 * ### Example
 *
 * ```json
 * {
 *   "password": "wowsuchpassword"
 * }
 * ```
 */
export interface PasswordDeleteCredentials {
  password: string;
}

/**
 * Represents a single rate limit.
 *
 * -----
 *
 * ### Example
 *
 * ```json
 * {
 *   "reset_after": 60,
 *   "limit": 30
 * }
 * ```
 */
export interface RateLimitConf {
  /** The amount of seconds after which the rate limit resets. */
  reset_after: number;
  /** The amount of requests that can be made within the `reset_after` interval. */
  limit: number;
}

/**
 * The ResetPassword payload. This is used when the user wants to reset their password using a
 * password reset code.
 *
 * -----
 *
 * ### Example
 *
 * ```json
 * {
 *   "code": 234567,
 *   "email": "someemail@ma.il",
 *   "password": "wow such security"
 * }
 * ```
 */
export interface ResetPassword {
  /** The password reset code the user got emailed. */
  code: number;
  /** The user's email. */
  email: string;
  /** The user's new password. */
  password: string;
}

/** Pandemonium websocket payloads sent by the server to the client. */
export type ServerPayload = ServerPayloadPong | ServerPayloadRateLimit | ServerPayloadHello | ServerPayloadAuthenticated | ServerPayloadUserUpdate | ServerPayloadPresenceUpdate | ServerPayloadMessageCreate;

export interface ServerPayloadPong {
  /**
   * A {@link ClientPayload} `PING` payload response.
   *
   * -----
   *
   * ### Example
   *
   * ```json
   * {
   *   "op": "PONG"
   * }
   * ```
   */
  type: "_PONG";
}

export interface ServerPayloadRateLimit {
  /**
   * The payload sent when the client gets gateway rate limited.
   *
   * The client is supposed to wait `wait` milliseconds before sending any more events,
   * otherwise they are disconnected.
   *
   * -----
   *
   * ### Example
   *
   * ```json
   * {
   *   "op": "RATE_LIMIT",
   *   "d": {
   *     "wait": 1010 // 1.01 seconds
   *   }
   * }
   * ```
   */
  op: "_RATE_LIMIT";
  /** The amount of milliseconds you have to wait before the rate limit ends */
  wait: number;
}

export interface ServerPayloadHello {
  /**
   * The payload sent by the server when you initiate a new gateway connection.
   *
   * -----
   *
   * ### Example
   *
   * ```json
   * {
   *   "op": "HELLO",
   *   "d": {
   *     "heartbeat_interval": 45000,
   *     "instance_info": {
   *       "instance_name": "EmreLand",
   *       "description": "More based than Oliver's instance (trust)",
   *       "version": "0.3.3",
   *       "message_limit": 2048,
   *       "oprish_url": "https://example.com",
   *       "pandemonium_url": "https://example.com",
   *       "effis_url": "https://example.com",
   *       "file_size": 20000000,
   *       "attachment_file_size": 100000000
   *     },
   *     "rate_limit": {
   *       "reset_after": 10,
   *       "limit": 5
   *     }
   *   }
   * }
   * ```
   */
  op: "_HELLO";
  /** The amount of milliseconds your ping interval is supposed to be. */
  heartbeat_interval: number;
  /**
   * The instance's info.
   *
   * This is the same payload you get from the {@link getInstanceInfo} payload without
   * ratelimits
   */
  instance_info: InstanceInfo;
  /** The pandemonium ratelimit info. */
  rate_limit: RateLimitConf;
}

export interface ServerPayloadAuthenticated {
  /**
   * The payload sent when the client has successfully authenticated. This contains the data the
   * user needs on startup.
   *
   * -----
   *
   * ### Example
   *
   * ```json
   * {
   *   "op": "AUTHENTICATED",
   *   "user": {
   *     "id": 48615849987334,
   *     "username": "barbaz",
   *     "social_credit": 3,
   *     "badges": 0,
   *     "permissions": 0
   *   },
   *   "users": [
   *     {
   *       "id": 48615849987333,
   *       "username": "foobar",
   *       "social_credit": 42,
   *       "badges": 0,
   *       "permissions": 0
   *     }
   *   ],
   * }
   * ```
   */
  op: "_AUTHENTICATED";
  user: User;
  /** The currently online users who are relavent to the connector. */
  users: User[];
}

export interface ServerPayloadUserUpdate {
  /**
   * The payload received when a user updates themselves. This includes both user updates from
   * the {@link updateUser} endpoint and profile updates from the {@link updateProfile} endpoint.
   *
   * -----
   *
   * ### Example
   *
   * ```json
   * {
   *   "id": 48615849987333,
   *   "username": "foobar",
   *   "social_credit": 42,
   *   "badges": 0,
   *   "permissions": 0
   * }
   * ```
   */
  op: "_USER_UPDATE";
  d: User;
}

export interface ServerPayloadPresenceUpdate {
  /**
   * The payload sent when a user's presence is updated.
   *
   * This is mainly used for when a user goes offline or online.
   *
   * -----
   *
   * ### Example
   *
   * ```json
   * {
   *   "user_id": 48615849987333,
   *   "status": {
   *     "type": "IDLE",
   *     "text": "BURY THE LIGHT DEEP WITHIN"
   *   }
   * }
   * ```
   */
  op: "_PRESENCE_UPDATE";
  user_id: number;
  status: Status;
}

export interface ServerPayloadMessageCreate {
  /**
   * The payload sent when the client receives a {@link Message}.
   *
   * -----
   *
   * ### Example
   *
   * ```json
   * {
   *   "op": "MESSAGE_CREATE",
   *   "d": {
   *     "author": "A Certain Woo",
   *     "content": "Woo!"
   *   }
   * }
   * ```
   */
  op: "_MESSAGE_CREATE";
  d: Message;
}

/**
 * The session payload.
 *
 * The user should ideally have one session for every client they have on every device.
 *
 * -----
 *
 * ### Example
 *
 * ```json
 * {
 *   "id": 2312155037697,
 *   "user_id": 2312155693057,
 *   "platform": "linux",
 *   "client": "pilfer"
 * }
 * ```
 */
export interface Session {
  /** The session's ID. */
  id: number;
  /** The session user's ID. */
  user_id: number;
  /** The session's platform (linux, windows, mac, etc.) */
  platform: string;
  /** The client the session was created by. */
  client: string;
  /** The session's creation IP address. */
  ip: string;
}

/**
 * The SessionCreate payload.
 *
 * This is used to authenticate a user and obtain a token to interface with the API.
 *
 * -----
 *
 * ### Example
 *
 * ```json
 * {
 *   "identifier": "yendri",
 *   "password": "authentícame por favor",
 *   "platform": "linux",
 *   "client": "pilfer"
 * }
 * ```
 */
export interface SessionCreate {
  /** The session user's identifier. This can be either their email or username. */
  identifier: string;
  /** The session user's password. */
  password: string;
  /** The session's platform (linux, windows, mac, etc.) */
  platform: string;
  /** The client the session was created by. */
  client: string;
}

/**
 * The response to a {@link SessionCreate}.
 *
 * -----
 *
 * ### Example
 *
 * ```json
 * {
 *   "token": "",
 *   "session": {
 *     "indentifier": "yendri",
 *     "password": "authentícame por favor",
 *     "platform": "linux",
 *     "client": "pilfer"
 *   }
 * }
 * ```
 */
export interface SessionCreated {
  /** The session's token. This can be used by the user to properly interface with the API. */
  token: string;
  /** The session object that was created. */
  session: Session;
}

/** Shared fields between all error response variants. */
export interface SharedErrorData {
  /** The HTTP status of the error. */
  status: number;
  /** A brief explanation of the error. */
  message: string;
}

/**
 * A user's status.
 *
 * -----
 *
 * ### Example
 *
 * ```json
 * {
 *   "type": "BUSY",
 *   "text": "ayúdame por favor",
 * }
 * ```
 */
export interface Status {
  type: StatusType;
  text?: string | null;
}

/**
 * The type of a user's status.
 *
 * This is a string.
 */
export type StatusType = StatusTypeOnline | StatusTypeOffline | StatusTypeIdle | StatusTypeBusy;

export interface StatusTypeOnline {
  type: "Online";
}

export interface StatusTypeOffline {
  type: "Offline";
}

export interface StatusTypeIdle {
  type: "Idle";
}

export interface StatusTypeBusy {
  type: "Busy";
}

/**
 * The UpdateUser payload. Any field set to `null`, `undefined` or is missing will be disregarded
 * and won't affect the user.
 *
 * -----
 *
 * ### Example
 *
 * ```json
 * {
 *   "password": "authentícame por favor",
 *   "username": "yendli",
 *   "email": "yendli2@yemail.yom"
 * }
 * ```
 */
export interface UpdateUser {
  /** The user's current password for validation. */
  password: string;
  /** The user's new username. */
  username?: string | null;
  /** The user's new email. */
  email?: string | null;
  /** The user's new password. */
  new_password?: string | null;
}

/**
 * The UpdateUserProfile payload. This payload is used to update a user's profile. The abscence of a
 * field or it being `undefined` means that it won't have an effect. Explicitly setting a field as
 * `null` will clear it.
 *
 * -----
 *
 * ### Example
 *
 * ```json
 * {
 *   "display_name": "HappyRu",
 *   "bio": "I am very happy!"
 * }
 * ```
 */
export interface UpdateUserProfile {
  /** The user's new display name. This field has to be between 2 and 32 characters long. */
  display_name?: string | null | null;
  /** The user's new status. This field cannot be more than 150 characters long. */
  status?: string | null | null;
  /** The user's new status type. This must be one of `ONLINE`, `OFFLINE`, `IDLE` and `BUSY`. */
  status_type?: StatusType | null;
  /** The user's new bio. The upper limit is the instance's {@link InstanceInfo} `bio_limit`. */
  bio?: string | null | null;
  /** The user's new avatar. This field has to be a valid file ID in the "avatar" bucket. */
  avatar?: number | null | null;
  /** The user's new banner. This field has to be a valid file ID in the "banner" bucket. */
  banner?: number | null | null;
}

/**
 * The user payload.
 *
 * -----
 *
 * ### Example
 *
 * ```json
 * {
 *   "id": 48615849987333,
 *   "username": "yendri",
 *   "display_name": "Nicolas",
 *   "social_credit": -69420,
 *   "status": {
 *     "type": "BUSY",
 *     "text": "ayúdame por favor",
 *    },
 *   "bio": "NICOLAAAAAAAAAAAAAAAAAAS!!!\n\n\nhttps://cdn.eludris.gay/static/nicolas.mp4",
 *   "avatar": 2255112175647,
 *   "banner": 2255049523230,
 *   "badges": 0,
 *   "permissions": 0
 * }
 * ```
 */
export interface User {
  /** The user's ID. */
  id: number;
  /** The user's username. This field has to be between 2 and 32 characters long. */
  username: string;
  /** The user's display name. This field has to be between 2 and 32 characters long. */
  display_name?: string | null;
  /** The user's social credit score. */
  social_credit: number;
  /** The user's status. */
  status: Status;
  /** The user's bio. The upper limit is the instance's {@link InstanceInfo} `bio_limit`. */
  bio?: string | null;
  /** The user's avatar. This field has to be a valid file ID in the "avatar" bucket. */
  avatar?: number | null;
  /** The user's banner. This field has to be a valid file ID in the "banner" bucket. */
  banner?: number | null;
  /** The user's badges as a bitfield. */
  badges: number;
  /** The user's instance-wide permissions as a bitfield. */
  permissions: number;
  /** The user's email. This is only shown when the user queries their own data. */
  email?: string | null;
  /** The user's verification status. This is only shown when the user queries their own data. */
  verified?: boolean | null;
}

/**
 * The UserCreate payload.
 *
 * This is used when a user is initially first created. For authentication payloads check
 * {@link SessionCreate}.
 *
 * -----
 *
 * ### Example
 *
 * ```json
 * {
 *   "username": "yendri",d
 *   "email": "yendri@llamoyendri.io",
 *   "password": "authentícame por favor" // don't actually use this as a password
 * }
 * ```
 */
export interface UserCreate {
  /**
   * The user's name.
   *
   * This is different to their `display_name` as it denotes how they're more formally
   * referenced by the API.
   */
  username: string;
  /** The user's email. */
  email: string;
  /** The user's password. */
  password: string;
}
export const ROUTES = {
  /**
   * Get an attachment by ID.
   * This is a shortcut to {@link downloadFile} with the attachments bucket.
   *
   * The `Content-Deposition` header is set to `attachment`.
   * Use the {@link getAttachment} endpoint to get `Content-Deposition` set to `inline`.
   *
   * -----
   *
   * ### Example
   *
   * ```sh
   * curl https://cdn.eludris.gay/attachments/2199681302540/download
   *
   * <raw file data>
   * ```
  */
  downloadAttachment,
  /**
   * Download a file by ID from a specific bucket.
   *
   * The `Content-Deposition` header is set to `attachment`.
   * Use the {@link getFile} endpoint to get `Content-Deposition` set to `inline`.
   *
   * -----
   *
   * ### Example
   *
   * ```sh
   * curl https://cdn.eludris.gay/attachments/2198189244420/download
   *
   * <raw file data>
   * ```
  */
  downloadFile,
  /**
   * Download a static file by its name.
   * Static files are added by the instance owner and cannot be externally modified.
   *
   * The `Content-Deposition` header is set to `attachment`.
   * Use the {@link getStaticFile} endpoint to get `Content-Deposition` set to `inline`.
   *
   * -----
   *
   * ### Example
   *
   * ```sh
   * curl https://cdn.eludris.gay/static/pengin.mp4/download
   *
   * <raw file data>
   * ```
  */
  downloadStaticFile,
  /**
   * Get an attachment by ID.
   * This is a shortcut to {@link getFile} with the attachments bucket.
   *
   * The `Content-Deposition` header is set to `inline`.
   * Use the {@link downloadAttachment} endpoint to get `Content-Deposition` set to `attachment`.
   *
   * -----
   *
   * ### Example
   *
   * ```sh
   * curl https://cdn.eludris.gay/2199681302540
   *
   * <raw file data>
   * ```
  */
  getAttachment,
  /**
   * Get a file's metadata by ID from a specific bucket.
   *
   * -----
   *
   * ### Example
   *
   * ```sh
   * curl \
   *   https://cdn.eludris.gay/2198189244420/data
   *
   * {
   *   "id": 2199681302540,
   *   "name": "thang-big.png",
   *   "bucket": "attachments",
   *   "metadata": {
   *     "type": "image",
   *     "width": 702,
   *     "height": 702
   *   }
   * }
   * ```
  */
  getAttachmentData,
  /**
   * Get a file by ID from a specific bucket.
   *
   * The `Content-Deposition` header is set to `inline`.
   * Use the {@link downloadFile} endpoint to get `Content-Deposition` set to `attachment`.
   *
   * -----
   *
   * ### Example
   *
   * ```sh
   * curl https://cdn.eludris.gay/attachments/2198189244420
   *
   * <raw file data>
   * ```
  */
  getFile,
  /**
   * Get a file's metadata by ID from a specific bucket.
   *
   * -----
   *
   * ### Example
   *
   * ```sh
   * curl \
   *   https://cdn.eludris.gay/attachments/2198189244420/data
   *
   * {
   *   "id": 2198189244420,
   *   "name": "trolley.mp4",
   *   "bucket": "attachments",
   *   "spoiler": true,
   *   "metadata": {
   *     "type": "video",
   *     "width": 576,
   *     "height": 682
   *   }
   * }
   * ```
  */
  getFileData,
  /**
   * Get a static file by its name.
   * Static files are added by the instance owner and cannot be externally modified.
   *
   * The `Content-Deposition` header is set to `inline`.
   * Use the {@link downloadStaticFile} endpoint to get `Content-Deposition` set to `attachment`.
   *
   * -----
   *
   * ### Example
   *
   * ```sh
   * curl https://cdn.eludris.gay/static/pengin.mp4
   *
   * <raw file data>
   * ```
  */
  getStaticFile,
  /**
   * Upload an attachment to Effis under a specific bucket.
   * This is a shortcut to {@link uploadFile} with the attachments bucket.
   *
   * -----
   *
   * ### Example
   *
   * ```sh
   * curl \
   *   -F file=@thang-big.png \
   *   -F spoiler=false \
   *   https://cdn.eludris.gay/
   *
   * {
   *   "id": 2199681302540,
   *   "name": "thang-big.png",
   *   "bucket": "attachments",
   *   "metadata": {
   *     "type": "image",
   *     "width": 702,
   *     "height": 702
   *   }
   * }
   * ```
  */
  uploadAttachment,
  /**
   * Upload a file to Effis under a specific bucket.
   * At the moment, only the attachments bucket is supported.
   *
   * -----
   *
   * ### Example
   *
   * ```sh
   * curl \
   *   -F file=@trolley.mp4 \
   *   -F spoiler=true \
   *   https://cdn.eludris.gay/attachments/
   *
   * {
   *   "id": 2198189244420,
   *   "name": "trolley.mp4",
   *   "bucket": "attachments",
   *   "spoiler": true,
   *   "metadata": {
   *     "type": "video",
   *     "width": 576,
   *     "height": 682
   *   }
   * }
   * ```
  */
  uploadFile,
  /**
   * Post a message to Eludris.
   *
   * -----
   *
   * ### Example
   *
   * ```sh
   * curl \
   *   --json '{"author":"Not a weeb","content":"Hello, World!"}' \
   *   https://api.eludris.gay/messages
   *
   * {
   *   "author": "Not a weeb",
   *   "content": "Hello, World!"
   * }
   * ```
  */
  createMessage,
  /**
   * Send a password reset code to your email.
   *
   * -----
   *
   * ### Example
   *
   * ```sh
   * curl \
   *   --json '{"email": "yendri@llamoyendri.io"}' \
   *   https://api.eludris.gay/users/reset-password
   * ```
  */
  createPasswordResetCode,
  /**
   * Create a new session.
   *
   * -----
   *
   * ### Example
   *
   * ```sh
   * curl \
   *   --json '{
   *   "identifier": "yendri",
   *   "password": "authentícame por favor",
   *   "platform": "linux",
   *   "client": "pilfer"
   * }' \
   *   https://api.eludris.gay/sessions
   *
   * {
   *   "token": "<token>",
   *   "session": {
   *     "id": 2472278163458,
   *     "user_id": 48615849987333,
   *     "platform": "linux",
   *     "client": "pilfer",
   *     "ip": "fc00:e10d:7150:b1gb:00b5:f00d:babe:1337"
   *   }
   * }
   * ```
  */
  createSession,
  /**
   * Create a new user.
   *
   * -----
   *
   * ### Example
   *
   * ```sh
   * curl \
   *   --json '{
   *   "username": "yendri",
   *   "email": "yendri@llamoyendri.io",
   *   "password": "authentícame por favor"
   * }' \
   *   https://api.eludris.gay/users
   *
   * {
   *   "id": 48615849987333,
   *   "username": "yendri",
   *   "social_credit": 0,
   *   "badges": 0,
   *   "permissions": 0
   * }
   * ```
  */
  createUser,
  /**
   * Delete a session.
   *
   * -----
   *
   * ### Example
   *
   * ```sh
   * curl \
   *   -X DELETE \
   *   -H "Authorization: <token>" \
   *   https://api.eludris.gay/sessions/2342734331909
   * ```
  */
  deleteSession,
  /**
   * Delete your user.
   *
   * -----
   *
   * ### Example
   *
   * ```sh
   * curl \
   *   -X DELETE \
   *   -H "Authorization: <token>" \
   *   --json '{"password": "wowsuchpassword"}'
   *   https://api.eludris.gay/users
   * ```
  */
  deleteUser,
  /**
   * Get information about the instance you're sending this request to.
   *
   * Most of this data comes from the instance's configuration.
   *
   * -----
   *
   * ### Example
   *
   * ```sh
   * curl https://api.eludris.gay/?rate_limits
   *
   * {
   *   "instance_name": "eludris",
   *   "description": "The *almost* official Eludris instance - ooliver.",
   *   "version": "0.3.2",
   *   "message_limit": 2000,
   *   "oprish_url": "https://api.eludris.gay",
   *   "pandemonium_url": "wss://ws.eludris.gay/",
   *   "effis_url": "https://cdn.eludris.gay",
   *   "file_size": 20000000,
   *   "attachment_file_size": 25000000,
   *   "rate_limits": {
   *     "oprish": {
   *       "info": {
   *         "reset_after": 5,
   *         "limit": 2
   *       },
   *       "message_create": {
   *         "reset_after": 5,
   *         "limit": 10
   *       }
   *     },
   *     "pandemonium": {
   *       "reset_after": 10,
   *       "limit": 5
   *     },
   *     "effis": {
   *       "assets": {
   *         "reset_after": 60,
   *         "limit": 5,
   *         "file_size_limit": 30000000
   *       },
   *       "attachments": {
   *         "reset_after": 180,
   *         "limit": 20,
   *         "file_size_limit": 500000000
   *       },
   *       "fetch_file": {
   *         "reset_after": 60,
   *         "limit": 30
   *       }
   *     }
   *   }
   * }
   * ```
  */
  getInstanceInfo,
  /**
   * Get your own user.
   *
   * -----
   *
   * ### Example
   *
   * ```sh
   * curl \
   *   -H "Authorization: <token>" \
   *   https://api.eludris.gay/users/@me
   *
   * {
   *   "id": 48615849987333,
   *   "username": "yendri",
   *   "social_credit": 0,
   *   "badges": 0,
   *   "permissions": 0
   * }
   * ```
  */
  getSelf,
  /**
   * Get all sessions.
   *
   * -----
   *
   * ### Example
   *
   * ```sh
   * curl \
   *   -H "Authorization: <token>" \
   *   https://api.eludris.gay/sessions
   *
   * [
   *   {
   *     "id": 2472278163458,
   *     "user_id": 48615849987333,
   *     "platform": "linux",
   *     "client": "pilfer",
   *     "ip": "fc00:e10d:7150:b1gb:00b5:f00d:babe:1337"
   *   },
   *   {
   *     "id": 2472278163867,
   *     "user_id": 48615849987333,
   *     "platform": "python",
   *     "client": "velum",
   *     "ip": "127.0.0.1"
   *   }
   * ]
   * ```
  */
  getSessions,
  /**
   * Get a user by ID.
   *
   * This does not require authorization, but authorized users will get a separate rate limit
   * which is usually (hopefully) higher than the guest rate limit.
   *
   * -----
   *
   * ### Example
   *
   * ```sh
   * curl \
   *   -H "Authorization: <token>" \
   *   https://api.eludris.gay/users/48615849987333
   *
   * {
   *   "id": 48615849987333,
   *   "username": "yendri",
   *   "social_credit": 0,
   *   "badges": 0,
   *   "permissions": 0
   * }
   * ```
  */
  getUser,
  /**
   * Get a user by their username.
   *
   * This does not require authorization, but authorized users will get a separate rate limit
   * which is usually (hopefully) higher than the guest rate limit.
   *
   * -----
   *
   * ### Example
   *
   * ```sh
   * curl \
   *   -H "Authorization: <token>" \
   *   https://api.eludris.gay/users/yendri
   *
   * {
   *   "id": 48615849987333,
   *   "username": "yendri",
   *   "social_credit": 0,
   *   "badges": 0,
   *   "permissions": 0
   * }
   * ```
  */
  getUserWithUsername,
  /**
   * Reset your password using the password reset code.
   *
   * -----
   *
   * ### Example
   *
   * ```sh
   * curl \
   *   -X PATCH \
   *   --json '{"code":234567,"email":"someemail@ma.il","password":"wow such security"}' \
   *   https://api.eludris.gay/users/reset-password
   * ```
  */
  resetPassword,
  /**
   * Modify your profile.
   *
   * -----
   *
   * ### Example
   *
   * ```sh
   * curl \
   *   -H "Authorization: <token>" \
   *   -X PATCH
   *   --json '{"display_name":"HappyRu","bio":"I am very happy!"}'
   *   https://api.eludris.gay/users/profile
   *
   * {
   *   "id": 2346806935553
   *   "username": "yendri"
   *   "display_name": "HappyRu"
   *   "social_credit": 0,
   *   "bio": "I am very happy!"
   *   "badges": 0,
   *   "permissions": 0
   * }
   * ```
  */
  updateProfile,
  /**
   * Modify your user account.
   *
   * -----
   *
   * ### Example
   *
   * ```sh
   * curl \
   *   -H "Authorization: <token>" \
   *   -X PATCH
   *   --json '{"email":"nicolas.maduro@presidencia.gob.ve","username":"nicolas"}'
   *   https://api.eludris.gay/users
   *
   * {
   *   "id": 2346806935553
   *   "username": "nicolas"
   *   "display_name": "HappyRu"
   *   "social_credit": 0,
   *   "bio": "I am very happy!"
   *   "badges": 0,
   *   "permissions": 0
   * }
   * ```
  */
  updateUser,
  /**
   * Verify your email address.
   *
   * -----
   *
   * ### Example
   *
   * ```sh
   * curl \
   *   -X POST \
   *   -H "Authorization: <token>" \
   *   https://api.eludris.gay/users/verify?code=123456
   * ```
  */
  verifyUser,
};

