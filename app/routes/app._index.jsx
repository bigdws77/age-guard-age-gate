import { useEffect } from "react";
import { useLoaderData, useNavigate } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  let settings = await prisma.appSettings.findUnique({
    where: { shop },
  });

  if (!settings) {
    settings = await prisma.appSettings.create({ data: { shop } });
  }

  return {
    enabled: settings.enabled,
    minAge: settings.minAge,
    restrictedTag: settings.restrictedTag,
  };
};

export default function Index() {
  const { enabled, minAge, restrictedTag } = useLoaderData();
  const shopify = useAppBridge();
  const navigate = useNavigate();

  useEffect(() => {
    shopify.toast.show(enabled ? "Age Guard is active" : "Age Guard is paused");
  }, [shopify, enabled]);

  const goToProducts = () => shopify.router.navigate("/admin/products");
  const goToSettings = () => navigate("/app/settings");

  return (
    <s-page heading="Age Guard: Age Verification Gate">
      <s-button slot="primary-action" onClick={goToSettings}>
        Configure settings
      </s-button>

      <s-banner tone={enabled ? "success" : "warning"} slot="banner">
        {enabled
          ? `Age Guard is active. Products tagged "${restrictedTag}" require age ${minAge}+ to purchase.`
          : "Age Guard is currently disabled. Enable it in Settings."}
      </s-banner>

      <s-section heading="Setup steps">
        <s-paragraph>
          <s-text style={{ fontWeight: "bold" }}>Step 1.</s-text> In the Shopify
          theme editor, open <s-text style={{ fontWeight: "bold" }}>App embeds</s-text>{" "}
          and enable <s-text style={{ fontWeight: "bold" }}>Age Guard Storefront Gate</s-text>.
          This hides "Buy it now" on restricted products and shows the age verification popup.
        </s-paragraph>
        <s-paragraph>
          <s-text style={{ fontWeight: "bold" }}>Step 2.</s-text> Tag any product
          with <s-text style={{ fontWeight: "bold" }}>"{restrictedTag}"</s-text> in the
          Shopify admin.
        </s-paragraph>
        <s-paragraph>
          <s-text style={{ fontWeight: "bold" }}>Step 3.</s-text> Configure the
          minimum age and messages in <s-text style={{ fontWeight: "bold" }}>Settings</s-text>.
        </s-paragraph>
      </s-section>

      <s-section heading="What customers see">
        <s-paragraph>
          On a restricted product page, "Buy it now" is hidden and an age
          verification popup appears. After confirming their age, customers can
          add the item to cart and complete checkout normally.
        </s-paragraph>
      </s-section>

      <s-section slot="aside" heading="App details">
        <s-paragraph>
          <s-text>Status: </s-text>
          <s-text style={{ fontWeight: "bold" }}>
            {enabled ? "Active" : "Paused"}
          </s-text>
        </s-paragraph>
        <s-paragraph>
          <s-text>Minimum age: </s-text>
          <s-text style={{ fontWeight: "bold" }}>{minAge}+</s-text>
          <s-text tone="subdued"> (adjustable in settings)</s-text>
        </s-paragraph>
        <s-paragraph>
          <s-text>Restricted tag: </s-text>
          <s-text style={{ fontWeight: "bold", fontFamily: "monospace" }}>
            {restrictedTag}
          </s-text>
        </s-paragraph>
        <s-paragraph>
          <s-text>Setup time: </s-text>
          <s-text>Under 60 seconds</s-text>
        </s-paragraph>
        <s-paragraph>
          <s-text>Theme changes: </s-text>
          <s-text>None required</s-text>
        </s-paragraph>
        <s-paragraph>
          <s-text>Platform: </s-text>
          <s-text>Shopify Checkout Extensibility</s-text>
        </s-paragraph>
      </s-section>

      <s-section slot="aside" heading="Quick actions">
        <s-stack gap="base">
          <s-button onClick={goToSettings}>Edit settings</s-button>
          <s-button variant="secondary" onClick={goToProducts}>
            Tag a product
          </s-button>
        </s-stack>
      </s-section>
    </s-page>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
