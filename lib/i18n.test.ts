import test from 'node:test'
import assert from 'node:assert/strict'

import { normalizeLocale, getT, isFrenchSpeakingCountry, isFrenchSpeakingTimezone } from './i18n'

test('normalizeLocale maps French-speaking country codes to French', () => {
  assert.equal(normalizeLocale('fr-CI'), 'fr')
  assert.equal(normalizeLocale('fr-FR'), 'fr')
  assert.equal(normalizeLocale('en-CI'), 'fr')
  assert.equal(normalizeLocale('CI'), 'fr')
})

test('isFrenchSpeakingCountry recognizes Ivory Coast and others', () => {
  assert.equal(isFrenchSpeakingCountry('CI'), true)
  assert.equal(isFrenchSpeakingCountry('ci'), true)
  assert.equal(isFrenchSpeakingCountry('FR'), true)
  assert.equal(isFrenchSpeakingCountry('SN'), true)
  assert.equal(isFrenchSpeakingCountry('US'), false)
})

test('isFrenchSpeakingTimezone recognizes Abidjan, Paris, etc.', () => {
  assert.equal(isFrenchSpeakingTimezone('Africa/Abidjan'), true)
  assert.equal(isFrenchSpeakingTimezone('Europe/Paris'), true)
  assert.equal(isFrenchSpeakingTimezone('America/New_York'), false)
})

test('normalizeLocale maps Spanish locales to Spanish', () => {
  assert.equal(normalizeLocale('es-MX'), 'es')
  assert.equal(normalizeLocale('es-ES'), 'es')
})

test('getT returns French translations for French locales', () => {
  const translation = getT('fr')
  assert.equal(translation.beforeSend, "Avant d'envoyer")
  assert.equal(translation.tabPlay, 'Partager')
  assert.equal(translation.anonymousMessageBanner, 'Envoie moi un message anonyme et on chat anonymement')
})

