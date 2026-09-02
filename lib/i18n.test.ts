import test from 'node:test'
import assert from 'node:assert/strict'

import { normalizeLocale, getT } from './i18n'

test('normalizeLocale maps French-speaking country codes to French', () => {
  assert.equal(normalizeLocale('fr-CI'), 'fr')
  assert.equal(normalizeLocale('fr-FR'), 'fr')
})

test('normalizeLocale maps Spanish locales to Spanish', () => {
  assert.equal(normalizeLocale('es-MX'), 'es')
  assert.equal(normalizeLocale('es-ES'), 'es')
})

test('getT returns French translations for French locales', () => {
  const translation = getT('fr')
  assert.equal(translation.beforeSend, "Avant d'envoyer")
})
