export enum GatewayOp {
  PING = "PING",
  PONG = "PONG",
  MESSAGE_CREATE = "MESSAGE_CREATE",
}

export interface Ping {
  op: GatewayOp.PING;
}

export interface Pong {
  op: GatewayOp.PONG;
}

export interface MessageCreate {
  op: GatewayOp.MESSAGE_CREATE;
  d: {
    author: string;
    content: string;
  };
}

export type IncomingMessage = Pong | MessageCreate;
export type OutgoingMessage = Ping;
