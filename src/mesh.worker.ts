// mesh.worker.ts
/// <reference lib="webworker" />

import { NetworkAgent, PeerGroupAgent, StateGossipAgent, HeaderBasedSyncAgent, WebRTCConnection, WebWorkerMeshHost, LogLevel, Mesh } from '@hyper-hyper-space/core';
import { } from '@hyper-hyper-space/home';

// log control:

Mesh.syncCommandsLog.level = LogLevel.INFO;

StateGossipAgent.controlLog.level = LogLevel.INFO;
StateGossipAgent.peerMessageLog.level = LogLevel.INFO;

PeerGroupAgent.controlLog.level = LogLevel.INFO;

HeaderBasedSyncAgent.controlLog.level = LogLevel.DEBUG;

WebRTCConnection.logger.level = 5;
NetworkAgent.connLogger.level = 5;
NetworkAgent.messageLogger.level = 5;

// crate the mesh host, it will listen for messages on a broadcast channel,
// thus being effectivly controlled from the UI thread.

const webWorkerHost = new WebWorkerMeshHost();

export default { } as any;