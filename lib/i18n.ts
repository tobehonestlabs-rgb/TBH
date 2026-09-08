import { useState, useEffect, useCallback } from 'react'

export type T = {
  beforeSend: string
  prohibited: string
  harassment: string
  harmful: string
  sexualContent: string
  noSlurs: string
  agree: string
  violations: string
  messageFor: string
  writePlaceholder: string
  addPhoto: string
  sendAnonymously: string
  sending: string
  wantLink: string
  getMyLink: string
  sendAnother: string
  delivered: string
  deliveredTo: string
  peopleReceiving: string
  anonymousMessaging: string
  requestTimeout: string
  imageTooLarge: string
  serverError: string
  failedToSend: string
  share: string
  shareReply: string
  shareGifReply: string
  reply: string
  // SharePage
  shareMyLink: string
  copied: string
  copyMyLink: string
  theMoreYouShare: string
  shareFormat: string
  chooseHowToShare: string
  image: string
  staticPng: string
  gif: string
  animated: string
  cardColor: string
  png: string
  imageReady: string
  gifReady: string
  tapToShare: string
  shareImageAndLink: string
  cancel: string
  editYourMessage: string
  showsOnYourShareCard: string
  save: string
  chooseYourGame: string
  eachGameChanges: string
  change: string
  howToPostMyLink: string
  // SettingsPage
  settings: string
  edit: string
  account: string
  editProfile: string
  changeUsernameAndPhoto: string
  resources: string
  howToShare: string
  learnHowToPost: string
  followUsOnX: string
  deleteAccount: string
  deleteAccountQ: string
  deleteWarning: string
  deleting: string
  yesDeleteEverything: string
  // ChatPage
  noConversationsYet: string
  openAMessage: string
  newConversation: string
  noMessagesYet: string
  noMessagesYetSayHello: string
  renameConversation: string
  enterAName: string
  endToEndPrivate: string
  messagePlaceholder: string
  sent: string
  read: string
  now: string
  // MessagesPages
  noMessagesYetInbox: string
  shareLinkToReceive: string
  newMessage: string
  photo: string
  tapToRead: string
  whoSentThis: string
  viewSenderInsights: string
  startAConversation: string
  replyPrivately: string
  back: string
  backToMessage: string
  senderInsights: string
  approximateInfo: string
  location: string
  unknown: string
  ipAddress: string
  notAvailable: string
  device: string
  messagesFromThisSender: string
  locationMapNotAvailable: string
  anonymousSender: string
  privateConversation: string
  startConversation: string
  typeReply: string
  text: string
  pickAGif: string
  changeGif: string
  // Navigation & Tabs
  tabPlay?: string
  tabMessages?: string
  tabChat?: string
  // ReadMessageScreen
  messageNotFound?: string
  goBack?: string
  anonymousMessageBanner?: string
  photoTapFullscreen?: string
  noMessageContent?: string
  replyPublicly?: string
  replyPubliclySub?: string
  yourReplyPlaceholder?: string
  sendReplyGo?: string
  preparingAndSharing?: string
  shareFailed?: string
  // TBHProScreen / Insights
  unlockWithPro?: string
  seeWhoSentIt?: string
  subscribeNow?: string
  proFeature1?: string
  proFeature2?: string
  proFeature3?: string
  pricePerWeek?: string
  cancelAnytime?: string
  // Onboarding
  chooseUsername?: string
  usernamePlaceholder?: string
  continueBtn?: string
  usernameTaken?: string
  // Notification / InAppBrowser
  openInExternalBrowser?: string
  enableNotifications?: string
  neverMissMessage?: string
  allow?: string
  notNow?: string
  // Additional SharePage
  step1CopyLink?: string
  step2ShareStory?: string
  step2ShareStorySub?: string
  cardPromptDefault?: string
  tapToChangeText?: string
  // Added for app-wide French localization
  addToHomeScreen?: string
  addToHomeScreenDesc?: string
  add?: string
  justNow?: string
  openInBrowser?: string
  openInBrowserDesc?: string
  openInBrowserStep1Ios?: string
  openInBrowserStep2Ios?: string
  openInBrowserStep1Android?: string
  openInBrowserStep2Android?: string
  copyLinkManual?: string
  linkCopied?: string
  blurPhotoWhenSharing?: string
  hidesInExportedCard?: string
  whoSentThisBtn?: string
  chatBtn?: string
  photoMode?: string
  sharePhotoReply?: string
  changePhoto?: string
  pickAPhoto?: string
  startTheConversation?: string
  readIndicator?: string
  sentIndicator?: string
  report?: string
  editProfileTitle?: string
  tapPhotoToChange?: string
  usernameLabel?: string
  saveChanges?: string
  noChangesToSave?: string
  savedRedirecting?: string
  usernameTooShort?: string
  howToShareTitle?: string
  goViralTitle?: string
  howToShareSub?: string
  guideStep1Title?: string
  guideStep1Desc?: string
  guideStep2Title?: string
  guideStep2Desc?: string
  guideStep3Title?: string
  guideStep3Desc?: string
  imReadyBtn?: string
  anonymousMessagingIsLive?: string
  backToTBH?: string
  searchGifsPlaceholder?: string
  noGifsFound?: string
  drawTool?: string
  censorTool?: string
  cropTool?: string
  undoBtn?: string
  doneBtn?: string
  resetBtn?: string
  applyCropBtn?: string
  editPhotoTitle?: string
  oneTimeUnlockForever?: string
  offlineTitle?: string
  offlineDesc?: string
  retryBtn?: string
}

const en: T = {
  beforeSend: 'Before you send',
  prohibited: 'These are strictly prohibited on TBH',
  harassment: 'Harassment & bullying',
  harmful: 'Harmful content',
  sexualContent: 'Inappropriate or sexual content involving children',
  noSlurs: 'No slurs, stay respectful',
  agree: 'I agree, continue →',
  violations: 'Violations may result in permanent ban',
  messageFor: 'Message for',
  writePlaceholder: 'Write your message here...',
  addPhoto: 'Add a photo',
  sendAnonymously: 'Send anonymously',
  sending: 'Sending…',
  wantLink: 'Want to receive anonymous messages too?',
  getMyLink: 'Get my own link',
  sendAnother: 'Send another',
  delivered: 'Sent!',
  deliveredTo: 'Your anonymous message to',
  peopleReceiving: 'people are receiving messages right now',
  anonymousMessaging: 'send anything anonymously',
  requestTimeout: 'Request timed out. Check your connection and try again.',
  imageTooLarge: 'Image too large. Try a smaller photo.',
  serverError: 'Server error. Please try again in a moment.',
  failedToSend: 'Failed to send. Check your connection.',
  share: 'Share',
  shareReply: 'Share Reply',
  shareGifReply: 'Share GIF Reply',
  reply: 'Reply',
  // SharePage
  shareMyLink: 'Share my link',
  copied: 'Copied!',
  copyMyLink: 'Copy my link',
  theMoreYouShare: 'The more you share, the more messages you receive from your friends',
  shareFormat: 'Share Format',
  chooseHowToShare: 'Choose how to share your card',
  image: 'Image',
  staticPng: 'Static PNG',
  gif: 'GIF',
  animated: '4s animated',
  cardColor: 'Card Color',
  png: 'PNG',
  imageReady: 'Image ready!',
  gifReady: 'GIF ready!',
  tapToShare: 'Tap below — then pick your app from the share menu',
  shareImageAndLink: 'Share image + link',
  cancel: 'Cancel',
  editYourMessage: 'Edit your message',
  showsOnYourShareCard: 'This shows on your share card',
  save: 'Save',
  chooseYourGame: 'Choose your game',
  eachGameChanges: 'Each game changes what appears on your share card',
  change: 'Change',
  howToPostMyLink: 'How to post my link?',
  // SettingsPage
  settings: 'Settings',
  edit: 'Edit',
  account: 'Account',
  editProfile: 'Edit profile',
  changeUsernameAndPhoto: 'Change your username and photo',
  resources: 'Resources',
  howToShare: 'How to share',
  learnHowToPost: 'Learn how to post your link',
  followUsOnX: 'Follow us on X',
  deleteAccount: 'Delete account',
  deleteAccountQ: 'Delete account?',
  deleteWarning: 'This will permanently delete your profile, messages, and all your data. This cannot be undone.',
  deleting: 'Deleting…',
  yesDeleteEverything: 'Yes, delete everything',
  // ChatPage
  noConversationsYet: 'No conversations yet',
  openAMessage: 'Open a message and tap "Start a conversation" to reply privately',
  newConversation: 'New conversation',
  noMessagesYet: 'No messages yet',
  noMessagesYetSayHello: 'No messages yet. Say hello!',
  renameConversation: 'Rename conversation',
  enterAName: 'Enter a name…',
  endToEndPrivate: 'End-to-end private conversation',
  messagePlaceholder: 'Message…',
  sent: 'Sent',
  read: 'Read',
  now: 'now',
  // MessagesPages
  noMessagesYetInbox: 'No messages yet',
  shareLinkToReceive: 'Share your link to receive some!',
  newMessage: 'New message',
  photo: 'Photo',
  tapToRead: 'Tap to read',
  whoSentThis: 'Who sent this?',
  viewSenderInsights: 'View sender insights',
  startAConversation: 'Start a conversation',
  replyPrivately: 'Reply privately',
  back: 'Back',
  backToMessage: 'Back to message',
  senderInsights: 'Sender Insights',
  approximateInfo: 'Approximate information based on network data',
  location: 'Location',
  unknown: 'Unknown',
  ipAddress: 'IP Address',
  notAvailable: 'Not available',
  device: 'Device',
  messagesFromThisSender: 'Messages from this sender',
  locationMapNotAvailable: 'Location map not available',
  anonymousSender: 'Anonymous sender',
  privateConversation: 'Private conversation',
  startConversation: 'Start a conversation',
  typeReply: 'Write your reply…',
  text: 'Text',
  pickAGif: '🎬 Pick a GIF',
  changeGif: 'Change GIF',
  // Navigation & Tabs
  tabPlay: 'Play',
  tabMessages: 'Messages',
  tabChat: 'Chat',
  // ReadMessageScreen
  messageNotFound: 'Message not found',
  goBack: 'Go back',
  anonymousMessageBanner: 'Envoie moi un message anonyme et on chat anonymement',
  photoTapFullscreen: 'Tap to view fullscreen',
  noMessageContent: 'No message content',
  replyPublicly: 'Reply publicly',
  replyPubliclySub: 'Your reply will be shared as a story card',
  yourReplyPlaceholder: 'Your reply...',
  sendReplyGo: 'Go',
  preparingAndSharing: 'Preparing and sharing...',
  shareFailed: 'Share failed',
  // TBHProScreen / Insights
  unlockWithPro: 'Unlock with TBH Pro',
  seeWhoSentIt: 'See who sent it',
  subscribeNow: 'Subscribe now',
  proFeature1: 'Reveals approximate location & device',
  proFeature2: 'Track clues and network data',
  proFeature3: 'Unlimited message insights',
  pricePerWeek: 'per week',
  cancelAnytime: 'Cancel anytime',
  // Onboarding
  chooseUsername: 'Choose your username',
  usernamePlaceholder: 'username',
  continueBtn: 'Continue',
  usernameTaken: 'Username already taken',
  // Notification / InAppBrowser
  openInExternalBrowser: 'Open in external browser for the best experience',
  enableNotifications: 'Enable notifications',
  neverMissMessage: 'Never miss a message',
  allow: 'Allow',
  notNow: 'Not now',
  // Additional SharePage
  step1CopyLink: 'Step 1: Copy your link',
  step2ShareStory: 'Step 2: Share on your story',
  step2ShareStorySub: 'Paste your link on Instagram, Snapchat or TikTok',
  cardPromptDefault: 'send me anonymous messages!',
  tapToChangeText: 'Tap to change text',
  // Added for app-wide French localization
  addToHomeScreen: 'Add to Home Screen',
  addToHomeScreenDesc: 'Add TBH to your home screen for easier access to messages.',
  add: 'Add',
  justNow: 'now',
  openInBrowser: 'Open in external browser',
  openInBrowserDesc: "browser doesn't support sign-in. Open this page in external browser to continue.",
  openInBrowserStep1Ios: 'Tap {menu} in the top-right corner',
  openInBrowserStep2Ios: 'Select "Open in Safari"',
  openInBrowserStep1Android: 'Tap the menu (⋮) in the top-right corner',
  openInBrowserStep2Android: 'Select "Open in Chrome"',
  copyLinkManual: 'Copy link to open manually',
  linkCopied: 'Link copied!',
  blurPhotoWhenSharing: 'Blur photo when sharing',
  hidesInExportedCard: 'Hides it in the exported card',
  whoSentThisBtn: 'Who sent this👀',
  chatBtn: 'Chat👀',
  photoMode: 'Photo 📷',
  sharePhotoReply: 'Share Photo Reply',
  changePhoto: 'Change Photo',
  pickAPhoto: '📷 Pick a Photo',
  startTheConversation: 'Start the conversation',
  readIndicator: 'Read',
  sentIndicator: 'Sent',
  report: 'Report',
  editProfileTitle: 'Edit profile',
  tapPhotoToChange: 'Tap photo to change',
  usernameLabel: 'Username',
  saveChanges: 'Save changes',
  noChangesToSave: 'No changes to save',
  savedRedirecting: 'Saved! Redirecting…',
  usernameTooShort: 'Username must be at least 2 characters.',
  howToShareTitle: 'HOW TO SHARE',
  goViralTitle: 'GO VIRAL.',
  howToShareSub: 'How to share your TBH link correctly:',
  guideStep1Title: 'COPY YOUR LINK',
  guideStep1Desc: "Your unique TBH link is the key. It's already waiting in your clipboard.",
  guideStep2Title: 'PICK YOUR VIBE',
  guideStep2Desc: 'Open Instagram or Snapchat. Capture or upload the card you just saved.',
  guideStep3Title: 'STICK THE LINK',
  guideStep3Desc: "Use the 'Link' sticker (IG) or 'Paperclip' (Snap). Paste your link and place it over the card.",
  imReadyBtn: "I'M READY",
  anonymousMessagingIsLive: 'Anonymous messaging is live.',
  backToTBH: 'BACK TO TBH',
  searchGifsPlaceholder: 'Search GIFs…',
  noGifsFound: 'No GIFs found',
  drawTool: 'Draw',
  censorTool: 'Censor',
  cropTool: 'Crop',
  undoBtn: 'Undo',
  doneBtn: 'Done',
  resetBtn: 'Reset',
  applyCropBtn: 'Apply Crop',
  editPhotoTitle: 'Edit photo',
  oneTimeUnlockForever: 'One-time unlock, forever',
  offlineTitle: "You're offline",
  offlineDesc: 'Check your connection and try again.',
  retryBtn: 'Retry',
}

