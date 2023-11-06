import { renderMircle, type StyleMircleConfig } from "./mircle"
import type { Progress } from "../types"
import type { LayoutMircleArgs } from "./layout"

export type WorkerRequest = WorkerRenderRequest
type WorkerRenderRequest = {
  action: 'render',
  layout: LayoutMircleArgs,
  styles: StyleMircleConfig,
}

export type WorkerResponse = WorkerProgressResponse | WorkerFinishedResponse
type WorkerProgressResponse = {
  progress: Progress,
}
type WorkerFinishedResponse = {
  result: ImageBitmap
}

self.onmessage = (event: MessageEvent<WorkerRequest>) => {
  const request = event.data
  if (request.action === 'render') {
    const canvas = new OffscreenCanvas(request.layout.size, request.layout.size)
    renderMircle({
      ...request,
      canvas,
      onProgress: (progress: Progress) => self.postMessage({ progress })
    })
    const bitmap = canvas.transferToImageBitmap()
    self.postMessage({ result: bitmap }, [bitmap]) // transfer bitmap to main thread
  }
}
