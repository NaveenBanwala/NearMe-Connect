import { api } from './api.js'

/**
 * Get a presigned S3 URL from the backend, then upload the file directly.
 * Returns the public URL to store in the request/profile.
 */
export async function uploadImage(file) {
  // Step 1 — get presigned URL
  const { data } = await api.post('/api/uploads/presign', {
    filename:     file.name,
    content_type: file.type,
  })
  const { upload_url, public_url } = data

  // Step 2 — PUT file directly to S3 (no auth header needed for presigned URLs)
  await fetch(upload_url, {
    method:  'PUT',
    headers: { 'Content-Type': file.type },
    body:    file,
  })

  return public_url
}

/**
 * Just get the presigned URL without uploading (for manual control).
 */
export async function getPresignedUrl(filename, contentType) {
  const { data } = await api.post('/api/uploads/presign', {
    filename,
    content_type: contentType,
  })
  return data  // { upload_url, public_url }
}