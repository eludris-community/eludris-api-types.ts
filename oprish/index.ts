/** Represents info about an instance. */
export interface InstanceInfo {
    /** The name of the connected Eludris instance. */
    instance_name: string;
    /** The description of the connected Eludris instance. If provided, this must be within 1 and 2048 characters long. */
    description?: string;
    /** The version of the conencted Eludris instance. */
    version: string;
    /** The maximum allowed message content length. */
    message_limit: number;
    /** The url to this instance's REST api. */
    oprish_url: string;
    /** The url to this instance's gateway. */
    pandemonium_url: string;
    /** The url to this instance's CDN. */
    effis_url: string;
    /** The maximum number of bytes for an asset. */
    file_size: number;
    /** The maximum number of bytes for an attachment. */
    attachment_file_size: number;
}
/** Represents a message sent to or received from Eludris. The message contains its author and content. */
export interface Message {
    /** The author of the message, between 2-32 characters long. */
    author: string;
    /** The content of the message. At least one character; The upper bound can be requested as part of the instance's {@link InstanceInfo}. */
    content: string;
}

/** Represents a ratelimit for a specific part of the Eludris spec. */
export interface RateLimitConf {
    /** The number of seconds the client should wait before making new requests. */
    reset_after: number;
    /** The number of requests that can be made within the timeframe denoted by reset_after. */
    limit: number;
}

/** Represents all ratelimits that apply to the connected Eludris instance.
 * This includes individual ratelimit information for Oprish (REST-api), Pandemonium (Gateway), and Effis (CDN).
 */
export interface InstanceRateLimits {
    /** Represents the ratelimits for Oprish (REST-api).
     * This denotes the ratelimits on each individual route. */
    oprish: {
        /** The ratelimit information for the / route. */
        info: RateLimitConf;
        /** The ratelimit information for the /messages route. */
        message_create: RateLimitConf;
       /** The ratelimit information for the /ratelimts route. */
        ratelimits: RateLimitConf;
    },
    /** The ratelimits that apply to the connected Eludris instance's gateway. */
    pandemonium: RateLimitConf
    /** The ratelimits that apply to the connected Eludris instance's CDN. */
    effis: RateLimitConf & {
        /** The maximum number of bytes that can be uploaded in the timeframe denoted by reset_after. */
        file_size_limit: number;
    }
}

export type OprishRateLimitConf = InstanceRateLimits["oprish"];
export type PandemoniumRateLimitConf = InstanceRateLimits["pandemonium"];
export type EffisRateLimitConf = InstanceRateLimits["effis"];