const fr: T = {
  beforeSend: "Avant d'envoyer",
  prohibited: 'Ces contenus sont strictement interdits sur TBH',
  harassment: 'Harcèlement & intimidation',
  harmful: 'Contenu nuisible',
  sexualContent: "Contenu inapproprié ou sexuel impliquant des enfants",
  noSlurs: 'Pas d\'insultes, restez respectueux',
  agree: 'J\'accepte, continuer →',
  violations: 'Les infractions peuvent entraîner un bannissement définitif',
  messageFor: 'Message pour',
  writePlaceholder: 'Écris ton message ici...',
  addPhoto: 'Ajouter une photo',
  sendAnonymously: 'Envoyer anonymement',
  sending: 'Envoi en cours…',
  wantLink: 'Tu veux aussi recevoir des messages anonymes ?',
  getMyLink: 'Obtenir mon lien',
  sendAnother: 'Envoyer un autre',
  delivered: 'Envoyé !',
  deliveredTo: 'Ton message anonyme à',
  peopleReceiving: 'personnes reçoivent des messages en ce moment',
  anonymousMessaging: 'envoie n\'importe quoi anonymement',
  requestTimeout: 'Délai dépassé. Vérifie ta connexion et réessaie.',
  imageTooLarge: 'Image trop volumineuse. Essaie une photo plus petite.',
  serverError: 'Erreur serveur. Réessaie dans un moment.',
  failedToSend: 'Échec de l\'envoi. Vérifie ta connexion.',
  share: 'Partager',
  shareReply: 'Partager la réponse',
  shareGifReply: 'Partager la réponse GIF',
  reply: 'Répondre',
  // SharePage
  shareMyLink: 'Partager mon lien',
  copied: 'Copié !',
  copyMyLink: 'Copier mon lien',
  theMoreYouShare: 'Plus tu partages, plus tu reçois de messages de tes amis',
  shareFormat: 'Format de partage',
  chooseHowToShare: 'Choisis comment partager ta carte',
  image: 'Image',
  staticPng: 'PNG statique',
  gif: 'GIF',
  animated: 'Animé 4s',
  cardColor: 'Couleur de la carte',
  png: 'PNG',
  imageReady: 'Image prête !',
  gifReady: 'GIF prêt !',
  tapToShare: 'Appuie ci-dessous — puis choisis ton app dans le menu de partage',
  shareImageAndLink: 'Partager image + lien',
  cancel: 'Annuler',
  editYourMessage: 'Modifier ton message',
  showsOnYourShareCard: 'Ceci apparaît sur ta carte de partage',
  save: 'Enregistrer',
  chooseYourGame: 'Choisis ton jeu',
  eachGameChanges: 'Chaque jeu change ce qui apparaît sur ta carte de partage',
  change: 'Changer',
  howToPostMyLink: 'Comment publier mon lien ?',
  // SettingsPage
  settings: 'Paramètres',
  edit: 'Modifier',
  account: 'Compte',
  editProfile: 'Modifier le profil',
  changeUsernameAndPhoto: 'Changer ton pseudo et ta photo',
  resources: 'Ressources',
  howToShare: 'Comment partager',
  learnHowToPost: 'Apprends à publier ton lien',
  followUsOnX: 'Suivez-nous sur X',
  deleteAccount: 'Supprimer le compte',
  deleteAccountQ: 'Supprimer le compte ?',
  deleteWarning: 'Ceci supprimera définitivement ton profil, tes messages et toutes tes données. Ceci ne peut pas être annulé.',
  deleting: 'Suppression…',
  yesDeleteEverything: 'Oui, tout supprimer',
  // ChatPage
  noConversationsYet: 'Pas encore de conversations',
  openAMessage: 'Ouvre un message et appuie sur "Commencer une conversation" pour répondre en privé',
  newConversation: 'Nouvelle conversation',
  noMessagesYet: 'Pas encore de messages',
  noMessagesYetSayHello: 'Pas encore de messages. Dis bonjour !',
  renameConversation: 'Renommer la conversation',
  enterAName: 'Entrez un nom…',
  endToEndPrivate: 'Conversation privée de bout en bout',
  messagePlaceholder: 'Message…',
  sent: 'Envoyé',
  read: 'Lu',
  now: 'maintenant',
  // MessagesPages
  noMessagesYetInbox: 'Pas encore de messages',
  shareLinkToReceive: 'Partage ton lien pour en recevoir !',
  newMessage: 'Nouveau message',
  photo: 'Photo',
  tapToRead: 'Appuie pour lire',
  whoSentThis: 'Qui a envoyé ça ?',
  viewSenderInsights: 'Voir les infos sur l\'expéditeur',
  startAConversation: 'Commencer une conversation',
  replyPrivately: 'Répondre en privé',
  back: 'Retour',
  backToMessage: 'Retour au message',
  senderInsights: 'Infos sur l\'expéditeur',
  approximateInfo: 'Informations approximatives basées sur les données réseau',
  location: 'Localisation',
  unknown: 'Inconnu',
  ipAddress: 'Adresse IP',
  notAvailable: 'Indisponible',
  device: 'Appareil',
  messagesFromThisSender: 'Messages de cet expéditeur',
  locationMapNotAvailable: 'Carte de localisation indisponible',
  anonymousSender: 'Expéditeur anonyme',
  privateConversation: 'Conversation privée',
  startConversation: 'Commencer une conversation',
  typeReply: 'Écris ta réponse…',
  text: 'Texte',
  pickAGif: '🎬 Choisir un GIF',
  changeGif: 'Changer le GIF',
  // Navigation & Tabs
  tabPlay: 'Partager',
  tabMessages: 'Messages',
  tabChat: 'Chat',
  // ReadMessageScreen
  messageNotFound: 'Message introuvable',
  goBack: 'Retour',
  anonymousMessageBanner: 'Envoie moi un message anonyme et on chat anonymement',
  photoTapFullscreen: 'Appuie pour agrandir',
  noMessageContent: 'Aucun contenu de message',
  replyPublicly: 'Répondre publiquement',
  replyPubliclySub: 'Ta réponse sera partagée sous forme de story',
  yourReplyPlaceholder: 'Ta réponse…',
  sendReplyGo: 'Envoyer',
  preparingAndSharing: 'Préparation et partage en cours…',
  shareFailed: 'Échec du partage',
  // TBHProScreen / Insights
  unlockWithPro: 'Débloquer avec TBH Pro',
  seeWhoSentIt: 'Découvre qui a envoyé ce message',
  subscribeNow: "S'abonner maintenant",
  proFeature1: 'Révèle la localisation approximative et l’appareil',
  proFeature2: 'Indices exclusifs et données réseau',
  proFeature3: 'Indices illimités sur tous les messages',
  pricePerWeek: 'par semaine',
  cancelAnytime: 'Sans engagement, annule à tout moment',
  // Onboarding
  chooseUsername: "Choisis ton nom d'utilisateur",
  usernamePlaceholder: 'pseudo',
  continueBtn: 'Continuer',
  usernameTaken: 'Ce pseudo est déjà pris',
  // Notification / InAppBrowser
  openInExternalBrowser: 'Ouvre dans ton navigateur pour une meilleure expérience',
  enableNotifications: 'Activer les notifications',
  neverMissMessage: 'Ne manque aucun message',
  allow: 'Autoriser',
  notNow: 'Plus tard',
  // Additional SharePage
  step1CopyLink: 'Étape 1 : Copie ton lien',
  step2ShareStory: 'Étape 2 : Partage sur ta story',
  step2ShareStorySub: 'Colle ton lien sur Instagram, Snapchat ou TikTok',
  cardPromptDefault: 'envoie-moi des messages anonymes !',
  tapToChangeText: 'Appuie pour modifier le texte',
  // Added for app-wide French localization
  addToHomeScreen: "Ajouter à l'écran d'accueil",
  addToHomeScreenDesc: 'Ajoutez TBH à votre écran d\'accueil pour accéder facilement à vos messages.',
  add: 'Ajouter',
  justNow: 'maintenant',
  openInBrowser: 'Ouvrir dans le navigateur',
  openInBrowserDesc: "ne prend pas en charge la connexion. Ouvrez cette page dans le navigateur externe pour continuer.",
  openInBrowserStep1Ios: 'Appuyez sur {menu} dans le coin supérieur droit',
  openInBrowserStep2Ios: 'Sélectionnez « Ouvrir dans Safari »',
  openInBrowserStep1Android: 'Appuyez sur le menu (⋮) dans le coin supérieur droit',
  openInBrowserStep2Android: 'Sélectionnez « Ouvrir dans Chrome »',
  copyLinkManual: 'Copier le lien pour ouvrir manuellement',
  linkCopied: 'Lien copié !',
  blurPhotoWhenSharing: 'Flouter la photo lors du partage',
  hidesInExportedCard: 'La masque dans la carte exportée',
  whoSentThisBtn: 'Qui a envoyé ça 👀',
  chatBtn: 'Chat 👀',
  photoMode: 'Photo 📷',
  sharePhotoReply: 'Partager la réponse photo',
  changePhoto: 'Changer de photo',
  pickAPhoto: '📷 Choisir une photo',
  startTheConversation: 'Commencer la conversation',
  readIndicator: 'Lu',
  sentIndicator: 'Envoyé',
  report: 'Signaler',
  editProfileTitle: 'Modifier le profil',
  tapPhotoToChange: 'Toucher pour changer la photo',
  usernameLabel: "Nom d'utilisateur",
  saveChanges: 'Enregistrer les modifications',
  noChangesToSave: 'Aucune modification',
  savedRedirecting: 'Enregistré ! Redirection…',
  usernameTooShort: "Le nom d'utilisateur doit contenir au moins 2 caractères.",
  howToShareTitle: 'COMMENT PARTAGER',
  goViralTitle: 'DEVIENS VIRAL.',
  howToShareSub: 'Comment partager ton lien TBH correctement :',
  guideStep1Title: 'COPIE TON LIEN',
  guideStep1Desc: "Ton lien TBH unique est la clé. Il attend déjà dans ton presse-papier.",
  guideStep2Title: 'CHOISIS TON STYLE',
  guideStep2Desc: 'Ouvre Instagram ou Snapchat. Prends une photo ou importe la carte enregistrée.',
  guideStep3Title: 'COLLE LE LIEN',
  guideStep3Desc: "Utilise le sticker « Lien » (IG) ou « Trombone » (Snap). Colle ton lien sur la carte.",
  imReadyBtn: 'JE SUIS PRÊT',
  anonymousMessagingIsLive: 'La messagerie anonyme est active.',
  backToTBH: 'RETOUR À TBH',
  searchGifsPlaceholder: 'Rechercher des GIF…',
  noGifsFound: 'Aucun GIF trouvé',
  drawTool: 'Dessiner',
  censorTool: 'Flouter',
  cropTool: 'Recadrer',
  undoBtn: 'Annuler',
  doneBtn: 'Terminé',
  resetBtn: 'Réinitialiser',
  applyCropBtn: 'Appliquer le recadrage',
  editPhotoTitle: 'Modifier la photo',
  oneTimeUnlockForever: 'Déblocage unique, pour toujours',
  offlineTitle: 'Tu es hors ligne',
  offlineDesc: 'Vérifie ta connexion et réessaie.',
  retryBtn: 'Réessayer',
}

