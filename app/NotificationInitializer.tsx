'use client';

import { useEffect } from 'react';
import { supabaseClient } from '@/lib/supabaseClient';

declare global {
  interface Window {
    OneSignalDeferred?: any[];
    OneSignal?: any;
  }
}

export default function NotificationInitializer() {
  useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined') return;

    // Track if we've already initialized
    let initialized = false;

    const loadOneSignalScript = async (): Promise<boolean> => {
      return new Promise((resolve) => {
        // Check if already loaded
        if (window.OneSignalDeferred) {
          console.log('🟢 OneSignalDeferred already exists');
          resolve(true);
          return;
        }

        // Check if script already exists in DOM
        const existingScript = document.querySelector(
          'script[src*="OneSignalSDK.page.js"]'
        );
        if (existingScript) {
          console.log('🟢 OneSignal script already in DOM, waiting for load...');
          // If script exists but hasn't loaded yet, wait for it
          const checkInterval = setInterval(() => {
            if (window.OneSignalDeferred) {
              clearInterval(checkInterval);
              resolve(true);
            }
          }, 200);

          // Timeout after 5 seconds
          setTimeout(() => {
            clearInterval(checkInterval);
            // Try to reload if it didn't load
            if (!window.OneSignalDeferred) {
              console.log('⚠️ Script exists but not loaded, recreating...');
              existingScript.remove();
              loadScriptDirectly().then(resolve);
            }
          }, 5000);
          return;
        }

        // Script not found, load it directly
        loadScriptDirectly().then(resolve);
      });
    };

    const loadScriptDirectly = (): Promise<boolean> => {
      return new Promise((resolve) => {
        console.log('📥 Loading OneSignal script directly...');
        const script = document.createElement('script');
        script.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js';
        script.defer = true;
        script.async = true;

        script.onload = () => {
          console.log('✅ OneSignal script loaded successfully');

          // Wait for OneSignalDeferred to be available
          const checkInterval = setInterval(() => {
            if (window.OneSignalDeferred) {
              clearInterval(checkInterval);
              resolve(true);
            }
          }, 100);

          // Timeout after 5 seconds
          setTimeout(() => {
            clearInterval(checkInterval);
            if (!window.OneSignalDeferred) {
              console.error('❌ OneSignalDeferred not created after script load');
              resolve(false);
            }
          }, 5000);
        };

        script.onerror = () => {
          console.error('❌ Failed to load OneSignal script');
          resolve(false);
        };

        document.head.appendChild(script);
      });
    };

    // Main initialization function
    const initializeOneSignal = async () => {
      if (initialized) return;
      initialized = true;

      try {
        console.log('🔵 NotificationInitializer: Starting...');

        // Load the script
        const loaded = await loadOneSignalScript();
        if (!loaded || !window.OneSignalDeferred) {
          console.error('❌ Failed to load OneSignal script');
          return;
        }

        console.log('🟢 OneSignal script ready, initializing...');

        // Push to the OneSignal deferred queue
        window.OneSignalDeferred.push(async (OneSignal: any) => {
          console.log('🟢 OneSignal SDK is ready');

          try {
            // 1. Initialize OneSignal
            await OneSignal.init({
              appId: '9612930a-b621-4ad0-80ef-cf27248ee8fd',
            });

            console.log('🟢 OneSignal initialized');

            // 2. Get current user from Supabase
            const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
            if (authError) {
              console.error('❌ Auth error:', authError);
              return;
            }
            if (!user) {
              console.log('⚠️ No authenticated user found');
              return;
            }

            console.log('🟢 User authenticated:', user.id);

            // 3. Set External User ID
            await OneSignal.login(user.id);
            console.log('🟢 External User ID set:', user.id);

            // 4. Check permission status
            const permission = OneSignal.Notifications.permission;
            console.log('📱 Current permission status:', permission);

            // 5. Request permission if needed
            if (permission === 'default' || permission === 'notDetermined') {
              console.log('📱 Requesting notification permission...');
              const result = await OneSignal.Notifications.requestPermission();
              console.log('📱 Permission result:', result);
            }

            // 6. Get subscription ID
            // Wait for subscription to be established on iOS
            await new Promise((resolve) => setTimeout(resolve, 1500));

            const subscriptionId = OneSignal.User?.PushSubscription?.id;
            console.log('📱 Subscription ID:', subscriptionId || 'null');

            // 7. Save to database
            if (subscriptionId) {
              const { error: updateError } = await supabaseClient
                .from('users_table')
                .update({ onesignal_player_id: subscriptionId })
                .eq('user_id', user.id);

              if (updateError) {
                console.error('❌ Error saving OneSignal ID:', updateError);
              } else {
                console.log('✅ OneSignal ID saved successfully!');
              }
            } else {
              console.log('⚠️ No subscription ID. User may have denied permission or subscription not ready.');
            }
          } catch (err) {
            console.error('❌ Error in OneSignal flow:', err);
          }
        });
      } catch (err) {
        console.error('❌ Error initializing OneSignal:', err);
      }
    };

    // Start initialization
    initializeOneSignal();
  }, []);

  return null;
}