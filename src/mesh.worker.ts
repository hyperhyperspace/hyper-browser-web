// mesh.worker.ts
/// <reference lib="webworker" />

import { WebWorkerMeshHost } from '@hyper-hyper-space/core';
import { } from '@hyper-hyper-space/home';
import { } from './model/text/TextSpace';

// crate the mesh host, it will listen for messages on a broadcast channel,
// thus being effectivly controlled from the UI thread.

const webWorkerHost = new WebWorkerMeshHost();

export default { } as any;