const es: T = {
  beforeSend: 'Antes de enviar',
  prohibited: 'Estos están estrictamente prohibidos en TBH',
  harassment: 'Acoso e intimidación',
  harmful: 'Contenido dañino',
  sexualContent: 'Contenido inapropiado o sexual que involucre menores',
  noSlurs: 'Sin insultos, sé respetuoso',
  agree: 'Acepto, continuar →',
  violations: 'Las infracciones pueden resultar en un ban permanente',
  messageFor: 'Mensaje para',
  writePlaceholder: 'Escribe tu mensaje aquí...',
  addPhoto: 'Añadir una foto',
  sendAnonymously: 'Enviar anónimamente',
  sending: 'Enviando…',
  wantLink: '¿Quieres recibir mensajes anónimos también?',
  getMyLink: 'Obtener mi enlace',
  sendAnother: 'Enviar otro',
  delivered: '¡Enviado!',
  deliveredTo: 'Tu mensaje anónimo a',
  peopleReceiving: 'personas están recibiendo mensajes ahora mismo',
  anonymousMessaging: 'envía lo que quieras de forma anónima',
  requestTimeout: 'Tiempo de espera agotado. Comprueba tu conexión.',
  imageTooLarge: 'Imagen demasiado grande. Prueba con una foto más pequeña.',
  serverError: 'Error del servidor. Inténtalo de nuevo en un momento.',
  failedToSend: 'Error al enviar. Comprueba tu conexión.',
  share: 'Compartir',
  shareReply: 'Compartir respuesta',
  shareGifReply: 'Compartir respuesta GIF',
  reply: 'Responder',
  // SharePage
  shareMyLink: 'Compartir mi enlace',
  copied: '¡Copiado!',
  copyMyLink: 'Copiar mi enlace',
  theMoreYouShare: 'Cuanto más compartas, más mensajes recibes de tus amigos',
  shareFormat: 'Formato de compartir',
  chooseHowToShare: 'Elige cómo compartir tu tarjeta',
  image: 'Imagen',
  staticPng: 'PNG estático',
  gif: 'GIF',
  animated: 'Animado 4s',
  cardColor: 'Color de la tarjeta',
  png: 'PNG',
  imageReady: '¡Imagen lista!',
  gifReady: '¡GIF listo!',
  tapToShare: 'Toca abajo — luego elige tu app del menú de compartir',
  shareImageAndLink: 'Compartir imagen + enlace',
  cancel: 'Cancelar',
  editYourMessage: 'Edita tu mensaje',
  showsOnYourShareCard: 'Esto aparece en tu tarjeta de compartir',
  save: 'Guardar',
  chooseYourGame: 'Elige tu juego',
  eachGameChanges: 'Cada juego cambia lo que aparece en tu tarjeta de compartir',
  change: 'Cambiar',
  howToPostMyLink: '¿Cómo publicar mi enlace?',
  // SettingsPage
  settings: 'Configuración',
  edit: 'Editar',
  account: 'Cuenta',
  editProfile: 'Editar perfil',
  changeUsernameAndPhoto: 'Cambiar tu nombre de usuario y foto',
  resources: 'Recursos',
  howToShare: 'Cómo compartir',
  learnHowToPost: 'Aprende a publicar tu enlace',
  followUsOnX: 'Síguenos en X',
  deleteAccount: 'Eliminar cuenta',
  deleteAccountQ: '¿Eliminar cuenta?',
  deleteWarning: 'Esto eliminará permanentemente tu perfil, mensajes y todos tus datos. Esto no se puede deshacer.',
  deleting: 'Eliminando…',
  yesDeleteEverything: 'Sí, eliminar todo',
  // ChatPage
  noConversationsYet: 'Aún no hay conversaciones',
  openAMessage: 'Abre un mensaje y toca "Iniciar una conversación" para responder en privado',
  newConversation: 'Nueva conversación',
  noMessagesYet: 'Aún no hay mensajes',
  noMessagesYetSayHello: 'Aún no hay mensajes. ¡Di hola!',
  renameConversation: 'Renombrar conversación',
  enterAName: 'Ingresa un nombre…',
  endToEndPrivate: 'Conversación privada de extremo a extremo',
  messagePlaceholder: 'Mensaje…',
  sent: 'Enviado',
  read: 'Leído',
  now: 'ahora',
  // MessagesPages
  noMessagesYetInbox: 'Aún no hay mensajes',
  shareLinkToReceive: '¡Comparte tu enlace para recibir algunos!',
  newMessage: 'Nuevo mensaje',
  photo: 'Foto',
  tapToRead: 'Toca para leer',
  whoSentThis: '¿Quién envió esto?',
  viewSenderInsights: 'Ver información del remitente',
  startAConversation: 'Iniciar una conversación',
  replyPrivately: 'Responder en privado',
  back: 'Volver',
  backToMessage: 'Volver al mensaje',
  senderInsights: 'Información del remitente',
  approximateInfo: 'Información aproximada basada en datos de red',
  location: 'Ubicación',
  unknown: 'Desconocido',
  ipAddress: 'Dirección IP',
  notAvailable: 'No disponible',
  device: 'Dispositivo',
  messagesFromThisSender: 'Mensajes de este remitente',
  locationMapNotAvailable: 'Mapa de ubicación no disponible',
  anonymousSender: 'Remitente anónimo',
  privateConversation: 'Conversación privada',
  startConversation: 'Iniciar una conversación',
  typeReply: 'Escribe tu respuesta…',
  text: 'Texto',
  pickAGif: '🎬 Elegir un GIF',
  changeGif: 'Cambiar GIF',
  // Navigation & Tabs
  tabPlay: 'Jugar',
  tabMessages: 'Mensajes',
  tabChat: 'Chat',
  // ReadMessageScreen
  messageNotFound: 'Mensaje no encontrado',
  goBack: 'Volver',
  anonymousMessageBanner: 'Envoie moi un message anonyme et on chat anonymement',
  photoTapFullscreen: 'Toca para ver en pantalla completa',
  noMessageContent: 'Sin contenido de mensaje',
  replyPublicly: 'Responder públicamente',
  replyPubliclySub: 'Tu respuesta se compartirá como una historia',
  yourReplyPlaceholder: 'Tu respuesta…',
  sendReplyGo: 'Enviar',
  preparingAndSharing: 'Preparando y compartiendo…',
  shareFailed: 'Error al compartir',
  // TBHProScreen / Insights
  unlockWithPro: 'Desbloquear con TBH Pro',
  seeWhoSentIt: 'Descubre quién lo envió',
  subscribeNow: 'Suscribirme ahora',
  proFeature1: 'Revela la ubicación aproximada y el dispositivo',
  proFeature2: 'Pistas y datos de red exclusivos',
  proFeature3: 'Pistas ilimitadas en todos los mensajes',
  pricePerWeek: 'por semana',
  cancelAnytime: 'Cancela cuando quieras',
  // Onboarding
  chooseUsername: 'Elige tu nombre de usuario',
  usernamePlaceholder: 'usuario',
  continueBtn: 'Continuar',
  usernameTaken: 'Este nombre de usuario ya está en uso',
  // Notification / InAppBrowser
  openInExternalBrowser: 'Abre en tu navegador externo para la mejor experiencia',
  enableNotifications: 'Activar notificaciones',
  neverMissMessage: 'No te pierdas ningún mensaje',
  allow: 'Permitir',
  notNow: 'Ahora no',
  // Additional SharePage
  step1CopyLink: 'Paso 1: Copia tu enlace',
  step2ShareStory: 'Paso 2: Comparte en tu historia',
  step2ShareStorySub: 'Pega tu enlace en Instagram, Snapchat o TikTok',
  cardPromptDefault: '¡envíame mensajes anónimos!',
  tapToChangeText: 'Toca para cambiar el texto',
}

