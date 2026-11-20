'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client (use env variables)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface NotificationManagerProps {
  userId?: string; // Pass user ID from your auth system
}

export function NotificationManager({ userId }: NotificationManagerProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const checkAndRequestPermission = async () => {
      try {
        // 1. Check if user has notifications enabled in DB
        const { data: userData, error } = await supabase
          .from('users_table')
          .select('web_notifications_on')
          .eq('id', userId)
          .single();

        if (error) {
          console.error('Error fetching user notification status:', error);
          return;
        }

        // 2. If already enabled, don't ask again
        if (userData?.web_notifications_on) {
          setIsLoading(false);
          return;
        }

        // 3. Check if browser supports notifications
        if (!('Notification' in window)) {
          console.log('This browser does not support notifications');
          setIsLoading(false);
          return;
        }

        // 4. Check current permission status
        const permission = Notification.permission;

        if (permission === 'granted') {
          // Already granted, update DB
          await updateNotificationStatus(true);
        } else if (permission === 'default') {
          // Ask for permission
          const result = await Notification.requestPermission();
          if (result === 'granted') {
            await updateNotificationStatus(true);
            // You can subscribe to push notifications here if needed
            console.log('Notification permission granted!');
          } else {
            console.log('Notification permission denied');
          }
        } else if (permission === 'denied') {
          console.log('Notification permission previously denied');
        }

        setIsLoading(false);
      } catch (err) {
        console.error('Error in notification flow:', err);
        setIsLoading(false);
      }
    };

    const updateNotificationStatus = async (enabled: boolean) => {
      const { error } = await supabase
        .from('users_table')
        .update({ web_notifications_on: enabled })
        .eq('id', userId);

      if (error) {
        console.error('Error updating notification status:', error);
      }
    };

    checkAndRequestPermission();
  }, [userId]);

  return null; // This component doesn't render anything visible
}