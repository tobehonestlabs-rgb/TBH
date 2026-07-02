'use client';

import { useEffect } from 'react';
import { supabaseClient } from '@/lib/supabaseClient';

// Extend Window interface to include OneSignalDeferred
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

    const initializeOneSignal = async () => {
      try {
        console.log('🔵 NotificationInitializer: Starting...');

        // Wait for OneSignal Deferred to be available
        const maxAttempts = 10;
        let attempts = 0;
        while (attempts < maxAttempts) {
          if (window.OneSignalDeferred) {
            console.log('🟢 OneSignalDeferred found');
            break;
          }
          console.log(`⏳ Waiting for OneSignal script... attempt ${attempts + 1}`);
          await new Promise((resolve) => setTimeout(resolve, 500));
          attempts++;
        }

        if (!window.OneSignalDeferred) {
          console.error('❌ OneSignalDeferred not available after waiting.');
          return;
        }

        // Push to the OneSignal deferred queue
        window.OneSignalDeferred.push(async (OneSignal: any) => {
          console.log('🟢 OneSignal SDK is ready');

          try {
            // 1. Initialize OneSignal (if not already)
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

            // 3. Set External User ID (links OneSignal to your user)
            await OneSignal.login(user.id);
            console.log('🟢 External User ID set:', user.id);

            // 4. Check if we already have permission
            const permission = OneSignal.Notifications.permission;
            console.log('📱 Current permission status:', permission);

            // 5. If permission is not granted, request it
            if (permission === 'default' || permission === 'notDetermined') {
              console.log('📱 Requesting notification permission...');
              const result = await OneSignal.Notifications.requestPermission();
              console.log('📱 Permission result:', result);
            }

            // 6. Get the subscription ID (player_id)
            // Wait a moment for subscription to be established on iOS
            await new Promise((resolve) => setTimeout(resolve, 1500));

            const subscriptionId = OneSignal.User?.PushSubscription?.id;
            console.log('📱 Subscription ID:', subscriptionId || 'null');

            // 7. Save to database if we have an ID
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

    // Start the initialization
    initializeOneSignal();
  }, []);

  return null;
}