const pt: T = {
  beforeSend: 'Antes de enviar',
  prohibited: 'Estes são estritamente proibidos no TBH',
  harassment: 'Assédio e bullying',
  harmful: 'Conteúdo prejudicial',
  sexualContent: 'Conteúdo inapropriado ou sexual envolvendo crianças',
  noSlurs: 'Sem insultos, seja respeitoso',
  agree: 'Concordo, continuar →',
  violations: 'Violações podem resultar em banimento permanente',
  messageFor: 'Mensagem para',
  writePlaceholder: 'Escreva sua mensagem aqui...',
  addPhoto: 'Adicionar foto',
  sendAnonymously: 'Enviar anonimamente',
  sending: 'Enviando…',
  wantLink: 'Quer receber mensagens anônimas também?',
  getMyLink: 'Obter meu link',
  sendAnother: 'Enviar outro',
  delivered: 'Enviado!',
  deliveredTo: 'Sua mensagem anônima para',
  peopleReceiving: 'pessoas estão recebendo mensagens agora',
  anonymousMessaging: 'envie qualquer coisa anonimamente',
  requestTimeout: 'Tempo esgotado. Verifique sua conexão e tente novamente.',
  imageTooLarge: 'Imagem muito grande. Tente uma foto menor.',
  serverError: 'Erro no servidor. Tente novamente em breve.',
  failedToSend: 'Falha ao enviar. Verifique sua conexão.',
  share: 'Compartilhar',
  shareReply: 'Compartilhar resposta',
  shareGifReply: 'Compartilhar resposta GIF',
  reply: 'Responder',
  // SharePage
  shareMyLink: 'Compartilhar meu link',
  copied: 'Copiado!',
  copyMyLink: 'Copiar meu link',
  theMoreYouShare: 'Quanto mais você compartilha, mais mensagens recebe dos seus amigos',
  shareFormat: 'Formato de compartilhamento',
  chooseHowToShare: 'Escolha como compartilhar seu cartão',
  image: 'Imagem',
  staticPng: 'PNG estático',
  gif: 'GIF',
  animated: 'Animado 4s',
  cardColor: 'Cor do cartão',
  png: 'PNG',
  imageReady: 'Imagem pronta!',
  gifReady: 'GIF pronto!',
  tapToShare: 'Toque abaixo — depois escolha seu app no menu de compartilhamento',
  shareImageAndLink: 'Compartilhar imagem + link',
  cancel: 'Cancelar',
  editYourMessage: 'Edite sua mensagem',
  showsOnYourShareCard: 'Isso aparece no seu cartão de compartilhamento',
  save: 'Salvar',
  chooseYourGame: 'Escolha seu jogo',
  eachGameChanges: 'Cada jogo muda o que aparece no seu cartão de compartilhamento',
  change: 'Alterar',
  howToPostMyLink: 'Como publicar meu link?',
  // SettingsPage
  settings: 'Configurações',
  edit: 'Editar',
  account: 'Conta',
  editProfile: 'Editar perfil',
  changeUsernameAndPhoto: 'Alterar seu nome de usuário e foto',
  resources: 'Recursos',
  howToShare: 'Como compartilhar',
  learnHowToPost: 'Aprenda a publicar seu link',
  followUsOnX: 'Siga-nos no X',
  deleteAccount: 'Excluir conta',
  deleteAccountQ: 'Excluir conta?',
  deleteWarning: 'Isso excluirá permanentemente seu perfil, mensagens e todos os seus dados. Isso não pode ser desfeito.',
  deleting: 'Excluindo…',
  yesDeleteEverything: 'Sim, excluir tudo',
  // ChatPage
  noConversationsYet: 'Ainda não há conversas',
  openAMessage: 'Abra uma mensagem e toque em "Iniciar uma conversa" para responder em privado',
  newConversation: 'Nova conversa',
  noMessagesYet: 'Ainda não há mensagens',
  noMessagesYetSayHello: 'Ainda não há mensagens. Diga olá!',
  renameConversation: 'Renomear conversa',
  enterAName: 'Digite um nome…',
  endToEndPrivate: 'Conversa privada de ponta a ponta',
  messagePlaceholder: 'Mensagem…',
  sent: 'Enviado',
  read: 'Lido',
  now: 'agora',
  // MessagesPages
  noMessagesYetInbox: 'Ainda não há mensagens',
  shareLinkToReceive: 'Compartilhe seu link para receber algumas!',
  newMessage: 'Nova mensagem',
  photo: 'Foto',
  tapToRead: 'Toque para ler',
  whoSentThis: 'Quem enviou isso?',
  viewSenderInsights: 'Ver informações do remetente',
  startAConversation: 'Iniciar uma conversa',
  replyPrivately: 'Responder em privado',
  back: 'Voltar',
  backToMessage: 'Voltar à mensagem',
  senderInsights: 'Informações do remetente',
  approximateInfo: 'Informações aproximadas com base em dados de rede',
  location: 'Localização',
  unknown: 'Desconhecido',
  ipAddress: 'Endereço IP',
  notAvailable: 'Não disponível',
  device: 'Dispositivo',
  messagesFromThisSender: 'Mensagens deste remetente',
  locationMapNotAvailable: 'Mapa de localização não disponível',
  anonymousSender: 'Remetente anônimo',
  privateConversation: 'Conversa privada',
  startConversation: 'Iniciar uma conversa',
  typeReply: 'Escreva sua resposta…',
  text: 'Texto',
  pickAGif: '🎬 Escolher um GIF',
  changeGif: 'Alterar GIF',
}

const de: T = {
  beforeSend: 'Bevor du sendest',
  prohibited: 'Diese sind auf TBH strikt verboten',
  harassment: 'Belästigung & Mobbing',
  harmful: 'Schädliche Inhalte',
  sexualContent: 'Unangemessene oder sexuelle Inhalte mit Minderjährigen',
  noSlurs: 'Keine Beleidigungen, bleib respektvoll',
  agree: 'Ich stimme zu, weiter →',
  violations: 'Verstöße können zu einem permanenten Bann führen',
  messageFor: 'Nachricht für',
  writePlaceholder: 'Schreibe deine Nachricht hier...',
  addPhoto: 'Foto hinzufügen',
  sendAnonymously: 'Anonym senden',
  sending: 'Wird gesendet…',
  wantLink: 'Möchtest du auch anonyme Nachrichten erhalten?',
  getMyLink: 'Meinen Link holen',
  sendAnother: 'Weitere senden',
  delivered: 'Gesendet!',
  deliveredTo: 'Deine anonyme Nachricht an',
  peopleReceiving: 'Personen erhalten gerade Nachrichten',
  anonymousMessaging: 'schick alles anonym',
  requestTimeout: 'Zeitüberschreitung. Überprüfe deine Verbindung und versuche es erneut.',
  imageTooLarge: 'Bild zu groß. Versuche ein kleineres Foto.',
  serverError: 'Serverfehler. Bitte versuche es in einem Moment erneut.',
  failedToSend: 'Senden fehlgeschlagen. Überprüfe deine Verbindung.',
  share: 'Teilen',
  shareReply: 'Antwort teilen',
  shareGifReply: 'GIF-Antwort teilen',
  reply: 'Antworten',
  // SharePage
  shareMyLink: 'Meinen Link teilen',
  copied: 'Kopiert!',
  copyMyLink: 'Meinen Link kopieren',
  theMoreYouShare: 'Je mehr du teilst, desto mehr Nachrichten erhältst du von deinen Freunden',
  shareFormat: 'Teilformat',
  chooseHowToShare: 'Wähle, wie du deine Karte teilen möchtest',
  image: 'Bild',
  staticPng: 'Statisches PNG',
  gif: 'GIF',
  animated: '4s animiert',
  cardColor: 'Kartenfarbe',
  png: 'PNG',
  imageReady: 'Bild bereit!',
  gifReady: 'GIF bereit!',
  tapToShare: 'Tippe unten — dann wähle deine App aus dem Share-Menü',
  shareImageAndLink: 'Bild + Link teilen',
  cancel: 'Abbrechen',
  editYourMessage: 'Deine Nachricht bearbeiten',
  showsOnYourShareCard: 'Dies erscheint auf deiner Share-Karte',
  save: 'Speichern',
  chooseYourGame: 'Wähle dein Spiel',
  eachGameChanges: 'Jedes Spiel ändert, was auf deiner Share-Karte erscheint',
  change: 'Ändern',
  howToPostMyLink: 'Wie poste ich meinen Link?',
  // SettingsPage
  settings: 'Einstellungen',
  edit: 'Bearbeiten',
  account: 'Konto',
  editProfile: 'Profil bearbeiten',
  changeUsernameAndPhoto: 'Benutzernamen und Foto ändern',
  resources: 'Ressourcen',
  howToShare: 'Wie teilen',
  learnHowToPost: 'Erfahre, wie du deinen Link posten kannst',
  followUsOnX: 'Folge uns auf X',
  deleteAccount: 'Konto löschen',
  deleteAccountQ: 'Konto löschen?',
  deleteWarning: 'Dies wird dein Profil, Nachrichten und alle deine Daten dauerhaft löschen. Dies kann nicht rückgängig gemacht werden.',
  deleting: 'Wird gelöscht…',
  yesDeleteEverything: 'Ja, alles löschen',
  // ChatPage
  noConversationsYet: 'Noch keine Unterhaltungen',
  openAMessage: 'Öffne eine Nachricht und tippe auf "Unterhaltung beginnen", um privat zu antworten',
  newConversation: 'Neue Unterhaltung',
  noMessagesYet: 'Noch keine Nachrichten',
  noMessagesYetSayHello: 'Noch keine Nachrichten. Sag hallo!',
  renameConversation: 'Unterhaltung umbenennen',
  enterAName: 'Gib einen Namen ein…',
  endToEndPrivate: 'Ende-zu-Ende private Unterhaltung',
  messagePlaceholder: 'Nachricht…',
  sent: 'Gesendet',
  read: 'Gelesen',
  now: 'jetzt',
  // MessagesPages
  noMessagesYetInbox: 'Noch keine Nachrichten',
  shareLinkToReceive: 'Teile deinen Link, um welche zu erhalten!',
  newMessage: 'Neue Nachricht',
  photo: 'Foto',
  tapToRead: 'Tippe zum Lesen',
  whoSentThis: 'Wer hat das geschickt?',
  viewSenderInsights: 'Absenderinformationen anzeigen',
  startAConversation: 'Eine Unterhaltung beginnen',
  replyPrivately: 'Privat antworten',
  back: 'Zurück',
  backToMessage: 'Zurück zur Nachricht',
  senderInsights: 'Absenderinformationen',
  approximateInfo: 'Ungefähre Informationen basierend auf Netzwerkdaten',
  location: 'Standort',
  unknown: 'Unbekannt',
  ipAddress: 'IP-Adresse',
  notAvailable: 'Nicht verfügbar',
  device: 'Gerät',
  messagesFromThisSender: 'Nachrichten von diesem Absender',
  locationMapNotAvailable: 'Standortkarte nicht verfügbar',
  anonymousSender: 'Anonymer Absender',
  privateConversation: 'Private Unterhaltung',
  startConversation: 'Eine Unterhaltung beginnen',
  typeReply: 'Schreibe deine Antwort…',
  text: 'Text',
  pickAGif: '🎬 Ein GIF auswählen',
  changeGif: 'GIF ändern',
}

