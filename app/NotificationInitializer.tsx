'use client'; // ⚠️ CRUCIAL: This tells Next.js to run this on the client side

import { useEffect } from 'react';
import OneSignal from 'react-onesignal';

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
      }).then(() => {
        // If a user is logged in, tag their external ID so your backend can target them
        if (userId) {
          OneSignal.login(userId);
        }
      }).catch((err) => {
        console.error("OneSignal initialization failed:", err);
      });
    }
  }, [userId]);

  return null; // This component doesn't render any UI, it just runs the background script
}