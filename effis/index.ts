
export interface TextMetadata {
    /** The type of file as a lowercase string, always "text". */
    type: "text";
}

export interface ImageMetadata {
    /** The type of file as a lowercase string, always "image". */
    type: "image";
    /** The width of the image in pixels. */
    width: number;
    /** The height of the image in pixels. */
    height: number;
}

export interface VideoMetadata {
    /** The type of file as a lowercase string, always "video". */
    type: "video";
    /** The width of the video in pixels. */
    width: number;
    /** The height of the video in pixels. */
    height: number;
}

export interface OtherMetadata {
    /** The type of file as a lowercase string. */
    type: string;
}

export type FileMetadata = TextMetadata | ImageMetadata | VideoMetadata | OtherMetadata;

/** Represents a file stored on Effis. */
export interface FileData {
    /** The id of the file. */
    id: string;
    /** The name of the file. */
    name: string;
    /** The bucket to which the file belongs. */
    bucket: string;
    /** Whether this file is spoiler tagged. This is not provided if false. */
    spoiler?: boolean;
    /** A {@link FileMetadata} object containing meta-information about the file. */
    metadata: FileMetadata;
}