const it: T = {
  beforeSend: 'Prima di inviare',
  prohibited: 'Questi sono strettamente vietati su TBH',
  harassment: 'Molestie e bullismo',
  harmful: 'Contenuti dannosi',
  sexualContent: 'Contenuti inappropriati o sessuali che coinvolgono minori',
  noSlurs: 'Nessun insulto, rimani rispettoso',
  agree: 'Accetto, continua →',
  violations: 'Le violazioni possono comportare un ban permanente',
  messageFor: 'Messaggio per',
  writePlaceholder: 'Scrivi il tuo messaggio qui...',
  addPhoto: 'Aggiungi una foto',
  sendAnonymously: 'Invia anonimamente',
  sending: 'Invio in corso…',
  wantLink: 'Vuoi ricevere anche tu messaggi anonimi?',
  getMyLink: 'Ottieni il mio link',
  sendAnother: 'Invia un altro',
  delivered: 'Inviato!',
  deliveredTo: 'Il tuo messaggio anonimo a',
  peopleReceiving: 'persone stanno ricevendo messaggi in questo momento',
  anonymousMessaging: 'invia qualsiasi cosa in modo anonimo',
  requestTimeout: 'Timeout della richiesta. Controlla la connessione e riprova.',
  imageTooLarge: 'Immagine troppo grande. Prova con una foto più piccola.',
  serverError: 'Errore del server. Riprova tra un momento.',
  failedToSend: "Invio fallito. Controlla la connessione.",
  share: 'Condividi',
  shareReply: 'Condividi risposta',
  shareGifReply: 'Condividi risposta GIF',
  reply: 'Rispondi',
  // SharePage
  shareMyLink: 'Condividi il mio link',
  copied: 'Copiato!',
  copyMyLink: 'Copia il mio link',
  theMoreYouShare: 'Più condividi, più messaggi ricevi dai tuoi amici',
  shareFormat: 'Formato di condivisione',
  chooseHowToShare: 'Scegli come condividere la tua carta',
  image: 'Immagine',
  staticPng: 'PNG statico',
  gif: 'GIF',
  animated: 'Animato 4s',
  cardColor: 'Colore della carta',
  png: 'PNG',
  imageReady: 'Immagine pronta!',
  gifReady: 'GIF pronta!',
  tapToShare: 'Tocca sotto — poi scegli la tua app dal menu di condivisione',
  shareImageAndLink: 'Condividi immagine + link',
  cancel: 'Annulla',
  editYourMessage: 'Modifica il tuo messaggio',
  showsOnYourShareCard: 'Questo appare sulla tua carta di condivisione',
  save: 'Salva',
  chooseYourGame: 'Scegli il tuo gioco',
  eachGameChanges: 'Ogni gioco cambia ciò che appare sulla tua carta di condivisione',
  change: 'Cambia',
  howToPostMyLink: 'Come posso pubblicare il mio link?',
  // SettingsPage
  settings: 'Impostazioni',
  edit: 'Modifica',
  account: 'Account',
  editProfile: 'Modifica profilo',
  changeUsernameAndPhoto: 'Cambia il tuo nome utente e la foto',
  resources: 'Risorse',
  howToShare: 'Come condividere',
  learnHowToPost: 'Impara a pubblicare il tuo link',
  followUsOnX: 'Seguici su X',
  deleteAccount: 'Elimina account',
  deleteAccountQ: 'Eliminare l\'account?',
  deleteWarning: 'Questo eliminerà permanentemente il tuo profilo, i messaggi e tutti i tuoi dati. Questo non può essere annullato.',
  deleting: 'Eliminando…',
  yesDeleteEverything: 'Sì, elimina tutto',
  // ChatPage
  noConversationsYet: 'Nessuna conversazione ancora',
  openAMessage: 'Apri un messaggio e tocca "Inizia una conversazione" per rispondere in privato',
  newConversation: 'Nuova conversazione',
  noMessagesYet: 'Nessun messaggio ancora',
  noMessagesYetSayHello: 'Nessun messaggio ancora. Saluta!',
  renameConversation: 'Rinomina conversazione',
  enterAName: 'Inserisci un nome…',
  endToEndPrivate: 'Conversazione privata end-to-end',
  messagePlaceholder: 'Messaggio…',
  sent: 'Inviato',
  read: 'Letto',
  now: 'ora',
  // MessagesPages
  noMessagesYetInbox: 'Nessun messaggio ancora',
  shareLinkToReceive: 'Condividi il tuo link per riceverne alcuni!',
  newMessage: 'Nuovo messaggio',
  photo: 'Foto',
  tapToRead: 'Tocca per leggere',
  whoSentThis: 'Chi l\'ha inviato?',
  viewSenderInsights: 'Vedi informazioni sul mittente',
  startAConversation: 'Inizia una conversazione',
  replyPrivately: 'Rispondi in privato',
  back: 'Indietro',
  backToMessage: 'Torna al messaggio',
  senderInsights: 'Informazioni sul mittente',
  approximateInfo: 'Informazioni approssimative basate sui dati di rete',
  location: 'Posizione',
  unknown: 'Sconosciuto',
  ipAddress: 'Indirizzo IP',
  notAvailable: 'Non disponibile',
  device: 'Dispositivo',
  messagesFromThisSender: 'Messaggi da questo mittente',
  locationMapNotAvailable: 'Mappa della posizione non disponibile',
  anonymousSender: 'Mittente anonimo',
  privateConversation: 'Conversazione privata',
  startConversation: 'Inizia una conversazione',
  typeReply: 'Scrivi la tua risposta…',
  text: 'Testo',
  pickAGif: '🎬 Scegli un GIF',
  changeGif: 'Cambia GIF',
}

const ar: T = {
  beforeSend: 'قبل الإرسال',
  prohibited: 'هذه ممنوعة منعاً باتاً على TBH',
  harassment: 'التحرش والتنمر',
  harmful: 'المحتوى الضار',
  sexualContent: 'المحتوى غير اللائق أو الجنسي الذي يشمل الأطفال',
  noSlurs: 'لا إهانات، ابقَ محترماً',
  agree: 'أوافق، المتابعة ←',
  violations: 'قد تؤدي الانتهاكات إلى حظر دائم',
  messageFor: 'رسالة إلى',
  writePlaceholder: 'اكتب رسالتك هنا...',
  addPhoto: 'إضافة صورة',
  sendAnonymously: 'إرسال بشكل مجهول',
  sending: 'جارٍ الإرسال…',
  wantLink: 'هل تريد استقبال رسائل مجهولة أيضاً؟',
  getMyLink: 'احصل على رابطي',
  sendAnother: 'إرسال آخر',
  delivered: 'تم الإرسال!',
  deliveredTo: 'رسالتك المجهولة إلى',
  peopleReceiving: 'شخص يتلقى رسائل الآن',
  anonymousMessaging: 'أرسل أي شيء بشكل مجهول',
  requestTimeout: 'انتهت مهلة الطلب. تحقق من اتصالك وأعد المحاولة.',
  imageTooLarge: 'الصورة كبيرة جداً. جرب صورة أصغر.',
  serverError: 'خطأ في الخادم. يرجى المحاولة مرة أخرى.',
  failedToSend: 'فشل الإرسال. تحقق من اتصالك.',
  share: 'مشاركة',
  shareReply: 'مشاركة الرد',
  shareGifReply: 'مشاركة رد GIF',
  reply: 'رد',
  // SharePage
  shareMyLink: 'مشاركة رابطي',
  copied: 'تم النسخ!',
  copyMyLink: 'نسخ رابطي',
  theMoreYouShare: 'كلما شاركت أكثر، تلقيت رسائل أكثر من أصدقائك',
  shareFormat: 'تنسيق المشاركة',
  chooseHowToShare: 'اختر كيفية مشاركة بطاقتك',
  image: 'صورة',
  staticPng: 'PNG ثابت',
  gif: 'GIF',
  animated: 'متحرك 4 ثواني',
  cardColor: 'لون البطاقة',
  png: 'PNG',
  imageReady: 'الصورة جاهزة!',
  gifReady: 'GIF جاهز!',
  tapToShare: 'اضغط بالأسفل — ثم اختر تطبيقك من قائمة المشاركة',
  shareImageAndLink: 'مشاركة الصورة + الرابط',
  cancel: 'إلغاء',
  editYourMessage: 'عدل رسالتك',
  showsOnYourShareCard: 'يظهر هذا على بطاقة المشاركة الخاصة بك',
  save: 'حفظ',
  chooseYourGame: 'اختر لعبتك',
  eachGameChanges: 'كل لعبة تغير ما يظهر على بطاقة المشاركة الخاصة بك',
  change: 'تغيير',
  howToPostMyLink: 'كيف أنشر رابطي؟',
  // SettingsPage
  settings: 'الإعدادات',
  edit: 'تعديل',
  account: 'الحساب',
  editProfile: 'تعديل الملف الشخصي',
  changeUsernameAndPhoto: 'تغيير اسم المستخدم والصورة',
  resources: 'الموارد',
  howToShare: 'كيف المشاركة',
  learnHowToPost: 'تعلم كيف تنشر رابطك',
  followUsOnX: 'اتبعنا على X',
  deleteAccount: 'حذف الحساب',
  deleteAccountQ: 'حذف الحساب؟',
  deleteWarning: 'سيؤدي هذا إلى حذف ملفك الشخصي ورسائلك وجميع بياناتك بشكل دائم. لا يمكن التراجع عن هذا.',
  deleting: 'جارٍ الحذف…',
  yesDeleteEverything: 'نعم، احذف كل شيء',
  // ChatPage
  noConversationsYet: 'لا توجد محادثات بعد',
  openAMessage: 'افتح رسالة واضغط "ابدأ محادثة" للرد بشكل خاص',
  newConversation: 'محادثة جديدة',
  noMessagesYet: 'لا توجد رسائل بعد',
  noMessagesYetSayHello: 'لا توجد رسائل بعد. قل مرحباً!',
  renameConversation: 'إعادة تسمية المحادثة',
  enterAName: 'أدخل اسماً…',
  endToEndPrivate: 'محادثة خاصة من البداية إلى النهاية',
  messagePlaceholder: 'رسالة…',
  sent: 'تم الإرسال',
  read: 'تم القراءة',
  now: 'الآن',
  // MessagesPages
  noMessagesYetInbox: 'لا توجد رسائل بعد',
  shareLinkToReceive: 'شارك رابطك لتلقي بعضها!',
  newMessage: 'رسالة جديدة',
  photo: 'صورة',
  tapToRead: 'اضغط للقراءة',
  whoSentThis: 'من أرسل هذا؟',
  viewSenderInsights: 'عرض معلومات المرسل',
  startAConversation: 'ابدأ محادثة',
  replyPrivately: 'الرد بشكل خاص',
  back: 'رجوع',
  backToMessage: 'العودة إلى الرسالة',
  senderInsights: 'معلومات المرسل',
  approximateInfo: 'معلومات تقريبية بناءً على بيانات الشبكة',
  location: 'الموقع',
  unknown: 'غير معروف',
  ipAddress: 'عنوان IP',
  notAvailable: 'غير متاح',
  device: 'الجهاز',
  messagesFromThisSender: 'رسائل من هذا المرسل',
  locationMapNotAvailable: 'خريطة الموقع غير متاحة',
  anonymousSender: 'مرسل مجهول',
  privateConversation: 'محادثة خاصة',
  startConversation: 'ابدأ محادثة',
  typeReply: 'اكتب ردك…',
  text: 'نص',
  pickAGif: '🎬 اختار GIF',
  changeGif: 'تغيير GIF',
}

const tr: T = {
  beforeSend: 'Göndermeden önce',
  prohibited: "Bunlar TBH'de kesinlikle yasaktır",
  harassment: 'Taciz ve zorbalık',
  harmful: 'Zararlı içerik',
  sexualContent: 'Çocukları içeren uygunsuz veya cinsel içerik',
  noSlurs: 'Hakaret yok, saygılı ol',
  agree: 'Kabul ediyorum, devam et →',
  violations: 'İhlaller kalıcı yasakla sonuçlanabilir',
  messageFor: 'Mesaj',
  writePlaceholder: 'Mesajını buraya yaz...',
  addPhoto: 'Fotoğraf ekle',
  sendAnonymously: 'Anonim olarak gönder',
  sending: 'Gönderiliyor…',
  wantLink: 'Sen de anonim mesaj almak ister misin?',
  getMyLink: 'Kendi linkimi al',
  sendAnother: 'Başka bir tane gönder',
  delivered: 'Gönderildi!',
  deliveredTo: 'Anonim mesajın',
  peopleReceiving: 'kişi şu anda mesaj alıyor',
  anonymousMessaging: 'her şeyi anonim olarak gönder',
  requestTimeout: 'İstek zaman aşımına uğradı. Bağlantını kontrol et ve tekrar dene.',
  imageTooLarge: 'Resim çok büyük. Daha küçük bir fotoğraf dene.',
  serverError: 'Sunucu hatası. Lütfen bir dakika sonra tekrar dene.',
  failedToSend: 'Gönderilemedi. Bağlantını kontrol et.',
  share: 'Paylaş',
  shareReply: 'Yanıtı Paylaş',
  shareGifReply: 'GIF Yanıtı Paylaş',
  reply: 'Yanıtla',
  // SharePage
  shareMyLink: 'Linkimi paylaş',
  copied: 'Kopyalandı!',
  copyMyLink: 'Linkimi kopyala',
  theMoreYouShare: 'Ne kadar çok paylaşırsan, arkadaşlarından o kadar çok mesaj alırsın',
  shareFormat: 'Paylaşım formatı',
  chooseHowToShare: 'Kartını nasıl paylaşmak istediğini seç',
  image: 'Resim',
  staticPng: 'Statik PNG',
  gif: 'GIF',
  animated: '4s animasyonlu',
  cardColor: 'Kart rengi',
  png: 'PNG',
  imageReady: 'Resim hazır!',
  gifReady: 'GIF hazır!',
  tapToShare: 'Aşağıya dokun — sonra paylaşım menüsünden uygulamanı seç',
  shareImageAndLink: 'Resim + link paylaş',
  cancel: 'İptal',
  editYourMessage: 'Mesajını düzenle',
  showsOnYourShareCard: 'Bu paylaşım kartında görünecek',
  save: 'Kaydet',
  chooseYourGame: 'Oyununu seç',
  eachGameChanges: 'Her oyun paylaşım kartında görünen şeyi değiştirir',
  change: 'Değiştir',
  howToPostMyLink: 'Linkimi nasıl paylaşırım?',
  // SettingsPage
  settings: 'Ayarlar',
  edit: 'Düzenle',
  account: 'Hesap',
  editProfile: 'Profili düzenle',
  changeUsernameAndPhoto: 'Kullanıcı adını ve fotoğrafını değiştir',
  resources: 'Kaynaklar',
  howToShare: 'Nasıl paylaşılır',
  learnHowToPost: 'Linkini nasıl paylaşacağını öğren',
  followUsOnX: 'X üzerinde bizi takip edin',
  deleteAccount: 'Hesabı sil',
  deleteAccountQ: 'Hesabı sil?',
  deleteWarning: 'Bu, profilinizi, mesajlarınızı ve tüm verilerinizi kalıcı olarak silecektir. Geri alınamaz.',
  deleting: 'Siliniyor…',
  yesDeleteEverything: 'Evet, her şeyi sil',
  // ChatPage
  noConversationsYet: 'Henüz sohbet yok',
  openAMessage: 'Bir mesaj aç ve özel olarak yanıtlamak için "Sohbet başlat"a dokun',
  newConversation: 'Yeni sohbet',
  noMessagesYet: 'Henüz mesaj yok',
  noMessagesYetSayHello: 'Henüz mesaj yok. Merhaba de!',
  renameConversation: 'Sohbeti yeniden adlandır',
  enterAName: 'Bir isim girin…',
  endToEndPrivate: 'Uçtan uca özel sohbet',
  messagePlaceholder: 'Mesaj…',
  sent: 'Gönderildi',
  read: 'Okundu',
  now: 'şimdi',
  // MessagesPages
  noMessagesYetInbox: 'Henüz mesaj yok',
  shareLinkToReceive: 'Bazılarını almak için linkini paylaş!',
  newMessage: 'Yeni mesaj',
  photo: 'Fotoğraf',
  tapToRead: 'Okumak için dokun',
  whoSentThis: 'Bunu kim gönderdi?',
  viewSenderInsights: 'Gönderen bilgilerini gör',
  startAConversation: 'Bir sohbet başlat',
  replyPrivately: 'Özel olarak yanıtla',
  back: 'Geri',
  backToMessage: 'Mesaja geri dön',
  senderInsights: 'Gönderen bilgileri',
  approximateInfo: 'Ağ verilerine dayalı yaklaşık bilgiler',
  location: 'Konum',
  unknown: 'Bilinmiyor',
  ipAddress: 'IP adresi',
  notAvailable: 'Mevcut değil',
  device: 'Cihaz',
  messagesFromThisSender: 'Bu gönderenden gelen mesajlar',
  locationMapNotAvailable: 'Konum haritası mevcut değil',
  anonymousSender: 'Anonim gönderen',
  privateConversation: 'Özel sohbet',
  startConversation: 'Bir sohbet başlat',
  typeReply: 'Yanıtını yaz…',
  text: 'Metin',
  pickAGif: '🎬 Bir GIF seç',
  changeGif: 'GIF\'i değiştir',
}

