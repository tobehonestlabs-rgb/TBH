'use client'; // ⚠️ CRUCIAL: This tells Next.js to run this on the client side

import { useEffect } from 'react';
import OneSignal from 'react-onesignal';
import { supabaseClient } from '@/lib/supabaseClient'
interface InitializerProps {
  userId?: string; // Pass the Supabase user ID if they are logged in
}

export default function NotificationInitializer({ userId }: InitializerProps) {
  useEffect(() => {
    // Only initialize on the client side
    if (typeof window !== 'undefined') {
      OneSignal.init({
        appId: "e3052a0d-b8a1-4b8a-9653-c1c40feae94e", // 🔑 Replace with your actual App ID
        allowLocalhostAsSecureOrigin: true,
      }).then(async () => {
        // If a user is logged in, tag their external ID so your backend can target them
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) return;

        // 3. Set the External ID (links OneSignal subscription to your user)
        //    This is the recommended way to associate a user across devices
         OneSignal.login(user.id); // or OneSignal.setExternalUserId(user.id) for older v16

        // 4. Get the subscription ID (formerly player_id)
        const subscriptionId = OneSignal.User.PushSubscription.id;
        console.log('Subscription ID:', subscriptionId);

        // 5. Store it in Supabase
        if (subscriptionId) {
          const { error } = await supabaseClient
            .from('users_table')
            .update({ onesignal_player_id: subscriptionId })
            .eq('user_id', user.id);

          if (error) {
            console.error('Error saving OneSignal ID:', error);
          } else {
            console.log('OneSignal ID saved successfully!');
          }
      }}).catch((err) => {
        console.error("OneSignal initialization failed:", err);
      });
    }
  }, [userId]);

  return null; // This component doesn't render any UI, it just runs the background script
}