import { createMircle } from "."
import type { Progress } from "../types"

export type WorkerRequest = WorkerRenderRequest
type WorkerRenderRequest = {
  action: 'render',
  canvas: OffscreenCanvas,
  modulo: number, // number of points around the circle
  multiple?: number, // multiplier for modulo to find second points
  size?: number,
  padding?: number,
}

export type WorkerResponse = WorkerRenderProgressResponse | WorkerRenderFinishedResponse
type WorkerRenderProgressResponse = {
  progress: Progress,
}
type WorkerRenderFinishedResponse = {
  finished: boolean,
}

self.onmessage = (event: MessageEvent<WorkerRequest>) => {
  const request = event.data
  if (request.action === 'render') {
    createMircle({
      ...request,
      onProgress: (progress: Progress) => self.postMessage({ progress })
    })
    self.postMessage({ finished: true })
  }
}
