import { authenticate } from "../shopify.server";

export const action = async ({ request }) => {
  const { topic, shop, payload } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);

  // Log subscription status changes (active, cancelled, expired, etc.)
  if (payload?.app_subscription) {
    const status = payload.app_subscription.status;
    console.log(`Subscription status changed to: ${status}`);

    if (status === "CANCELLED" || status === "EXPIRED" || status === "DECLINED") {
      // The merchant cancelled or the subscription expired.
      // On their next visit to the app, billing.require will redirect them
      // to re-approve the subscription.
      console.log(`Subscription no longer active for ${shop}`);
    }
  }

  return new Response();
};