const nl: T = {
  beforeSend: 'Voordat je stuurt',
  prohibited: 'Dit is strikt verboden op TBH',
  harassment: 'Pesterijen & intimidatie',
  harmful: 'Schadelijke inhoud',
  sexualContent: 'Ongepaste of seksuele inhoud met minderjarigen',
  noSlurs: 'Geen scheldwoorden, blijf respectvol',
  agree: 'Ik ga akkoord, doorgaan →',
  violations: 'Overtredingen kunnen leiden tot een permanente ban',
  messageFor: 'Bericht voor',
  writePlaceholder: 'Schrijf je bericht hier...',
  addPhoto: 'Foto toevoegen',
  sendAnonymously: 'Anoniem verzenden',
  sending: 'Verzenden…',
  wantLink: 'Wil jij ook anonieme berichten ontvangen?',
  getMyLink: 'Mijn eigen link',
  sendAnother: 'Nog een sturen',
  delivered: 'Verzonden!',
  deliveredTo: 'Jouw anonieme bericht aan',
  peopleReceiving: 'mensen ontvangen nu berichten',
  anonymousMessaging: 'stuur alles anoniem',
  requestTimeout: 'Time-out. Controleer je verbinding en probeer opnieuw.',
  imageTooLarge: 'Afbeelding te groot. Probeer een kleinere foto.',
  serverError: 'Serverfout. Probeer het over een moment opnieuw.',
  failedToSend: 'Verzenden mislukt. Controleer je verbinding.',
  share: 'Delen',
  shareReply: 'Reactie delen',
  shareGifReply: 'GIF-reactie delen',
  reply: 'Reageren',
  // SharePage
  shareMyLink: 'Mijn link delen',
  copied: 'Gekopieerd!',
  copyMyLink: 'Mijn link kopiëren',
  theMoreYouShare: 'Hoe meer je deelt, hoe meer berichten je krijgt van je vrienden',
  shareFormat: 'Deelformaat',
  chooseHowToShare: 'Kies hoe je je kaart wilt delen',
  image: 'Afbeelding',
  staticPng: 'Statische PNG',
  gif: 'GIF',
  animated: '4s geanimeerd',
  cardColor: 'Kaartkleur',
  png: 'PNG',
  imageReady: 'Afbeelding klaar!',
  gifReady: 'GIF klaar!',
  tapToShare: 'Tik hieronder — kies dan je app uit het deelmenu',
  shareImageAndLink: 'Afbeelding + link delen',
  cancel: 'Annuleren',
  editYourMessage: 'Je bericht bewerken',
  showsOnYourShareCard: 'Dit verschijnt op je deelkaart',
  save: 'Opslaan',
  chooseYourGame: 'Kies je spel',
  eachGameChanges: 'Elk spel verandert wat er op je deelkaart staat',
  change: 'Wijzigen',
  howToPostMyLink: 'Hoe plaats ik mijn link?',
  // SettingsPage
  settings: 'Instellingen',
  edit: 'Bewerken',
  account: 'Account',
  editProfile: 'Profiel bewerken',
  changeUsernameAndPhoto: 'Je gebruikersnaam en foto wijzigen',
  resources: 'Bronnen',
  howToShare: 'Hoe te delen',
  learnHowToPost: 'Leer hoe je je link kunt plaatsen',
  followUsOnX: 'Volg ons op X',
  deleteAccount: 'Account verwijderen',
  deleteAccountQ: 'Account verwijderen?',
  deleteWarning: 'Hiermee verwijder je permanent je profiel, berichten en al je gegevens. Dit kan niet ongedaan worden gemaakt.',
  deleting: 'Verwijderen…',
  yesDeleteEverything: 'Ja, alles verwijderen',
  // ChatPage
  noConversationsYet: 'Nog geen gesprekken',
  openAMessage: 'Open een bericht en tik op "Gesprek starten" om privé te antwoorden',
  newConversation: 'Nieuw gesprek',
  noMessagesYet: 'Nog geen berichten',
  noMessagesYetSayHello: 'Nog geen berichten. Zeg hallo!',
  renameConversation: 'Gesprek hernoemen',
  enterAName: 'Voer een naam in…',
  endToEndPrivate: 'End-to-end privé gesprek',
  messagePlaceholder: 'Bericht…',
  sent: 'Verzonden',
  read: 'Gelezen',
  now: 'nu',
  // MessagesPages
  noMessagesYetInbox: 'Nog geen berichten',
  shareLinkToReceive: 'Deel je link om er een paar te ontvangen!',
  newMessage: 'Nieuw bericht',
  photo: 'Foto',
  tapToRead: 'Tik om te lezen',
  whoSentThis: 'Wie heeft dit gestuurd?',
  viewSenderInsights: 'Verstuurdergegevens bekijken',
  startAConversation: 'Een gesprek starten',
  replyPrivately: 'Privé antwoorden',
  back: 'Terug',
  backToMessage: 'Terug naar bericht',
  senderInsights: 'Verstuurdergegevens',
  approximateInfo: 'Benaderende gegevens op basis van netwerkgegevens',
  location: 'Locatie',
  unknown: 'Onbekend',
  ipAddress: 'IP-adres',
  notAvailable: 'Niet beschikbaar',
  device: 'Apparaat',
  messagesFromThisSender: 'Berichten van deze verstuurder',
  locationMapNotAvailable: 'Locatiemap niet beschikbaar',
  anonymousSender: 'Anonieme verstuurder',
  privateConversation: 'Privé gesprek',
  startConversation: 'Een gesprek starten',
  typeReply: 'Schrijf je antwoord…',
  text: 'Tekst',
  pickAGif: '🎬 Een GIF kiezen',
  changeGif: 'GIF wijzigen',
}

const ru: T = {
  beforeSend: 'Перед отправкой',
  prohibited: 'На TBH это строго запрещено',
  harassment: 'Преследование и травля',
  harmful: 'Вредный контент',
  sexualContent: 'Неприемлемый или сексуальный контент с участием несовершеннолетних',
  noSlurs: 'Никаких оскорблений, будь уважительным',
  agree: 'Я согласен, продолжить →',
  violations: 'Нарушения могут привести к постоянной блокировке',
  messageFor: 'Сообщение для',
  writePlaceholder: 'Напиши своё сообщение здесь...',
  addPhoto: 'Добавить фото',
  sendAnonymously: 'Отправить анонимно',
  sending: 'Отправка…',
  wantLink: 'Хочешь тоже получать анонимные сообщения?',
  getMyLink: 'Получить свою ссылку',
  sendAnother: 'Отправить ещё',
  delivered: 'Отправлено!',
  deliveredTo: 'Твоё анонимное сообщение для',
  peopleReceiving: 'человек получают сообщения прямо сейчас',
  anonymousMessaging: 'отправляй что угодно анонимно',
  requestTimeout: 'Время ожидания истекло. Проверь соединение и повтори.',
  imageTooLarge: 'Изображение слишком большое. Попробуй меньшую фотографию.',
  serverError: 'Ошибка сервера. Пожалуйста, повтори попытку через момент.',
  failedToSend: 'Не удалось отправить. Проверь соединение.',
  share: 'Поделиться',
  shareReply: 'Поделиться ответом',
  shareGifReply: 'Поделиться GIF-ответом',
  reply: 'Ответить',
  // SharePage
  shareMyLink: 'Поделиться моей ссылкой',
  copied: 'Скопировано!',
  copyMyLink: 'Копировать мою ссылку',
  theMoreYouShare: 'Чем больше ты делишься, тем больше сообщений ты получаешь от друзей',
  shareFormat: 'Формат отправки',
  chooseHowToShare: 'Выбери, как поделиться своей карточкой',
  image: 'Изображение',
  staticPng: 'Статичный PNG',
  gif: 'GIF',
  animated: 'Анимация 4с',
  cardColor: 'Цвет карточки',
  png: 'PNG',
  imageReady: 'Изображение готово!',
  gifReady: 'GIF готов!',
  tapToShare: 'Нажми ниже — затем выбери приложение в меню отправки',
  shareImageAndLink: 'Поделиться изображением + ссылкой',
  cancel: 'Отмена',
  editYourMessage: 'Редактировать твое сообщение',
  showsOnYourShareCard: 'Это появится на твоей карточке отправки',
  save: 'Сохранить',
  chooseYourGame: 'Выбери свою игру',
  eachGameChanges: 'Каждая игра меняет то, что появляется на твоей карточке отправки',
  change: 'Изменить',
  howToPostMyLink: 'Как опубликовать мою ссылку?',
  // SettingsPage
  settings: 'Настройки',
  edit: 'Редактировать',
  account: 'Аккаунт',
  editProfile: 'Редактировать профиль',
  changeUsernameAndPhoto: 'Изменить имя пользователя и фото',
  resources: 'Ресурсы',
  howToShare: 'Как поделиться',
  learnHowToPost: 'Узнай, как опубликовать свою ссылку',
  followUsOnX: 'Подпишись на нас в X',
  deleteAccount: 'Удалить аккаунт',
  deleteAccountQ: 'Удалить аккаунт?',
  deleteWarning: 'Это навсегда удалит твой профиль, сообщения и все твои данные. Это нельзя отменить.',
  deleting: 'Удаление…',
  yesDeleteEverything: 'Да, удалить всё',
  // ChatPage
  noConversationsYet: 'Пока нет разговоров',
  openAMessage: 'Открой сообщение и нажми "Начать разговор", чтобы ответить в приватном чате',
  newConversation: 'Новый разговор',
  noMessagesYet: 'Пока нет сообщений',
  noMessagesYetSayHello: 'Пока нет сообщений. Скажи привет!',
  renameConversation: 'Переименовать разговор',
  enterAName: 'Введите имя…',
  endToEndPrivate: 'Полностью приватный разговор',
  messagePlaceholder: 'Сообщение…',
  sent: 'Отправлено',
  read: 'Прочитано',
  now: 'сейчас',
  // MessagesPages
  noMessagesYetInbox: 'Пока нет сообщений',
  shareLinkToReceive: 'Поделись своей ссылкой, чтобы получить некоторые!',
  newMessage: 'Новое сообщение',
  photo: 'Фото',
  tapToRead: 'Нажми для чтения',
  whoSentThis: 'Кто это отправил?',
  viewSenderInsights: 'Посмотреть информацию об отправителе',
  startAConversation: 'Начать разговор',
  replyPrivately: 'Ответить в приватном чате',
  back: 'Назад',
  backToMessage: 'Назад к сообщению',
  senderInsights: 'Информация об отправителе',
  approximateInfo: 'Приблизительные данные на основе сетевой информации',
  location: 'Местоположение',
  unknown: 'Неизвестно',
  ipAddress: 'IP-адрес',
  notAvailable: 'Недоступно',
  device: 'Устройство',
  messagesFromThisSender: 'Сообщения от этого отправителя',
  locationMapNotAvailable: 'Карта местоположения недоступна',
  anonymousSender: 'Анонимный отправитель',
  privateConversation: 'Приватный разговор',
  startConversation: 'Начать разговор',
  typeReply: 'Напиши свой ответ…',
  text: 'Текст',
  pickAGif: '🎬 Выбрать GIF',
  changeGif: 'Изменить GIF',
}

