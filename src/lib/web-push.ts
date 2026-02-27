import webPush from "web-push";
import { createServerSupabase } from "./supabase";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || "";
const VAPID_SUBJECT = "mailto:contacto@doctorfoam.mx"; // Best practice is a mailto link

// Only configure web-push if keys are present (prevents crashing on dev machines without env vars)
if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
    webPush.setVapidDetails(
        VAPID_SUBJECT,
        VAPID_PUBLIC_KEY,
        VAPID_PRIVATE_KEY
    );
}

/**
 * Sends a Push Notification to a specific user using their stored subscriptions in Supabase.
 * @param userId The UUID of the user to notify
 * @param payload Object containing title, body, url, icon, badge
 */
export async function sendPushNotification(
    userId: string,
    payload: { title: string; body: string; url?: string; icon?: string; badge?: string }
) {
    if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
        console.warn("VAPID Keys not set. Cannot send push notifications.");
        return;
    }

    try {
        const supabaseAdmin = createServerSupabase();

        // Fetch all active subscriptions for this user
        const { data: subscriptions, error } = await supabaseAdmin
            .from("push_subscriptions")
            .select("*")
            .eq("user_id", userId);

        if (error) {
            console.error("Error fetching subscriptions:", error);
            return;
        }

        if (!subscriptions || subscriptions.length === 0) {
            return; // No devices registered
        }

        const stringifiedPayload = JSON.stringify({
            title: payload.title,
            body: payload.body,
            url: payload.url || "/",
            icon: payload.icon || "/icon-192.png",
            badge: payload.badge || "/icon-192.png"
        });

        const promises = subscriptions.map(async (row) => {
            const pushSubscription = row.subscription_data;
            try {
                await webPush.sendNotification(pushSubscription, stringifiedPayload);
            } catch (err: any) {
                // If standard 410 or 404 error, the subscription has expired or been revoked
                if (err.statusCode === 410 || err.statusCode === 404) {
                    console.log(`Subscription deleted (status: ${err.statusCode}) for user ${userId}`);
                    await supabaseAdmin
                        .from("push_subscriptions")
                        .delete()
                        .eq("id", row.id);
                } else {
                    console.error("Error sending push to a specific subscription:", err);
                }
            }
        });

        await Promise.all(promises);
    } catch (err) {
        console.error("Fatal error inside sendPushNotification:", err);
    }
}

/**
 * Sends a push notification to ALL users with the "admin" role.
 * Extremely useful for triggering "New Chat Message" or "New Sale" alerts.
 */
export async function sendPushToAdmins(
    payload: { title: string; body: string; url?: string; icon?: string; badge?: string }
) {
    if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
        return;
    }

    try {
        const supabaseAdmin = createServerSupabase();

        // We know admins have 'role: admin' on auth.users app_metadata
        // But since we can't easily query auth.users from Supabase client directly with filtering 
        // without listUsers(), we can query the admin_profiles table as a proxy for admins.

        const { data: adminProfiles, error: profilesError } = await supabaseAdmin
            .from("admin_profiles")
            .select("id");

        if (profilesError || !adminProfiles) {
            console.error("Could not fetch admins for push notification", profilesError);
            return;
        }

        const promises = adminProfiles.map((admin) =>
            sendPushNotification(admin.id, payload)
        );

        await Promise.all(promises);

    } catch (err) {
        console.error("Fatal error broadcasting to admins:", err);
    }
}
