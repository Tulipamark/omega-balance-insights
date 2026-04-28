export type CampaignChannel = "instagram_bio" | "instagram_story" | "facebook_page" | "facebook_post";

export const officialCampaignChannels: Array<{
  key: CampaignChannel;
  label: string;
  source: string;
  medium: string;
  campaign: string;
}> = [
  { key: "instagram_bio", label: "Instagram bio", source: "instagram", medium: "social", campaign: "official_bio" },
  { key: "instagram_story", label: "Instagram story", source: "instagram", medium: "social", campaign: "official_story" },
  { key: "facebook_page", label: "Facebook sida", source: "facebook", medium: "social", campaign: "official_page" },
  { key: "facebook_post", label: "Facebook post", source: "facebook", medium: "social", campaign: "official_post" },
];

export function buildCampaignUrl(baseUrl: string, channel: (typeof officialCampaignChannels)[number], referralCode?: string | null) {
  const url = new URL(baseUrl);

  if (referralCode) {
    url.searchParams.set("ref", referralCode);
  }

  url.searchParams.set("utm_source", channel.source);
  url.searchParams.set("utm_medium", channel.medium);
  url.searchParams.set("utm_campaign", channel.campaign);

  return url.toString();
}

export function getReadableTrafficSource(source: string | null | undefined, medium?: string | null, campaign?: string | null) {
  const normalizedSource = (source || "").trim().toLowerCase();
  const normalizedCampaign = (campaign || "").trim().toLowerCase();

  if (!normalizedSource || normalizedSource === "unknown" || normalizedSource === "direct") {
    return "Direkt / okänd";
  }

  if (normalizedSource === "ig" || normalizedSource === "instagram") {
    if (normalizedCampaign.includes("bio")) return "Instagram bio";
    if (normalizedCampaign.includes("story")) return "Instagram story";
    return "Instagram";
  }

  if (normalizedSource === "fb" || normalizedSource === "facebook") {
    if (normalizedCampaign.includes("post")) return "Facebook post";
    if (normalizedCampaign.includes("page")) return "Facebook sida";
    return "Facebook";
  }

  if (normalizedSource === "google") {
    return medium === "organic" ? "Google / sök" : "Google";
  }

  return source || "Direkt / okänd";
}
