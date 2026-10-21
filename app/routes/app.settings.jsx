import { useRef, useState } from "react";
import { useActionData, useLoaderData, useSubmit } from "react-router";
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

  return { settings };
};

export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;
  const formData = await request.formData();

  const enabled = formData.get("enabled") === "true";
  const minAge = parseInt(formData.get("minAge") || "21", 10);
  const restrictedTag = formData.get("restrictedTag") || "age-restricted";
  const popupTitle = formData.get("popupTitle") || "Age Verification Required";
  const popupMessage =
    formData.get("popupMessage") ||
    "You must be 21 or older to purchase age-restricted products.";
  const confirmText = formData.get("confirmText") || "I am 21 or older";
  const denyText = formData.get("denyText") || "I am under 21";
  const blockMessage =
    formData.get("blockMessage") ||
    "Your cart contains age-restricted items. Please verify your age.";

  const settings = await prisma.appSettings.upsert({
    where: { shop },
    update: {
      enabled,
      minAge,
      restrictedTag,
      popupTitle,
      popupMessage,
      confirmText,
      denyText,
      blockMessage,
    },
    create: {
      shop,
      enabled,
      minAge,
      restrictedTag,
      popupTitle,
      popupMessage,
      confirmText,
      denyText,
      blockMessage,
    },
  });

  return { ok: true, settings };
};

export default function SettingsPage() {
  const { settings } = useLoaderData();
  const actionData = useActionData();
  const submit = useSubmit();
  const shopify = useAppBridge();

  const [formState, setFormState] = useState({
    enabled: settings.enabled,
    minAge: String(settings.minAge),
    restrictedTag: settings.restrictedTag,
    popupTitle: settings.popupTitle,
    popupMessage: settings.popupMessage,
    confirmText: settings.confirmText,
    denyText: settings.denyText,
    blockMessage: settings.blockMessage,
  });

  const handleChange = (field) => (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    const formData = new FormData();
    formData.append("enabled", formState.enabled ? "true" : "false");
    formData.append("minAge", formState.minAge);
    formData.append("restrictedTag", formState.restrictedTag);
    formData.append("popupTitle", formState.popupTitle);
    formData.append("popupMessage", formState.popupMessage);
    formData.append("confirmText", formState.confirmText);
    formData.append("denyText", formState.denyText);
    formData.append("blockMessage", formState.blockMessage);

    submit(formData, { method: "post" });
    shopify.toast.show("Settings saved");
  };

  return (
    <s-page heading="Settings">
      <s-button slot="primary-action" onClick={handleSave}>
        Save settings
      </s-button>

      {actionData?.ok && (
        <s-banner tone="success" slot="banner">
          Settings saved successfully. Age Guard is{" "}
          {actionData.settings.enabled ? "active" : "disabled"}.
        </s-banner>
      )}

      <s-section heading="General">
        <s-stack gap="base">
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={formState.enabled}
              onChange={handleChange("enabled")}
              style={{ width: "20px", height: "20px" }}
            />
            <span style={{ fontSize: "14px", fontWeight: 500 }}>
              Enable Age Guard on this store
            </span>
          </label>

          <div>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: 600,
                marginBottom: "4px",
              }}
            >
              Minimum age
            </label>
            <input
              type="number"
              value={formState.minAge}
              onChange={handleChange("minAge")}
              min={13}
              max={100}
              style={{
                width: "120px",
                padding: "8px 12px",
                fontSize: "14px",
                borderRadius: "8px",
                border: "1px solid #c9cccf",
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: 600,
                marginBottom: "4px",
              }}
            >
              Restricted product tag
            </label>
            <input
              type="text"
              value={formState.restrictedTag}
              onChange={handleChange("restrictedTag")}
              style={{
                width: "300px",
                padding: "8px 12px",
                fontSize: "14px",
                borderRadius: "8px",
                border: "1px solid #c9cccf",
              }}
            />
            <div style={{ fontSize: "12px", color: "#6d7175", marginTop: "4px" }}>
              Products with this tag will trigger the age verification popup.
            </div>
          </div>
        </s-stack>
      </s-section>

      <s-section heading="Age gate popup">
        <s-stack gap="base">
          <div>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: 600,
                marginBottom: "4px",
              }}
            >
              Popup title
            </label>
            <input
              type="text"
              value={formState.popupTitle}
              onChange={handleChange("popupTitle")}
              style={{
                width: "100%",
                maxWidth: "500px",
                padding: "8px 12px",
                fontSize: "14px",
                borderRadius: "8px",
                border: "1px solid #c9cccf",
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: 600,
                marginBottom: "4px",
              }}
            >
              Popup message
            </label>
            <textarea
              value={formState.popupMessage}
              onChange={handleChange("popupMessage")}
              rows={3}
              style={{
                width: "100%",
                maxWidth: "500px",
                padding: "8px 12px",
                fontSize: "14px",
                borderRadius: "8px",
                border: "1px solid #c9cccf",
                resize: "vertical",
              }}
            />
          </div>

          <div style={{ display: "flex", gap: "16px" }}>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: 600,
                  marginBottom: "4px",
                }}
              >
                Confirm button text
              </label>
              <input
                type="text"
                value={formState.confirmText}
                onChange={handleChange("confirmText")}
                style={{
                  width: "240px",
                  padding: "8px 12px",
                  fontSize: "14px",
                  borderRadius: "8px",
                  border: "1px solid #c9cccf",
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: 600,
                  marginBottom: "4px",
                }}
              >
                Deny button text
              </label>
              <input
                type="text"
                value={formState.denyText}
                onChange={handleChange("denyText")}
                style={{
                  width: "240px",
                  padding: "8px 12px",
                  fontSize: "14px",
                  borderRadius: "8px",
                  border: "1px solid #c9cccf",
                }}
              />
            </div>
          </div>
        </s-stack>
      </s-section>

      <s-section heading="Blocked checkout message">
        <div>
          <label
            style={{
              display: "block",
              fontSize: "12px",
              fontWeight: 600,
              marginBottom: "4px",
            }}
          >
            Block message
          </label>
          <textarea
            value={formState.blockMessage}
            onChange={handleChange("blockMessage")}
            rows={2}
            style={{
              width: "100%",
              maxWidth: "500px",
              padding: "8px 12px",
              fontSize: "14px",
              borderRadius: "8px",
              border: "1px solid #c9cccf",
              resize: "vertical",
            }}
          />
          <div style={{ fontSize: "12px", color: "#6d7175", marginTop: "4px" }}>
            This message appears when a customer tries to check out with
            age-restricted items without verifying their age.
          </div>
        </div>
      </s-section>

      <s-section slot="aside" heading="How it works">
        <s-paragraph>
          <s-text style={{ fontWeight: "bold" }}>
            1. Storefront age gate
          </s-text>
        </s-paragraph>
        <s-paragraph>
          When a customer visits a product page with the restricted tag, a popup
          asks them to confirm their age.
        </s-paragraph>

        <s-paragraph>
          <s-text style={{ fontWeight: "bold" }}>2. Age verification</s-text>
        </s-paragraph>
        <s-paragraph>
          If the customer confirms they meet the minimum age, they can add the
          item to cart and complete checkout. If they decline, they are
          redirected away from the product.
        </s-paragraph>

        <s-paragraph>
          <s-text style={{ fontWeight: "bold" }}>3. No theme changes</s-text>
        </s-paragraph>
        <s-paragraph>
          Age Guard works through Shopify App Embeds — no theme code editing
          required.
        </s-paragraph>
      </s-section>
    </s-page>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
