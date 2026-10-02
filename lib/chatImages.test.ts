import test from 'node:test'
import assert from 'node:assert/strict'
import { extractPhotoUrls } from './chatImages'

test('extractPhotoUrls parses JSON stringified arrays without brackets', () => {
  const input = '["https://xtbnfcxukz.supabase.co/storage/v1/object/public/chat_images/user/1788800113818_test.jpg"]'
  const result = extractPhotoUrls(input)
  assert.deepEqual(result, [
    'https://xtbnfcxukz.supabase.co/storage/v1/object/public/chat_images/user/1788800113818_test.jpg',
  ])
})

test('extractPhotoUrls parses normal arrays of URLs', () => {
  const input = ['https://example.com/1.jpg', 'https://example.com/2.jpg']
  const result = extractPhotoUrls(input)
  assert.deepEqual(result, ['https://example.com/1.jpg', 'https://example.com/2.jpg'])
})

test('extractPhotoUrls handles single plain image_url', () => {
  const result = extractPhotoUrls(null, 'https://example.com/single.jpg')
  assert.deepEqual(result, ['https://example.com/single.jpg'])
})

test('extractPhotoUrls handles Postgres array string syntax', () => {
  const input = '{"https://example.com/a.jpg","https://example.com/b.jpg"}'
  const result = extractPhotoUrls(input)
  assert.deepEqual(result, ['https://example.com/a.jpg', 'https://example.com/b.jpg'])
})

test('extractPhotoUrls deduplicates and cleans leading/trailing punctuation', () => {
  const result = extractPhotoUrls(['https://example.com/img.jpg'], 'https://example.com/img.jpg')
  assert.deepEqual(result, ['https://example.com/img.jpg'])
})
