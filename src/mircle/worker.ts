import { renderMircle, type MircleSpecification } from "./mircle"

export type WorkerRequest = WorkerRenderRequest
type WorkerRenderRequest = {
  action: 'render',
  specification: MircleSpecification,
  // styles: StyleMircleConfig,
}

export type WorkerResponse = WorkerProgressResponse | WorkerFinishedResponse
type WorkerProgressResponse = {
  progressPercent: number,
}
type WorkerFinishedResponse = {
  result: ImageBitmap
}

self.onmessage = (event: MessageEvent<WorkerRequest>) => {
  const request = event.data
  if (request.action === 'render') {
    const canvas = new OffscreenCanvas(request.specification.size, request.specification.size)
    renderMircle({
      canvas,
      specification: request.specification,
      onProgress: progressPercent => self.postMessage({ progressPercent })
    })
    console.debug('Generating bitmap...')
    const bitmap = canvas.transferToImageBitmap()
    self.postMessage({ result: bitmap }, [bitmap]) // transfer bitmap to main thread
    bitmap?.close() // close bitmap if we still have reference (do we?)
  }
}
