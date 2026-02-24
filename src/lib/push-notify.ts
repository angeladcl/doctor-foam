import { createClient } from "@supabase/supabase-js";
import webpush from "web-push";

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Configure VAPID
const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY!;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || "mailto:info@drfoam.com.mx";

if (VAPID_PUBLIC && VAPID_PRIVATE) {
    webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);
}

interface PushPayload {
    title: string;
    body: string;
    url?: string;
    icon?: string;
}

/**
 * Send push notification to all subscribed admin users.
 * Silently cleans up expired/invalid subscriptions.
 */
export async function sendPushToAdmins(payload: PushPayload): Promise<void> {
    if (!VAPID_PUBLIC || !VAPID_PRIVATE) {
        console.warn("VAPID keys not configured, skipping push notifications");
        return;
    }

    // Get all admin users first
    const { data: adminUsers } = await supabaseAdmin
        .from("customer_profiles")
        .select("id")
        .or("role.eq.admin");

    // Fallback: if no admin profile filter works, get all subscriptions
    // (since only admins subscribe from the admin panel)
    const { data: subscriptions, error } = await supabaseAdmin
        .from("push_subscriptions")
        .select("*");

    if (error || !subscriptions?.length) {
        return;
    }

    const notification = JSON.stringify({
        title: payload.title,
        body: payload.body,
        url: payload.url || "/admin/mensajes",
        icon: payload.icon || "/icon-192.png",
        badge: "/icon-192.png",
    });

    const expiredIds: string[] = [];

    await Promise.allSettled(
        subscriptions.map(async (sub) => {
            const pushSubscription = {
                endpoint: sub.endpoint,
                keys: {
                    p256dh: sub.p256dh,
                    auth: sub.auth,
                },
            };

            try {
                await webpush.sendNotification(pushSubscription, notification);
            } catch (err: unknown) {
                const pushErr = err as { statusCode?: number };
                // 410 Gone or 404 = subscription expired
                if (pushErr.statusCode === 410 || pushErr.statusCode === 404) {
                    expiredIds.push(sub.id);
                } else {
                    console.error("Push send error:", err);
                }
            }
        })
    );

    // Clean up expired subscriptions
    if (expiredIds.length > 0) {
        await supabaseAdmin
            .from("push_subscriptions")
            .delete()
            .in("id", expiredIds);
    }
}