const ja: T = {
  beforeSend: '送信する前に',
  prohibited: 'これらはTBHで厳しく禁止されています',
  harassment: 'ハラスメントといじめ',
  harmful: '有害なコンテンツ',
  sexualContent: '子どもを含む不適切または性的なコンテンツ',
  noSlurs: '罵り言葉は使わず、敬意を持って接しましょう',
  agree: '同意して続ける →',
  violations: '違反すると永久に追放される場合があります',
  messageFor: 'へのメッセージ',
  writePlaceholder: 'ここにメッセージを書いてください...',
  addPhoto: '写真を追加',
  sendAnonymously: '匿名で送信',
  sending: '送信中…',
  wantLink: 'あなたも匿名メッセージを受け取りたいですか？',
  getMyLink: '自分のリンクを取得',
  sendAnother: 'もう一度送信',
  delivered: '送信完了！',
  deliveredTo: 'へのあなたの匿名メッセージ',
  peopleReceiving: '人が今メッセージを受け取っています',
  anonymousMessaging: 'なんでも匿名で送信',
  requestTimeout: 'リクエストがタイムアウトしました。接続を確認して再試行してください。',
  imageTooLarge: '画像が大きすぎます。小さい写真を試してください。',
  serverError: 'サーバーエラーです。少し時間をおいて再試行してください。',
  failedToSend: '送信に失敗しました。接続を確認してください。',
  share: 'シェア',
  shareReply: '返信をシェア',
  shareGifReply: 'GIF返信をシェア',
  reply: '返信',
  // SharePage
  shareMyLink: '自分のリンクをシェア',
  copied: 'コピーしました！',
  copyMyLink: '自分のリンクをコピー',
  theMoreYouShare: 'シェアすればするほど、友達からのメッセージが増えます',
  shareFormat: 'シェア形式',
  chooseHowToShare: 'カードをシェアする方法を選んでください',
  image: '画像',
  staticPng: '静的PNG',
  gif: 'GIF',
  animated: '4秒アニメーション',
  cardColor: 'カードカラー',
  png: 'PNG',
  imageReady: '画像の準備ができました！',
  gifReady: 'GIFの準備ができました！',
  tapToShare: '下をタップ — 次にシェアメニューからアプリを選んでください',
  shareImageAndLink: '画像 + リンクをシェア',
  cancel: 'キャンセル',
  editYourMessage: 'メッセージを編集',
  showsOnYourShareCard: 'これはシェアカードに表示されます',
  save: '保存',
  chooseYourGame: 'ゲームを選ぶ',
  eachGameChanges: 'ゲームごとにシェアカードの表示が変わります',
  change: '変更',
  howToPostMyLink: '自分のリンクを投稿するには？',
  // SettingsPage
  settings: '設定',
  edit: '編集',
  account: 'アカウント',
  editProfile: 'プロフィールを編集',
  changeUsernameAndPhoto: 'ユーザー名と写真を変更',
  resources: 'リソース',
  howToShare: 'シェア方法',
  learnHowToPost: 'リンクを投稿する方法を学ぶ',
  followUsOnX: 'Xでフォローしてね',
  deleteAccount: 'アカウントを削除',
  deleteAccountQ: 'アカウントを削除しますか？',
  deleteWarning: 'これにより、プロフィール、メッセージ、すべてのデータが永久に削除されます。元に戻すことはできません。',
  deleting: '削除中…',
  yesDeleteEverything: 'はい、すべて削除',
  // ChatPage
  noConversationsYet: 'まだ会話がありません',
  openAMessage: 'メッセージを開いて「会話を始める」をタップすると、プライベートで返信できます',
  newConversation: '新しい会話',
  noMessagesYet: 'まだメッセージがありません',
  noMessagesYetSayHello: 'まだメッセージがありません。こんにちは！',
  renameConversation: '会話の名前を変更',
  enterAName: '名前を入力…',
  endToEndPrivate: 'エンドツーエンドのプライベート会話',
  messagePlaceholder: 'メッセージ…',
  sent: '送信済み',
  read: '既読',
  now: '今',
  // MessagesPages
  noMessagesYetInbox: 'まだメッセージがありません',
  shareLinkToReceive: 'リンクをシェアしてメッセージを受け取りましょう！',
  newMessage: '新しいメッセージ',
  photo: '写真',
  tapToRead: '読むにはタップ',
  whoSentThis: 'これを誰が送りましたか？',
  viewSenderInsights: '送信者の情報を見る',
  startAConversation: '会話を始める',
  replyPrivately: 'プライベートで返信',
  back: '戻る',
  backToMessage: 'メッセージに戻る',
  senderInsights: '送信者の情報',
  approximateInfo: 'ネットワークデータに基づくおおよその情報',
  location: '場所',
  unknown: '不明',
  ipAddress: 'IPアドレス',
  notAvailable: '利用不可',
  device: 'デバイス',
  messagesFromThisSender: 'この送信者からのメッセージ',
  locationMapNotAvailable: '位置情報マップは利用できません',
  anonymousSender: '匿名の送信者',
  privateConversation: 'プライベート会話',
  startConversation: '会話を始める',
  typeReply: '返信を書いてください…',
  text: 'テキスト',
  pickAGif: '🎬 GIFを選ぶ',
  changeGif: 'GIFを変更',
}

const zh: T = {
  beforeSend: '发送前',
  prohibited: '这些内容在TBH上是严格禁止的',
  harassment: '骚扰和欺凌',
  harmful: '有害内容',
  sexualContent: '涉及儿童的不当或性内容',
  noSlurs: '不要使用侮辱性语言，请保持尊重',
  agree: '我同意，继续 →',
  violations: '违规可能导致永久封禁',
  messageFor: '给的消息',
  writePlaceholder: '在这里写你的消息...',
  addPhoto: '添加照片',
  sendAnonymously: '匿名发送',
  sending: '发送中…',
  wantLink: '你也想接收匿名消息吗？',
  getMyLink: '获取我的链接',
  sendAnother: '再发送一次',
  delivered: '已发送！',
  deliveredTo: '你给的匿名消息',
  peopleReceiving: '人正在接收消息',
  anonymousMessaging: '匿名发送任何内容',
  requestTimeout: '请求超时。请检查你的连接并重试。',
  imageTooLarge: '图片太大。请尝试较小的照片。',
  serverError: '服务器错误。请稍后重试。',
  failedToSend: '发送失败。请检查你的连接。',
  share: '分享',
  shareReply: '分享回复',
  shareGifReply: '分享GIF回复',
  reply: '回复',
  // SharePage
  shareMyLink: '分享我的链接',
  copied: '已复制！',
  copyMyLink: '复制我的链接',
  theMoreYouShare: '分享越多，从朋友那里收到的消息就越多',
  shareFormat: '分享格式',
  chooseHowToShare: '选择如何分享你的卡片',
  image: '图片',
  staticPng: '静态PNG',
  gif: 'GIF',
  animated: '4秒动画',
  cardColor: '卡片颜色',
  png: 'PNG',
  imageReady: '图片已准备好！',
  gifReady: 'GIF已准备好！',
  tapToShare: '点击下方 — 然后从分享菜单中选择你的应用',
  shareImageAndLink: '分享图片 + 链接',
  cancel: '取消',
  editYourMessage: '编辑你的消息',
  showsOnYourShareCard: '这会显示在你的分享卡片上',
  save: '保存',
  chooseYourGame: '选择你的游戏',
  eachGameChanges: '每个游戏都会改变分享卡片上的内容',
  change: '更改',
  howToPostMyLink: '如何发布我的链接？',
  // SettingsPage
  settings: '设置',
  edit: '编辑',
  account: '账户',
  editProfile: '编辑个人资料',
  changeUsernameAndPhoto: '更改你的用户名和照片',
  resources: '资源',
  howToShare: '如何分享',
  learnHowToPost: '了解如何发布你的链接',
  followUsOnX: '在X上关注我们',
  deleteAccount: '删除账户',
  deleteAccountQ: '删除账户？',
  deleteWarning: '这将永久删除你的个人资料、消息和所有数据。这无法撤销。',
  deleting: '删除中…',
  yesDeleteEverything: '是的，删除所有内容',
  // ChatPage
  noConversationsYet: '还没有对话',
  openAMessage: '打开消息并点击“开始对话”以私密回复',
  newConversation: '新对话',
  noMessagesYet: '还没有消息',
  noMessagesYetSayHello: '还没有消息。打个招呼吧！',
  renameConversation: '重命名对话',
  enterAName: '输入名字…',
  endToEndPrivate: '端到端私密对话',
  messagePlaceholder: '消息…',
  sent: '已发送',
  read: '已读',
  now: '现在',
  // MessagesPages
  noMessagesYetInbox: '还没有消息',
  shareLinkToReceive: '分享你的链接来接收一些！',
  newMessage: '新消息',
  photo: '照片',
  tapToRead: '点击阅读',
  whoSentThis: '这是谁发的？',
  viewSenderInsights: '查看发件人信息',
  startAConversation: '开始对话',
  replyPrivately: '私密回复',
  back: '返回',
  backToMessage: '返回消息',
  senderInsights: '发件人信息',
  approximateInfo: '基于网络数据的大致信息',
  location: '位置',
  unknown: '未知',
  ipAddress: 'IP地址',
  notAvailable: '不可用',
  device: '设备',
  messagesFromThisSender: '来自此发件人的消息',
  locationMapNotAvailable: '位置地图不可用',
  anonymousSender: '匿名发件人',
  privateConversation: '私密对话',
  startConversation: '开始对话',
  typeReply: '写你的回复…',
  text: '文本',
  pickAGif: '🎬 选择GIF',
  changeGif: '更改GIF',
}

