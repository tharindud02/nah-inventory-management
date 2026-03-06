/**
 * Seller contact domain logic: channel availability, payload shaping, dev-sample fallback.
 * Strict typing; no any.
 */

export type ContactChannel = "sms" | "email" | "messenger";

export interface SellerContactInput {
  sellerPhone?: string | null;
  sellerEmail?: string | null;
  dealerPhone?: string | null;
  dealerEmail?: string | null;
  messengerHref?: string | null;
  /** When true, show sample SMS/Email/Messenger when no real contact (e.g. Acquisition page). */
  forceShowSamples?: boolean;
}

export interface ChannelAvailability {
  channels: ContactChannel[];
  hasSms: boolean;
  hasEmail: boolean;
  hasMessenger: boolean;
  showSampleButtons: boolean;
}

const SAMPLE_DEALER_PHONE = "+13253123092";
const SAMPLE_DEALER_EMAIL = "nipul@apium.io";
const SAMPLE_SELLER_PHONE = "+94770713183";
const SAMPLE_SELLER_EMAIL = "nipul@bokehrentals.com";

/** Resolve dealer contact from env. NEXT_PUBLIC_ vars are inlined at build time. */
function getDealerContact(): { phone: string | null; email: string | null } {
  const phone = typeof process !== "undefined" ? process.env.NEXT_PUBLIC_DEALER_PHONE?.trim() : null;
  const email = typeof process !== "undefined" ? process.env.NEXT_PUBLIC_DEALER_EMAIL?.trim() : null;
  return {
    phone: phone || null,
    email: email || null,
  };
}

function isNonEmpty(s: string | null | undefined): boolean {
  return typeof s === "string" && s.trim().length > 0;
}

/**
 * Derives available contact channels from seller/dealer data.
 * When no real contact exists and NEXT_PUBLIC_ENABLE_CONTACT_SAMPLES is true,
 * returns sample channel set for dev/testing.
 */
export function getChannelAvailability(input: SellerContactInput): ChannelAvailability {
  const dealer = getDealerContact();
  const dealerPhone = input.dealerPhone ?? dealer.phone;
  const dealerEmail = input.dealerEmail ?? dealer.email;
  const hasRealSms = isNonEmpty(input.sellerPhone) && isNonEmpty(dealerPhone);
  const hasRealEmail = isNonEmpty(input.sellerEmail) && isNonEmpty(dealerEmail);
  const hasRealMessenger = isNonEmpty(input.messengerHref);

  const enableSamples =
    input.forceShowSamples ||
    (typeof process !== "undefined" &&
      process.env?.NEXT_PUBLIC_ENABLE_CONTACT_SAMPLES === "true");

  const hasAnyReal = hasRealSms || hasRealEmail || hasRealMessenger;
  const showSampleButtons = enableSamples && !hasAnyReal;

  const channels: ContactChannel[] = [];
  if (hasRealSms) channels.push("sms");
  if (hasRealEmail) channels.push("email");
  if (hasRealMessenger) channels.push("messenger");

  if (showSampleButtons) {
    channels.push("sms", "email", "messenger");
  }

  return {
    channels: [...new Set(channels)],
    hasSms: hasRealSms || showSampleButtons,
    hasEmail: hasRealEmail || showSampleButtons,
    hasMessenger: hasRealMessenger || showSampleButtons,
    showSampleButtons,
  };
}

/**
 * Returns contact values for SMS/email. Uses real data when available; otherwise sample values when enabled.
 */
export function getContactForChannel(
  channel: "sms" | "email",
  input: SellerContactInput,
  availability: ChannelAvailability,
): { dealer: string; seller: string } | null {
  const dealer = getDealerContact();
  if (channel === "sms") {
    const d = input.dealerPhone ?? (availability.showSampleButtons ? SAMPLE_DEALER_PHONE : dealer.phone);
    const s = input.sellerPhone ?? (availability.showSampleButtons ? SAMPLE_SELLER_PHONE : null);
    return d && s ? { dealer: d, seller: s } : null;
  }
  if (channel === "email") {
    const d = input.dealerEmail ?? (availability.showSampleButtons ? SAMPLE_DEALER_EMAIL : dealer.email);
    const s = input.sellerEmail ?? (availability.showSampleButtons ? SAMPLE_SELLER_EMAIL : null);
    return d && s ? { dealer: d, seller: s } : null;
  }
  return null;
}

/**
 * Builds payload for POST /api/conversations/[listingId]/messages (add message to existing email).
 */
export function buildAddEmailMessagePayload(
  conversationId: string,
  message: string,
  input: SellerContactInput,
  availability: ChannelAvailability,
): { conversationId: string; to: string; from: string; body: string; channel: "email" } | null {
  const contact = getContactForChannel("email", input, availability);
  if (!contact) return null;
  return {
    conversationId,
    to: contact.seller,
    from: contact.dealer,
    body: message,
    channel: "email",
  };
}

/**
 * Builds payload for POST /api/conversations/[listingId] (create email).
 */
export function buildCreateEmailPayload(
  listingId: string,
  message: string,
  input: SellerContactInput,
  availability: ChannelAvailability,
): { dealerEmail: string; sellerEmail: string; message: string; channel: "email" } | null {
  const contact = getContactForChannel("email", input, availability);
  if (!contact) return null;
  return {
    dealerEmail: contact.dealer,
    sellerEmail: contact.seller,
    message,
    channel: "email",
  };
}

/**
 * Builds payload for POST /api/conversations/[listingId] (create SMS conversation).
 */
export function buildCreateSmsPayload(
  message: string,
  input: SellerContactInput,
  availability: ChannelAvailability,
): { dealerPhone: string; sellerPhone: string; message: string; channel: "sms" } | null {
  const contact = getContactForChannel("sms", input, availability);
  if (!contact) return null;
  return {
    dealerPhone: contact.dealer,
    sellerPhone: contact.seller,
    message,
    channel: "sms",
  };
}

/**
 * Builds payload for POST /api/conversations/[listingId]/messages (add message to existing SMS).
 */
export function buildAddSmsMessagePayload(
  conversationId: string,
  message: string,
  input: SellerContactInput,
  availability: ChannelAvailability,
): { conversationId: string; to: string; from: string; body: string; channel: "sms" } | null {
  const contact = getContactForChannel("sms", input, availability);
  if (!contact) return null;
  return {
    conversationId,
    to: contact.seller,
    from: contact.dealer,
    body: message,
    channel: "sms",
  };
}

export interface ChatMessageFromApi {
  id: string;
  message: string;
  timestamp: string;
  isOutgoing: boolean;
}

/**
 * Maps upstream ConversationMessage[] to ChatMessage[] for UI.
 */
export function mapApiMessagesToChat(
  messages: Array<{ id: string; body: string; direction: string; createdAt: string }>,
): ChatMessageFromApi[] {
  return messages.map((m) => ({
    id: m.id,
    message: m.body,
    timestamp: formatMessageTime(m.createdAt),
    isOutgoing: m.direction === "outbound",
  }));
}

function formatMessageTime(iso: string): string {
  try {
    const d = new Date(iso);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    if (isToday) {
      return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    }
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) {
      return `Yesterday ${d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
    }
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}