const ko: T = {
  beforeSend: '보내기 전에',
  prohibited: 'TBH에서 이러한 내용은 엄격히 금지됩니다',
  harassment: '괴롭힘과 따돌림',
  harmful: '유해한 콘텐츠',
  sexualContent: '아동을 포함하는 부적절하거나 성적인 콘텐츠',
  noSlurs: '욕설은 사용하지 말고 존중해 주세요',
  agree: '동의하고 계속하기 →',
  violations: '위반 시 영구적으로 차단될 수 있습니다',
  messageFor: '에게 보내는 메시지',
  writePlaceholder: '여기에 메시지를 적어주세요...',
  addPhoto: '사진 추가',
  sendAnonymously: '익명으로 보내기',
  sending: '보내는 중…',
  wantLink: '당신도 익명 메시지를 받고 싶나요?',
  getMyLink: '내 링크 받기',
  sendAnother: '다시 보내기',
  delivered: '전송 완료!',
  deliveredTo: '에게 보내는 당신의 익명 메시지',
  peopleReceiving: '명이 지금 메시지를 받고 있습니다',
  anonymousMessaging: '무엇이든 익명으로 보내세요',
  requestTimeout: '요청 시간이 초과되었습니다. 연결을 확인하고 다시 시도해 주세요.',
  imageTooLarge: '이미지가 너무 큽니다. 더 작은 사진을 시도해 주세요.',
  serverError: '서버 오류입니다. 잠시 후 다시 시도해 주세요.',
  failedToSend: '전송에 실패했습니다. 연결을 확인해 주세요.',
  share: '공유',
  shareReply: '답변 공유',
  shareGifReply: 'GIF 답변 공유',
  reply: '답변',
  // SharePage
  shareMyLink: '내 링크 공유',
  copied: '복사됨!',
  copyMyLink: '내 링크 복사',
  theMoreYouShare: '더 많이 공유할수록 친구들로부터 더 많은 메시지를 받습니다',
  shareFormat: '공유 형식',
  chooseHowToShare: '카드를 공유할 방법을 선택하세요',
  image: '이미지',
  staticPng: '정적 PNG',
  gif: 'GIF',
  animated: '4초 애니메이션',
  cardColor: '카드 색상',
  png: 'PNG',
  imageReady: '이미지 준비 완료!',
  gifReady: 'GIF 준비 완료!',
  tapToShare: '아래를 탭 — 그 다음 공유 메뉴에서 앱을 선택하세요',
  shareImageAndLink: '이미지 + 링크 공유',
  cancel: '취소',
  editYourMessage: '메시지 수정',
  showsOnYourShareCard: '이것은 공유 카드에 표시됩니다',
  save: '저장',
  chooseYourGame: '게임 선택',
  eachGameChanges: '각 게임은 공유 카드에 표시되는 내용을 변경합니다',
  change: '변경',
  howToPostMyLink: '내 링크를 게시하는 방법은?',
  // SettingsPage
  settings: '설정',
  edit: '편집',
  account: '계정',
  editProfile: '프로필 편집',
  changeUsernameAndPhoto: '사용자 이름과 사진 변경',
  resources: '리소스',
  howToShare: '공유 방법',
  learnHowToPost: '링크를 게시하는 방법 배우기',
  followUsOnX: 'X에서 팔로우하세요',
  deleteAccount: '계정 삭제',
  deleteAccountQ: '계정을 삭제하시겠습니까?',
  deleteWarning: '이것은 프로필, 메시지 및 모든 데이터를 영구적으로 삭제합니다. 취소할 수 없습니다.',
  deleting: '삭제 중…',
  yesDeleteEverything: '예, 모두 삭제',
  // ChatPage
  noConversationsYet: '아직 대화가 없습니다',
  openAMessage: '메시지를 열고 "대화 시작"을 탭하여 비공개로 답변하세요',
  newConversation: '새 대화',
  noMessagesYet: '아직 메시지가 없습니다',
  noMessagesYetSayHello: '아직 메시지가 없습니다. 인사하세요!',
  renameConversation: '대화 이름 변경',
  enterAName: '이름 입력…',
  endToEndPrivate: '종단간 비공개 대화',
  messagePlaceholder: '메시지…',
  sent: '보냄',
  read: '읽음',
  now: '지금',
  // MessagesPages
  noMessagesYetInbox: '아직 메시지가 없습니다',
  shareLinkToReceive: '링크를 공유하여 메시지를 받아보세요!',
  newMessage: '새 메시지',
  photo: '사진',
  tapToRead: '읽으려면 탭',
  whoSentThis: '이것을 누가 보냈나요?',
  viewSenderInsights: '보낸 사람 정보 보기',
  startAConversation: '대화 시작',
  replyPrivately: '비공개로 답변',
  back: '뒤로',
  backToMessage: '메시지로 돌아가기',
  senderInsights: '보낸 사람 정보',
  approximateInfo: '네트워크 데이터 기반의 대략적인 정보',
  location: '위치',
  unknown: '알 수 없음',
  ipAddress: 'IP 주소',
  notAvailable: '사용 불가',
  device: '기기',
  messagesFromThisSender: '이 보낸 사람의 메시지',
  locationMapNotAvailable: '위치 지도를 사용할 수 없습니다',
  anonymousSender: '익명의 보낸 사람',
  privateConversation: '비공개 대화',
  startConversation: '대화 시작',
  typeReply: '답변을 적어주세요…',
  text: '텍스트',
  pickAGif: '🎬 GIF 선택',
  changeGif: 'GIF 변경',
}

export type SupportedLocale = 'en' | 'fr' | 'es'

/** ISO-3166-1 alpha-2 codes of French-speaking countries and territories (including Côte d'Ivoire) */
export const FRENCH_SPEAKING_COUNTRIES = new Set([
  'CI', // Côte d'Ivoire / Ivory Coast
  'FR', // France
  'SN', // Senegal
  'CM', // Cameroon
  'CD', // DR Congo
  'CG', // Republic of the Congo
  'ML', // Mali
  'GN', // Guinea
  'BF', // Burkina Faso
  'NE', // Niger
  'BJ', // Benin
  'TG', // Togo
  'GA', // Gabon
  'TD', // Chad
  'MG', // Madagascar
  'BE', // Belgium
  'CH', // Switzerland
  'CA', // Canada
  'LU', // Luxembourg
  'MC', // Monaco
  'HT', // Haiti
  'RW', // Rwanda
  'BI', // Burundi
  'DJ', // Djibouti
  'KM', // Comoros
  'CF', // Central African Republic
  'MR', // Mauritania
  'VU', // Vanuatu
  'SC', // Seychelles
  'GQ', // Equatorial Guinea
  'GP', // Guadeloupe
  'MQ', // Martinique
  'GF', // French Guiana
  'RE', // Réunion
  'YT', // Mayotte
  'NC', // New Caledonia
  'PF', // French Polynesia
])

export const FRENCH_SPEAKING_TIMEZONES = new Set([
  'africa/abidjan',
  'europe/paris',
  'europe/brussels',
  'europe/zurich',
  'europe/monaco',
  'europe/luxembourg',
  'africa/dakar',
  'africa/douala',
  'africa/kinshasa',
  'africa/brazzaville',
  'africa/bamako',
  'africa/conakry',
  'africa/ouagadougou',
  'africa/niamey',
  'africa/porto-novo',
  'africa/lome',
  'africa/libreville',
  'africa/ndjamena',
  'africa/bangui',
  'africa/nouakchott',
  'africa/kigali',
  'africa/bujumbura',
  'africa/djibouti',
  'indian/antananarivo',
  'indian/reunion',
  'indian/mayotte',
  'america/port-au-prince',
  'america/cayenne',
  'america/guadeloupe',
  'america/martinique',
  'pacific/noumea',
  'pacific/tahiti',
])

export function isFrenchSpeakingCountry(code?: string | null): boolean {
  if (!code) return false
  return FRENCH_SPEAKING_COUNTRIES.has(code.trim().toUpperCase())
}

export function isFrenchSpeakingTimezone(tz?: string | null): boolean {
  if (!tz) return false
  const lower = tz.trim().toLowerCase()
  if (FRENCH_SPEAKING_TIMEZONES.has(lower)) return true
  if (lower === 'africa/abidjan' || lower === 'europe/paris' || lower === 'america/montreal') return true
  return false
}

export function detectUserLocale(): SupportedLocale {
  if (typeof window === 'undefined') return 'en'

  // 1. Explicit user selection stored in localStorage
  const storedLocale = window.localStorage.getItem('tbh-locale')
  if (storedLocale === 'fr' || storedLocale === 'es' || storedLocale === 'en') {
    return storedLocale
  }

  // 2. Cached country from /api/geo
  const storedCountry = window.localStorage.getItem('tbh-country')
  if (storedCountry && isFrenchSpeakingCountry(storedCountry)) {
    return 'fr'
  }

  // 3. Instant client-side timezone check (e.g. Africa/Abidjan for Côte d'Ivoire)
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    if (isFrenchSpeakingTimezone(tz)) {
      return 'fr'
    }
  } catch {}

  // 4. Browser language preferences (navigator.languages / navigator.language)
  try {
    const langs = window.navigator.languages?.length ? window.navigator.languages : [window.navigator.language]
    for (const l of langs) {
      if (!l) continue
      const lower = l.toLowerCase().replace('_', '-')
      if (lower.startsWith('fr')) return 'fr'
      if (lower.startsWith('es')) return 'es'
      const parts = lower.split('-')
      if (parts[1] && isFrenchSpeakingCountry(parts[1])) return 'fr'
    }
  } catch {}

  return 'en'
}

let geoInitPromise: Promise<void> | null = null

export function initGeoLocale(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve()
  if (geoInitPromise) return geoInitPromise

  geoInitPromise = (async () => {
    try {
      const userManual = window.localStorage.getItem('tbh-locale-manual')
      if (userManual) return

      const res = await fetch('/api/geo').catch(() => null)
      if (!res || !res.ok) return
      const data = await res.json().catch(() => null)
      const country = data?.country
      if (!country || typeof country !== 'string') return

      window.localStorage.setItem('tbh-country', country.toUpperCase())

      if (isFrenchSpeakingCountry(country)) {
        const current = window.localStorage.getItem('tbh-locale')
        if (current !== 'fr') {
          window.localStorage.setItem('tbh-locale', 'fr')
          window.dispatchEvent(new CustomEvent('tbh-locale-changed', { detail: 'fr' }))
        }
      }
    } catch {}
  })()

  return geoInitPromise
}

export function normalizeLocale(value?: string | null): SupportedLocale {
  if (!value) return detectUserLocale()
  const raw = value.toLowerCase().replace('_', '-')

  if (raw.startsWith('fr')) return 'fr'
  if (raw.startsWith('es')) return 'es'

  const parts = raw.split('-')
  if (parts[1] && isFrenchSpeakingCountry(parts[1])) return 'fr'
  if (isFrenchSpeakingCountry(raw)) return 'fr'

  return 'en'
}

export function getStoredLocale(): SupportedLocale {
  if (typeof window === 'undefined') return 'en'
  const stored = window.localStorage.getItem('tbh-locale')
  if (stored === 'fr' || stored === 'es' || stored === 'en') return stored
  return detectUserLocale()
}

export function setStoredLocale(locale: SupportedLocale) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem('tbh-locale', locale)
  window.localStorage.setItem('tbh-locale-manual', 'true')
  window.dispatchEvent(new CustomEvent('tbh-locale-changed', { detail: locale }))
}

export function getT(locale?: string | null): T {
  const target = normalizeLocale(locale ?? getStoredLocale())
  if (target === 'fr') return fr
  if (target === 'es') return es
  return en
}

export function useTranslation() {
  const [locale, setLocaleState] = useState<SupportedLocale>(() => getStoredLocale())

  useEffect(() => {
    initGeoLocale()

    const onLocaleChange = (e: any) => {
      const next = (e?.detail as SupportedLocale) || getStoredLocale()
      setLocaleState(next)
    }
    window.addEventListener('tbh-locale-changed', onLocaleChange)
    return () => window.removeEventListener('tbh-locale-changed', onLocaleChange)
  }, [])

  const setLocale = useCallback((newLocale: SupportedLocale) => {
    setStoredLocale(newLocale)
    setLocaleState(newLocale)
  }, [])

  const t = getT(locale)

  return { t, locale, setLocale }
}
