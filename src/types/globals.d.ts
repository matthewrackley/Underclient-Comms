export { };
interface Sizes {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

declare module 'styled-components' {
  interface DefaultTheme {
    space: Sizes;
    radius: Pick<Sizes, "sm" | "md" | "lg"> & { pill: string };
    color: {
      bg: string,
      border: string,
      surfaceAlt: string,
      text: string,
      accent: string;
      textMuted: string;
      textSubtle: string;
      surface: string;
      bgGlow: string;
      success: string;
      accentSoft: string;
      danger: string;
      focus: string;
      link: string;
    }
    font: {
      display: string;
      body: string;
    }
    shadow: {
      soft: string;
      sharp: string;
    }
  }
}


declare global {

  type Snowflake = import('@/client/helpers/Snowflake').Snowflake & string & keyof any;

  interface RequestInit {
    "Content-Type"?: string;
  }
  interface Channel extends DiscordAPI.Channel {
    messages: {
      [messageId: Snowflake]: Message
    },
    privates: {
      [messageId: Snowflake]: Private
    };
  }

  interface BaseMessage {
    id: Snowflake;
    guildId: Snowflake;
    channelId: Snowflake;
    privateId?: Snowflake;
    content: string;
    author: Auth.User;
  }
  interface Message extends BaseMessage {
    createdAt: import('firebase/firestore').Timestamp,
    expiresAt?: import('firebase/firestore').Timestamp; // default: 7 days after timestamp
  }

  interface Private {
    id: Snowflake;
    guildId: Snowflake,
    channelId: Snowflake,
    name: string,
    messages: {
      [messageId: Snowflake]: Message
    },
    owner: string, // userId of the private channel owner
    visible: boolean, // whether the private channel is visible to users
    passcode: Passcode, // 4 to 6 digit code for joining the private channel
    inviteCode: InviteCode; // 6 to 10 character code for joining the private channel
    createdAt: import('firebase/firestore').Timestamp,
    expiresAt?: import('firebase/firestore').Timestamp; // default: 24 days after timestamp
  }
  interface PartialPrivate extends Partial<Private> {
    id: Snowflake;
    passcode: Passcode;
    inviteCode: InviteCode;
  }

  type Passcode = number & {
    __length: 4 | 5 | 6;
    __brand: "Passcode";
  }
  type InviteCode = string & {
    length: 6 | 7 | 8 | 9 | 10;
    __brand: "InviteCode";
  }

  type OAuth2Scope = -1 | "identify" | "identify.premium" | "email" | "connections" | "guilds" | "guilds.join" | "guilds.members.read" | "guilds.channels.read" | "gdm.join" | "bot" | "rpc" | "rpc.notifications.read" | "rpc.voice.read" | "rpc.voice.write" | "rpc.video.read" | "rpc.video.write" | "rpc.screenshare.read" | "rpc.screenshare.write" | "rpc.activities.write" | "webhook.incoming" | "messages.read" | "applications.builds.upload" | "applications.builds.read" | "applications.commands" | "applications.commands.permissions.update" | "applications.commands.update" | "applications.store.update" | "applications.entitlements" | "activities.read" | "activities.write" | "activities.invites.write" | "relationships.read" | "relationships.write" | "voice" | "dm_channels.read" | "role_connections.write" | "presences.read" | "presences.write" | "openid" | "dm_channels.messages.read" | "dm_channels.messages.write" | "gateway.connect" | "account.global_name.update" | "payment_sources.country_code" | "sdk.social_layer_presence" | "sdk.social_layer" | "lobbies.write" | "application_identities.write";

  type AvatarDecorationData = Record<string, unknown>;
  type Collectibles = Record<string, unknown>;
  type UserPrimaryGuild = Record<string, unknown>;

  interface ApplicationData {
    id: Snowflake;
    description: string;
    name: string;
    icon?: string | null | undefined;
    rpc_origins?: string[] | undefined;
  };
  interface PartialGuild {
    id: Snowflake,
    name: string,
    icon: string,
    banner: string,
    owner: boolean,
    permissions: `${number}`,
    features: DiscordAPI.GuildFeature[],
    channels?: {
      [channelId: Snowflake]: Channel;
    }
  }
  namespace Auth {

    export interface User extends DiscordAPI.User {
      username: string;
      discriminator: string;
      id: Snowflake;
      public_flags: number;
      avatar?: string | null | undefined;
      global_name?: string | null | undefined;
      privates: string[]; // array of private channel IDs the user is an owner of
      guilds: {
        [guildId: Snowflake]: PartialGuild;
      }
    }

    export interface Application {
      id: Snowflake;
      description: string;
      name: string;
      icon?: string | null | undefined;
      rpc_origins?: string[] | undefined;
      [x: string]: any;
    };

  }

  interface Authenticated {
    access_token: string;
    user: Auth.User;
    scopes: OAuth2Scope[];
    expires: string | number;
    application: Auth.Application;
    expirationTime: number;
  }

  type AuthenticateResponse = import('@discord/embedded-app-sdk').CommandResponse<"authenticate">;

  interface MessageRequest {
    guildId: Snowflake;
    channelId: Snowflake;
  }
  type CollectionData<T extends CollectionsType> = T extends "servers" ? Server : T extends "users" ? User : T extends "channels" ? Channel : T extends "messages" ? Message : Private;

  type CollectionsType = "servers" | "users" | "channels" | "messages" | "privates";

  type CollectionsParent<T extends Exclude<CollectionsType, "servers" | "users">> = T extends "channels" ? Server : Channel | Private;
  interface DbOptions {
    guildId: Snowflake;
  }
  interface ChildDbOptions extends DbOptions {
    channelId: Snowflake;
  }
  interface MessageDbOptions extends ChildDbOptions {
    privateId?: Snowflake;
  }
  interface ModifyDbOptions<T extends CollectionsType, P extends "update" | "add" = "add"> {
    data: P extends "update" ? Partial<CollectionData<T>> : CollectionData<T>;
  }
  type GuildFeatures = "COMMUNITY" | "NEWS" | "ANIMATED_ICON" | "INVITE_SPLASH" | "BANNER" | "ROLE_ICONS";
  interface Emoji {
    name: string,
    roles: [],
    id: Snowflake,
    require_colons: boolean,
    managed: boolean,
    animated: boolean,
    available: boolean
  }
  interface RoleColors {
    primary_color: number,
    secondary_color: number | null,
    tertiary_color: number | null
  }
  interface DiscordRole {
    id: Snowflake,
    name: string,
    permissions: string,
    position: number,
    color: number,
    colors: RoleColors,
    hoist: boolean,
    managed: boolean,
    mentionable: boolean
  }
  interface PartialAPIGuild {
    /** Guild id */
    id: Snowflake,
    /** Guild name */
    name: string,
    /** Icon hash */
    icon: string,
    /** Banner hash */
    banner: string,
    /** True if the user is the owner of the guild */
    owner: boolean,
    /** Total permissions for the user in the guild */
    permissions: string,
    /** Enabled guild features */
    features: GuildFeatures[],
    /** Approximate number of members in this guild */
    approximate_member_count: number,
    /** Approximate number of non-offline members in this guild */
    approximate_presence_count: number
  }
  type WelcomeScreen = Record<string, unknown>;
  type Sticker = Record<string, unknown>;
  type IncidentsData = Record<string, unknown>;

  type ISO8601Timestamp = string;
  type PermissionOverwrite = Record<string, unknown>;
  type ThreadMetadata = Record<string, unknown>;
  type ThreadMember = Record<string, unknown>;
  type ChannelTag = Record<string, unknown>;
  type DefaultReaction = Record<string, unknown>;

  interface APIGuild {
    /** Guild id */
    id: Snowflake,
    /** Guild name */
    name: string,
    /** Icon hash */
    icon?: string | null,
    /** Icon hash (template object only) */
    icon_hash?: string | null,
    /** Splash hash */
    splash?: string | null,
    /** Discovery splash hash */
    discovery_splash?: string | null,
    /** True if the user is the owner of the guild */
    owner?: boolean,
    /** Id of owner */
    owner_id: Snowflake,
    /** Total permissions for the user in the guild */
    permissions?: string,
    /** Voice region id (deprecated) */
    region?: string | null,
    /** Id of afk channel */
    afk_channel_id?: Snowflake | null,
    /** Afk timeout in seconds */
    afk_timeout: number,
    /** True if the server widget is enabled */
    widget_enabled?: boolean,
    /** The channel id the widget invite points to */
    widget_channel_id?: Snowflake | null,
    /** Verification level required for the guild */
    verification_level: number,
    /** Default message notifications level */
    default_message_notifications: number,
    /** Explicit content filter level */
    explicit_content_filter: number,
    /** Roles in the guild */
    roles: DiscordRole[],
    /** Custom guild emojis */
    emojis: Emoji[],
    /** Enabled guild features */
    features: GuildFeatures[],
    /** Required MFA level */
    mfa_level: number,
    /** Application id of the guild creator if bot-created */
    application_id?: Snowflake | null,
    /** Id of the channel for guild notices */
    system_channel_id?: Snowflake | null,
    /** System channel flags */
    system_channel_flags: number,
    /** Id of the channel for rules and guidelines */
    rules_channel_id?: Snowflake | null,
    /** Maximum number of presences (null except largest guilds) */
    max_presences?: number | null,
    /** Maximum number of members */
    max_members?: number,
    /** Vanity url code for the guild */
    vanity_url_code?: string | null,
    /** Description of a guild */
    description?: string | null,
    /** Banner hash */
    banner?: string | null,
    /** Premium tier (Server Boost level) */
    premium_tier: number,
    /** Number of boosts */
    premium_subscription_count?: number,
    /** Preferred locale of a Community guild */
    preferred_locale: string,
    /** Id of channel for community updates */
    public_updates_channel_id?: Snowflake | null,
    /** Maximum users in a video channel */
    max_video_channel_users?: number,
    /** Maximum users in a stage channel */
    max_stage_video_channel_users?: number,
    /** Approximate number of members */
    approximate_member_count?: number,
    /** Approximate number of non-offline members */
    approximate_presence_count?: number,
    /** Welcome screen of a Community guild */
    welcome_screen?: WelcomeScreen,
    /** Guild age-restriction level */
    nsfw_level: number,
    /** Custom guild stickers */
    stickers?: Sticker[],
    /** Whether the boost progress bar is enabled */
    premium_progress_bar_enabled: boolean,
    /** Id of channel for safety alerts */
    safety_alerts_channel_id?: Snowflake | null,
    /** Incidents data for this guild */
    incidents_data?: IncidentsData | null
  }

  type ChannelType = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | -1;

  interface AvatarDecorationData {
    asset: string;
    sku_id?: string | undefined;
  }
  interface VCUser {
    username: string;
    discriminator: string;
    id: Snowflake;
    bot: boolean;
    avatar_decoration_data: AvatarDecorationData | null;
    avatar?: string | null | undefined;
    global_name?: string | null | undefined;
    flags?: number | null | undefined;
    premium_type?: number | null | undefined;
  };
  interface VoiceState {
    deaf: boolean;
    mute: boolean;
    self_mute: boolean;
    self_deaf: boolean;
    suppress: boolean;
  }
  interface VoiceUser {
    user: VCUser;
    nick: string;
    mute: boolean;
    voice_state: VoiceState;
    volume: number;
  }
  interface DiscordMessageUser {
    username: string;
    discriminator: string;
    id: Snowflake;
    bot: boolean;
    avatar_decoration_data: AvatarDecorationData | null;
    avatar?: string | null | undefined;
    global_name?: string | null | undefined;
    flags?: number | null | undefined;
    premium_type?: number | null | undefined;
  }
  interface DiscordMessageMentionChannel {
    type: number;
    id: Snowflake;
    name: string;
    guild_id: Snowflake;
  }
  interface DiscordMessageAttachment {
    id: Snowflake;
    url: string;
    size: number;
    filename: string;
    proxy_url: string;
    height?: number | null | undefined;
    width?: number | null | undefined;
  }
  interface DiscordMessageEmbedFooter {
    text: string;
    icon_url?: string | null | undefined;
    proxy_icon_url?: string | null | undefined;
  }
  interface DiscordMessageEmbedImage {
    height?: number | null | undefined;
    url?: string | null | undefined;
    width?: number | null | undefined;
    proxy_url?: string | null | undefined;
  }
  interface DiscordMessageEmbedThumbnail {
    height?: number | null | undefined;
    url?: string | null | undefined;
    width?: number | null | undefined;
    proxy_url?: string | null | undefined;
  }
  interface DiscordMessageEmbedVideo {
    height?: number | null | undefined;
    url?: string | null | undefined;
    width?: number | null | undefined;
  }
  interface DiscordMessageEmbedProvider {
    name?: string | null | undefined;
    url?: string | null | undefined;
  }
  interface DiscordMessageEmbedAuthor {
    name?: string | null | undefined;
    url?: string | null | undefined;
    icon_url?: string | null | undefined;
    proxy_icon_url?: string | null | undefined;
  }
  interface DiscordMessageEmbedField {
    value: string;
    name: string;
    inline: boolean;
  }
  interface DiscordMessageEmbed {
    type?: string | null | undefined;
    description?: string | null | undefined;
    url?: string | null | undefined;
    color?: string | number | null | undefined;
    title?: string | null | undefined;
    timestamp?: string | null | undefined;
    footer?: DiscordMessageEmbedFooter | null | undefined;
    image?: DiscordMessageEmbedImage | null | undefined;
    thumbnail?: DiscordMessageEmbedThumbnail | null | undefined;
    video?: DiscordMessageEmbedVideo | null | undefined;
    provider?: DiscordMessageEmbedProvider | null | undefined;
    author?: DiscordMessageEmbedAuthor | null | undefined;
    fields?: DiscordMessageEmbedField[] | null | undefined;
  }
  interface DiscordMessageApplication {
    id: Snowflake;
    description: string;
    name: string;
    icon?: string | null | undefined;
    cover_image?: string | null | undefined;
  }
  interface DiscordMessageActivity {
    type: number;
    party_id?: string | null | undefined;
  }
  interface DiscordMessageMember {
    user: DiscordMessageUser;
    roles: string[];
    joined_at: string;
    deaf: boolean;
    mute: boolean;
    nick?: string | null | undefined;
  }
  interface DiscordMessageReactionEmoji {
    id: Snowflake;
    user?: DiscordMessageUser | null | undefined;
    name?: string | null | undefined;
    animated?: boolean | null | undefined;
    roles?: string[] | null | undefined;
    require_colons?: boolean | null | undefined;
    managed?: boolean | null | undefined;
    available?: boolean | null | undefined;
  }
  interface DiscordMessageReaction {
    emoji: DiscordMessageReactionEmoji;
    count: number;
    me: boolean;
  }
  interface DiscordMessageReference {
    guild_id?: Snowflake | null | undefined;
    message_id?: Snowflake | null | undefined;
    channel_id?: Snowflake | null | undefined;
  }
  interface VoiceChatMessage {
    type: number;
    id: Snowflake;
    content: string;
    timestamp: Date;
    tts: boolean;
    channel_id?: Snowflake;
    mention_everyone: boolean;
    mentions: DiscordMessageUser[];
    mention_roles: string[];
    mention_channels?: DiscordMessageMentionChannel[];
    attachments: DiscordMessageAttachment[];
    embeds: DiscordMessageEmbed[];
    pinned: boolean;
    application?: DiscordMessageApplication | null | undefined;
    flags?: number | null | undefined;
    activity?: DiscordMessageActivity | null | undefined;
    nonce?: string | number | null | undefined;
    guild_id?: Snowflake | null | undefined;
    author?: DiscordMessageUser | null | undefined;
    member?: DiscordMessageMember | null | undefined;
    edited_timestamp?: string | null | undefined;
    reactions?: DiscordMessageReaction[] | null | undefined;
    webhook_id?: Snowflake | null | undefined;
    message_reference?: DiscordMessageReference | null | undefined;
    stickers?: unknown[] | null | undefined;
    referenced_message?: unknown;
  }
  interface DiscordVoiceChannel {
    type: 0 | 10 | 1 | 4 | 2 | 3 | 5 | 6 | 11 | 12 | 13 | 14 | 15 | -1;
    id: Snowflake;
    voice_states: VoiceUser[];
    messages: VoiceChatMessage[];
    name?: string | null | undefined;
    guild_id?: string | null | undefined;
    position?: number | null | undefined;
    topic?: string | null | undefined;
    bitrate?: number | null | undefined;
    user_limit?: number | null | undefined;
  };
  interface Guild extends DiscordAPI.Guild {
    channels: {
      [channelId: Snowflake]: Channel;
    }
  }

  interface VoiceChannel extends DiscordAPI.Channel {
    type: 2;
  }
  interface ChannelCategory extends DiscordAPI.Channel {
    type: 4;
  }

  enum ActivityLocationKind {
    PrivateChannel = "pc",
    GuildChannel = "gc",
  }
  interface ActivityLocationData {
    id: Snowflake;
    kind: ActivityLocationKind;
    channel_id: Snowflake;
    guild_id: Snowflake;
  }
  interface ActivityInstance {
    application_id: Snowflake;
    instance_id: Snowflake;
    launch_id: Snowflake;
    location: ActivityLocationData;
    users: Snowflake[],
  }
  interface DataResponse<T> {
    ok: true;
    data: T;
    error?: string;
  }
  interface ErrorResponse<T> {
    ok: false;
    error: string;
    data?: T;
  }
  type APIResponse<T> = DataResponse<T> | ErrorResponse<T>;
  interface DatabaseRequest<T = undefined> extends BaseRequest<T> {
    root?: "guilds" | "users";
    guildId?: string;
    userId?: string;
    channelId?: string;
    privateId?: string;
    messageId?: string;
    wantsDocs?: true;
    kind?: "privates" | "messages";
    data?: T;
    method?: "GET" | "POST";
    passcode?: Passcode;
    inviteCode?: InviteCode;
  }
  type BuildSegmentsArgs = [guildId: string, channelId?: string, privateId?: string, messageId?: string, mode?: "messages"] | [guildId: string, channelId: string, messageId: string, mode: "messages"] | [guildId: string] | [guildId: string, channelId: string, docs?: true] | [guildId: string, channelId: string, privateId: string, docs?: true] | [guildId: string, channelId: string, privateId: string, messageId: string] | [...args: string[]];

  type iDiscordSDK = import("@discord/embedded-app-sdk").DiscordSDK;

  interface SDK extends iDiscordSDK {
    guildId: Snowflake | null;
    channelId: Snowflake | null;
  }

  interface Discord {
    sdk: SDK;
    auth: Authenticated;
    guild: Guild;
    channel: Channel;
    activity: ActivityInstance;
  }
  interface TokenReturn {
    access_token: string;
    expires_in: string;
    token_type: string;
    scope: string;
  }
  namespace DiscordAPI {
    // Discord commonly sends IDs as strings, not numbers.
    export type ISO8601Timestamp = string;
    export type PermissionBitSet = string;

    // =============================================================
    // Guild enum-like values
    // =============================================================

    export enum DefaultMessageNotificationLevel {
      ALL_MESSAGES = 0,
      ONLY_MENTIONS = 1,
    }

    export enum ExplicitContentFilterLevel {
      DISABLED = 0,
      MEMBERS_WITHOUT_ROLES = 1,
      ALL_MEMBERS = 2,
    }

    export enum MFALevel {
      NONE = 0,
      ELEVATED = 1,
    }

    export enum VerificationLevel {
      NONE = 0,
      LOW = 1,
      MEDIUM = 2,
      HIGH = 3,
      VERY_HIGH = 4,
    }

    export enum GuildNSFWLevel {
      DEFAULT = 0,
      EXPLICIT = 1,
      SAFE = 2,
      AGE_RESTRICTED = 3,
    }

    export enum PremiumTier {
      NONE = 0,
      TIER_1 = 1,
      TIER_2 = 2,
      TIER_3 = 3,
    }

    // =============================================================
    // System Channel Flags
    // =============================================================

    /**
     * System channel flags are combined into one number using bitwise OR.
     *
     * Example:
     * const flags = SystemChannelFlag.SUPPRESS_JOIN_NOTIFICATIONS | SystemChannelFlag.SUPPRESS_PREMIUM_SUBSCRIPTIONS;
     */
    export enum SystemChannelFlag {
      SUPPRESS_JOIN_NOTIFICATIONS = 1 << 0,
      SUPPRESS_PREMIUM_SUBSCRIPTIONS = 1 << 1,
      SUPPRESS_GUILD_REMINDER_NOTIFICATIONS = 1 << 2,
      SUPPRESS_JOIN_NOTIFICATION_REPLIES = 1 << 3,
      SUPPRESS_ROLE_SUBSCRIPTION_PURCHASE_NOTIFICATIONS = 1 << 4,
      SUPPRESS_ROLE_SUBSCRIPTION_PURCHASE_NOTIFICATION_REPLIES = 1 << 5,
    }

    export type SystemChannelFlags = number;

    // ----------------------
    // Guild
    // ----------------------

    export interface Guild {
      id: Snowflake;
      name: string;
      icon: string | null;
      icon_hash?: string | null;
      splash: string | null;
      discovery_splash: string | null;

      owner?: boolean;
      owner_id: Snowflake;
      permissions?: PermissionBitSet;

      region?: string | null;

      afk_channel_id: Snowflake | null;
      afk_timeout: number;

      widget_enabled?: boolean;
      widget_channel_id?: Snowflake | null;

      verification_level: VerificationLevel;
      default_message_notifications: DefaultMessageNotificationLevel;
      explicit_content_filter: ExplicitContentFilterLevel;

      roles: Role[];
      emojis: Emoji[];
      features: GuildFeature[];

      mfa_level: MFALevel;
      application_id: Snowflake | null;

      system_channel_id: Snowflake | null;
      system_channel_flags: SystemChannelFlags;

      rules_channel_id: Snowflake | null;

      max_presences?: number | null;
      max_members?: number;

      vanity_url_code: string | null;
      description: string | null;
      banner: string | null;

      premium_tier: PremiumTier;
      premium_subscription_count?: number;

      preferred_locale: string;
      public_updates_channel_id: Snowflake | null;

      max_video_channel_users?: number;
      max_stage_video_channel_users?: number;

      approximate_member_count?: number;
      approximate_presence_count?: number;

      welcome_screen?: WelcomeScreen;

      nsfw_level: GuildNSFWLevel;

      stickers?: Sticker[];

      premium_progress_bar_enabled: boolean;
      safety_alerts_channel_id: Snowflake | null;

      incidents_data: IncidentsData | null;
    }

    // ----------------------
    // Incidents Data
    // ----------------------

    export interface IncidentsData {
      invites_disabled_until: ISO8601Timestamp | null;
      dms_disabled_until: ISO8601Timestamp | null;
      dm_spam_detected_at?: ISO8601Timestamp | null;
      raid_detected_at?: ISO8601Timestamp | null;
    }

    // ----------------------
    // Stickers
    // ----------------------

    export enum StickerType {
      STANDARD = 1,
      GUILD = 2,
    }

    export enum StickerFormatType {
      PNG = 1,
      APNG = 2,
      LOTTIE = 3,
      GIF = 4,
    }

    export interface Sticker {
      id: Snowflake;
      pack_id?: Snowflake;

      name: string;
      description: string | null;
      tags: string;

      type: StickerType;
      format_type: StickerFormatType;

      available?: boolean;
      guild_id?: Snowflake;

      user?: User;

      sort_value?: number;
    }

    // ----------------------
    // Welcome Screen
    // ----------------------

    export interface WelcomeScreen {
      description: string | null;
      welcome_channels: WelcomeScreenChannel[];
    }

    export interface WelcomeScreenChannel {
      channel_id: Snowflake;
      description: string;
      emoji_id: Snowflake | null;
      emoji_name: string | null;
    }

    // ----------------------
    // Guild Features
    // ----------------------

    export type GuildFeature =
      | "ANIMATED_BANNER"
      | "ANIMATED_ICON"
      | "APPLICATION_COMMAND_PERMISSIONS_V2"
      | "AUTO_MODERATION"
      | "BANNER"
      | "COMMUNITY"
      | "CREATOR_MONETIZABLE_PROVISIONAL"
      | "CREATOR_STORE_PAGE"
      | "DEVELOPER_SUPPORT_SERVER"
      | "DISCOVERABLE"
      | "FEATURABLE"
      | "INVITES_DISABLED"
      | "INVITE_SPLASH"
      | "MEMBER_VERIFICATION_GATE_ENABLED"
      | "MORE_SOUNDBOARD"
      | "MORE_STICKERS"
      | "NEWS"
      | "PARTNERED"
      | "PREVIEW_ENABLED"
      | "RAID_ALERTS_DISABLED"
      | "ROLE_ICONS"
      | "ROLE_SUBSCRIPTIONS_AVAILABLE_FOR_PURCHASE"
      | "ROLE_SUBSCRIPTIONS_ENABLED"
      | "SOUNDBOARD"
      | "TICKETED_EVENTS_ENABLED"
      | "VANITY_URL"
      | "VERIFIED"
      | "VIP_REGIONS"
      | "WELCOME_SCREEN_ENABLED"
      | "GUESTS_ENABLED"
      | "GUILD_TAGS"
      | "ENHANCED_ROLE_COLORS";

    export type MutableGuildFeature =
      | "COMMUNITY"
      | "DISCOVERABLE"
      | "INVITES_DISABLED"
      | "RAID_ALERTS_DISABLED";

    // ----------------------
    // Roles
    // ----------------------

    export interface Role {
      id: Snowflake;
      name: string;

      /**
       * Deprecated Discord field.
       * Prefer `colors.primary_color`.
       */
      color: number;

      colors: RoleColors;

      hoist: boolean;

      icon?: string | null;
      unicode_emoji?: string | null;

      position: number;
      permissions: PermissionBitSet;

      managed: boolean;
      mentionable: boolean;

      tags?: RoleTags;

      flags: number;
    }

    export interface RoleTags {
      bot_id?: Snowflake;
      integration_id?: Snowflake;

      /**
       * Null means true.
       * Missing means false.
       */
      premium_subscriber?: null;

      subscription_listing_id?: Snowflake;

      /**
       * Null means true.
       * Missing means false.
       */
      available_for_purchase?: null;

      /**
       * Null means true.
       * Missing means false.
       */
      guild_connections?: null;
    }

    export interface RoleColors {
      primary_color: number;
      secondary_color: number | null;
      tertiary_color: number | null;
    }

    // ----------------------
    // Emojis
    // ----------------------

    export interface Emoji {
      id: Snowflake | null;
      name: string | null;

      roles?: Snowflake[];

      user?: User;

      require_colons?: boolean;
      managed?: boolean;
      animated?: boolean;
      available?: boolean;
    }

    // ----------------------
    // User
    // ----------------------

    export enum PremiumType {
      NONE = 0,
      NITRO_CLASSIC = 1,
      NITRO = 2,
      NITRO_BASIC = 3,
    }

    export interface User {
      id: Snowflake;

      username: string;
      discriminator: string;

      global_name: string | null;
      avatar: string | null;

      bot?: boolean;
      system?: boolean;

      mfa_enabled?: boolean;

      banner?: string | null;
      accent_color?: number | null;

      locale?: string;

      verified?: boolean;
      email?: string | null;

      flags?: number;
      premium_type?: PremiumType;
      public_flags?: number;

      avatar_decoration_data?: AvatarDecorationData | null;

      collectibles?: Collectibles | null;

      primary_guild?: UserPrimaryGuild | null;
    }

    export interface AvatarDecorationData {
      asset: string;
      sku_id: Snowflake;
    }

    export interface Collectibles {
      nameplate?: Nameplate;
    }

    export interface Nameplate {
      sku_id: Snowflake;
      asset: string;
      label: string;
      palette: NameplatePalette;
    }

    export type NameplatePalette =
      | "crimson"
      | "berry"
      | "sky"
      | "teal"
      | "forest"
      | "bubble_gum"
      | "violet"
      | "cobalt"
      | "clover"
      | "lemon"
      | "white";

    export interface UserPrimaryGuild {
      identity_guild_id: Snowflake | null;
      identity_enabled: boolean | null;
      tag: string | null;
      badge: string | null;
    }

    // ----------------------
    // Channel
    // ----------------------

    export interface Channel {
      id: Snowflake;
      type: ChannelType;

      guild_id?: Snowflake;
      position?: number;

      permission_overwrites?: Overwrite[];

      name?: string | null;
      topic?: string | null;
      nsfw?: boolean;

      last_message_id?: Snowflake | null;

      bitrate?: number;
      user_limit?: number;

      rate_limit_per_user?: number;

      recipients?: User[];

      icon?: string | null;

      owner_id?: Snowflake;
      application_id?: Snowflake;

      managed?: boolean;

      parent_id?: Snowflake | null;

      last_pin_timestamp?: ISO8601Timestamp | null;

      rtc_region?: string | null;
      video_quality_mode?: VideoQualityMode;

      message_count?: number;
      member_count?: number;

      thread_metadata?: ThreadMetadata;
      member?: ThreadMember;

      default_auto_archive_duration?: AutoArchiveDuration;

      permissions?: PermissionBitSet;

      flags?: number;

      total_message_sent?: number;

      available_tags?: ForumTag[];
      applied_tags?: Snowflake[];

      default_reaction_emoji?: DefaultReaction | null;

      default_thread_rate_limit_per_user?: number;

      default_sort_order?: SortOrderType | null;

      default_forum_layout?: ForumLayoutType;
    }

    // ----------------------
    // Channel Types
    // ----------------------

    export enum ChannelType {
      GUILD_TEXT = 0,
      DM = 1,
      GUILD_VOICE = 2,
      GROUP_DM = 3,
      GUILD_CATEGORY = 4,
      GUILD_ANNOUNCEMENT = 5,
      ANNOUNCEMENT_THREAD = 10,
      PUBLIC_THREAD = 11,
      PRIVATE_THREAD = 12,
      GUILD_STAGE_VOICE = 13,
      GUILD_DIRECTORY = 14,
      GUILD_FORUM = 15,
      GUILD_MEDIA = 16,
    }

    // ----------------------
    // Video Quality
    // ----------------------

    export enum VideoQualityMode {
      AUTO = 1,
      FULL = 2,
    }

    // ----------------------
    // Channel Flags
    // ----------------------

    export enum ChannelFlag {
      PINNED = 1 << 1,
      REQUIRE_TAG = 1 << 4,
      HIDE_MEDIA_DOWNLOAD_OPTIONS = 1 << 15,
    }

    // ----------------------
    // Forum Sorting / Layout
    // ----------------------

    export enum SortOrderType {
      LATEST_ACTIVITY = 0,
      CREATION_DATE = 1,
    }

    export enum ForumLayoutType {
      NOT_SET = 0,
      LIST_VIEW = 1,
      GALLERY_VIEW = 2,
    }

    // ----------------------
    // Permission Overwrites
    // ----------------------

    export interface Overwrite {
      id: Snowflake;
      type: OverwriteType;
      allow: PermissionBitSet;
      deny: PermissionBitSet;
    }

    export enum OverwriteType {
      ROLE = 0,
      MEMBER = 1,
    }

    // ----------------------
    // Threads
    // ----------------------

    export interface ThreadMetadata {
      archived: boolean;

      auto_archive_duration: AutoArchiveDuration;

      archive_timestamp: ISO8601Timestamp;

      locked: boolean;

      invitable?: boolean;

      create_timestamp?: ISO8601Timestamp | null;
    }

    export type AutoArchiveDuration = 60 | 1440 | 4320 | 10080;

    export interface ThreadMember {
      id?: Snowflake;
      user_id?: Snowflake;

      join_timestamp: ISO8601Timestamp;

      flags: number;

      member?: GuildMember;
    }

    // ----------------------
    // Guild Member
    // ----------------------

    export interface GuildMember {
      user?: User;

      nick?: string | null;

      avatar?: string | null;
      banner?: string | null;

      roles: Snowflake[];

      joined_at: ISO8601Timestamp | null;

      premium_since?: ISO8601Timestamp | null;

      deaf: boolean;
      mute: boolean;

      flags: number;

      pending?: boolean;

      permissions?: PermissionBitSet;

      communication_disabled_until?: ISO8601Timestamp | null;

      avatar_decoration_data?: AvatarDecorationData | null;

      collectibles?: Collectibles | null;
    }

    export interface GuildPreview {
      id: Snowflake;
      name: string;
      icon: ImageHash | null;
      splash: ImageHash | null;
      discovery_splash: ImageHash | null;
      emojis: Emoji[];
      features: GuildFeature[];
      approximate_member_count: number;
      approximate_presence_count: number;
      description: string | null;
      stickers: Sticker[];
    }

    // ----------------------
    // Forum Tags
    // ----------------------

    export interface ForumTag {
      id: Snowflake;
      name: string;

      moderated: boolean;

      emoji_id: Snowflake | null;
      emoji_name: string | null;
    }

    // ----------------------
    // Default Reaction
    // ----------------------

    export type DefaultReaction =
      | {
      emoji_id: Snowflake;
      emoji_name: null;
    } | {
      emoji_id: null;
      emoji_name: string;
      };

    export enum MessageReferenceType {
      DEFAULT = 0,
      FORWARD = 1,
    }

    export interface MessageReference {
      type?: MessageReferenceType;
      message_id?: Snowflake;
      channel_id?: Snowflake;
      guild_id?: Snowflake;
      fail_if_not_exists?: boolean;
    }

    export enum EmbedType {
      RICH = "rich",
      IMAGE = "image",
      VIDEO = "video",
      GIFV = "gifv",
      ARTICLE = "article",
      LINK = "link",
      POLL_RESULT = "poll_result",
    }

    export enum EmbedFlags {
      IS_CONTENT_INVENTORY_ENTRY = 1 << 5,
    }

    export enum EmbedMediaFlags {
      IS_ANIMATED = 1 << 5,
    }

    export interface Embed {
      title?: string;
      type?: EmbedType;
      description?: string;
      url?: string;
      timestamp?: ISO8601Timestamp;
      color?: number;
      footer?: EmbedFooter;
      image?: EmbedImage;
      thumbnail?: EmbedImage;
      video?: EmbedVideo;
      provider?: EmbedProvider;
      author?: EmbedAuthor;
      fields?: EmbedField[];
      flags?: number;
    }

    export interface EmbedVideo {
      url?: string;
      proxy_url?: string;
      height?: number;
      width?: number;
      content_type?: string;
      placeholder?: string;
      placeholder_version?: number;
      description?: string;
      flags?: number;
    }

    export interface EmbedImage {
      url: string;
      proxy_url?: string;
      height?: number;
      width?: number;
      content_type?: string;
      placeholder?: string;
      placeholder_version?: number;
      description?: string;
      flags?: number;
    }

    export interface EmbedProvider {
      name?: string;
      url?: string;
    }

    export interface EmbedAuthor {
      name: string;
      url?: string;
      icon_url?: string;
      proxy_icon_url?: string;
    }

    export interface EmbedFooter {
      text: string;
      icon_url?: string;
      proxy_icon_url?: string;
    }

    export interface EmbedField {
      name: string;
      value: string;
      inline?: boolean;
    }
    export enum AttachmentFlags {
      IS_CLIP = 1 << 0,
      IS_THUMBNAIL = 1 << 1,
      IS_REMIX = 1 << 2,
      IS_SPOILER = 1 << 3,
      IS_ANIMATED = 1 << 5,
    }

    export interface Attachment {
      id: Snowflake;
      filename: string;
      title?: string;
      description?: string;
      content_type?: string;
      size: number;
      url: string;
      proxy_url: string;
      height?: number | null;
      width?: number | null;
      placeholder?: string;
      placeholder_version?: number;
      ephemeral?: boolean;
      duration_secs?: number;
      waveform?: string;
      flags?: number;

      // Discord docs say this is an array of user objects.
      // Replace `DiscordUser` with your actual User type.
      clip_participants?: DiscordAPI.User[];

      clip_created_at?: ISO8601Timestamp;

      // Replace `Application` with your actual Application type.
      application?: Application | null;
    }

    export interface ChannelMention {
      id: Snowflake;
      guild_id: Snowflake;
      type: number;
      name: string;
    }

    export type ISO8601Timestamp = string;

    export enum MessageType {
      DEFAULT = 0,
      RECIPIENT_ADD = 1,
      RECIPIENT_REMOVE = 2,
      CALL = 3,
      CHANNEL_NAME_CHANGE = 4,
      CHANNEL_ICON_CHANGE = 5,
      CHANNEL_PINNED_MESSAGE = 6,
      USER_JOIN = 7,
      GUILD_BOOST = 8,
      GUILD_BOOST_TIER_1 = 9,
      GUILD_BOOST_TIER_2 = 10,
      GUILD_BOOST_TIER_3 = 11,
      CHANNEL_FOLLOW_ADD = 12,
      GUILD_DISCOVERY_DISQUALIFIED = 14,
      GUILD_DISCOVERY_REQUALIFIED = 15,
      GUILD_DISCOVERY_GRACE_PERIOD_INITIAL_WARNING = 16,
      GUILD_DISCOVERY_GRACE_PERIOD_FINAL_WARNING = 17,
      THREAD_CREATED = 18,
      REPLY = 19,
      CHAT_INPUT_COMMAND = 20,
      THREAD_STARTER_MESSAGE = 21,
      GUILD_INVITE_REMINDER = 22,
      CONTEXT_MENU_COMMAND = 23,
      AUTO_MODERATION_ACTION = 24,
      ROLE_SUBSCRIPTION_PURCHASE = 25,
      INTERACTION_PREMIUM_UPSELL = 26,
      STAGE_START = 27,
      STAGE_END = 28,
      STAGE_SPEAKER = 29,
      STAGE_TOPIC = 31,
      GUILD_APPLICATION_PREMIUM_SUBSCRIPTION = 32,
      GUILD_INCIDENT_ALERT_MODE_ENABLED = 36,
      GUILD_INCIDENT_ALERT_MODE_DISABLED = 37,
      GUILD_INCIDENT_REPORT_RAID = 38,
      GUILD_INCIDENT_REPORT_FALSE_ALARM = 39,
      PURCHASE_NOTIFICATION = 44,
      POLL_RESULT = 46,
    }

    export enum MessageActivityType {
      JOIN = 1,
      SPECTATE = 2,
      LISTEN = 3,
      JOIN_REQUEST = 5,
    }

    export enum MessageFlags {
      CROSSPOSTED = 1 << 0,
      IS_CROSSPOST = 1 << 1,
      SUPPRESS_EMBEDS = 1 << 2,
      SOURCE_MESSAGE_DELETED = 1 << 3,
      URGENT = 1 << 4,
      HAS_THREAD = 1 << 5,
      EPHEMERAL = 1 << 6,
      LOADING = 1 << 7,
      FAILED_TO_MENTION_SOME_ROLES_IN_THREAD = 1 << 8,
      SUPPRESS_NOTIFICATIONS = 1 << 12,
      IS_VOICE_MESSAGE = 1 << 13,
      HAS_SNAPSHOT = 1 << 14,
      IS_COMPONENTS_V2 = 1 << 15,
    }

    export interface Message {
      id: Snowflake;
      channel_id: Snowflake;
      author: DiscordAPI.User;
      content: string;
      timestamp: ISO8601Timestamp;
      edited_timestamp: ISO8601Timestamp | null;
      tts: boolean;
      mention_everyone: boolean;
      mentions: DiscordAPI.User[];
      mention_roles: Snowflake[];
      mention_channels?: ChannelMention[];
      attachments: Attachment[];
      embeds: Embed[];
      reactions?: Reaction[];
      nonce?: number | string;
      pinned: boolean;
      webhook_id?: Snowflake;
      type: MessageType;
      activity?: MessageActivity;
      application?: Partial<Application>;
      application_id?: Snowflake;
      flags?: number;
      message_reference?: MessageReference;
      message_snapshots?: MessageSnapshot[];
      referenced_message?: Message | null;
      interaction_metadata?: MessageInteractionMetadata;
      interaction?: MessageInteraction;
      thread?: Channel;
      components?: MessageComponent[];
      sticker_items?: MessageStickerItem[];
      stickers?: Sticker[];
      position?: number;
      role_subscription_data?: RoleSubscriptionData;
      resolved?: ResolvedData;
      poll?: Poll;
      call?: MessageCall;
      shared_client_theme?: SharedClientTheme;
    }

    export interface MessageActivity {
      type: MessageActivityType;
      party_id?: string;
    }

    /* ============================================================
        Message Snapshot Object
       ============================================================ */

    export interface MessageSnapshot {
      message: MessageSnapshotMessage;
    }

    export interface MessageSnapshotMessage {
      type: MessageType;
      content: string;
      embeds: Embed[];
      attachments: Attachment[];
      timestamp: ISO8601Timestamp;
      edited_timestamp: ISO8601Timestamp | null;
      flags?: number;
      mentions: DiscordAPI.User[];
      mention_roles: Snowflake[];
      stickers?: Sticker[];
      sticker_items?: MessageStickerItem[];
      components?: MessageComponent[];
    }

    /* ============================================================
       Message Activity Object
       ============================================================ */

    export interface MessageActivity {
      type: MessageActivityType;
      party_id?: string;
    }

    export enum MessageActivityType {
      JOIN = 1,
      SPECTATE = 2,
      LISTEN = 3,
      JOIN_REQUEST = 5,
    }

    /* ============================================================
       Message Reference Object
       ============================================================ */

    export interface MessageReference {
      type?: MessageReferenceType;
      message_id?: Snowflake;
      channel_id?: Snowflake;
      guild_id?: Snowflake;
      fail_if_not_exists?: boolean;
    }

    export enum MessageReferenceType {
      DEFAULT = 0,
      FORWARD = 1,
    }

    /* ============================================================
       Message Call Object
       ============================================================ */

    export interface MessageCall {
      participants: Snowflake[];
      ended_timestamp?: ISO8601Timestamp | null;
    }

    /* ============================================================
       Message Interaction Metadata Object
       ============================================================ */

    export type MessageInteractionMetadata =
      | ApplicationCommandInteractionMetadata
      | MessageComponentInteractionMetadata
      | ModalSubmitInteractionMetadata;

    export interface BaseInteractionMetadata {
      id: Snowflake;
      type: InteractionType;
      user: DiscordAPI.User;
      authorizing_integration_owners: AuthorizingIntegrationOwners;
      original_response_message_id?: Snowflake;
    }

    export interface ApplicationCommandInteractionMetadata
      extends BaseInteractionMetadata {
      target_user?: DiscordAPI.User;
      target_message_id?: Snowflake;
    }

    export interface MessageComponentInteractionMetadata
      extends BaseInteractionMetadata {
      interacted_message_id: Snowflake;
    }

    export interface ModalSubmitInteractionMetadata
      extends BaseInteractionMetadata {
      triggering_interaction_metadata:
        | ApplicationCommandInteractionMetadata
        | MessageComponentInteractionMetadata;
    }

    export enum InteractionType {
      PING = 1,
      APPLICATION_COMMAND = 2,
      MESSAGE_COMPONENT = 3,
      APPLICATION_COMMAND_AUTOCOMPLETE = 4,
      MODAL_SUBMIT = 5,
    }

    export type ApplicationIntegrationType = 0 | 1;

    export type AuthorizingIntegrationOwners = Partial<
      Record<ApplicationIntegrationType, Snowflake>
    >;

    /**
     * Deprecated. Discord prefers `interaction_metadata`.
     */
    export interface MessageInteraction {
      id: Snowflake;
      type: InteractionType;
      name: string;
      user: DiscordAPI.User;
      member?: GuildMember;
    }

    /* ============================================================
       Reaction Object
       ============================================================ */

    export interface Reaction {
      count: number;
      count_details: ReactionCountDetails;
      me: boolean;
      me_burst: boolean;
      emoji: PartialEmoji;
      burst_colors: HexColor[];
    }

    export interface ReactionCountDetails {
      burst: number;
      normal: number;
    }

    export interface RoleSubscriptionData {
      role_subscription_listing_id: Snowflake;
      tier_name: string;
      total_months_subscribed: number;
      is_renewal: boolean;
    }

    export interface ResolvedData {
      users?: Record<Snowflake, DiscordAPI.User>;
      members?: Record<Snowflake, GuildMember>;
      roles?: Record<Snowflake, Role>;
      channels?: Record<Snowflake, Channel>;
      messages?: Record<Snowflake, Message>;
      attachments?: Record<Snowflake, Attachment>;
    }


    export interface Poll {
      question: PollMedia;
      answers: PollAnswer[];
      expiry?: ISO8601Timestamp | null;
      allow_multiselect: boolean;
      layout_type: PollLayoutType;
      results?: PollResults;
    }

    export interface PollMedia {
      text?: string;
      emoji?: PartialEmoji;
    }

    export interface PollAnswer {
      answer_id: number;
      poll_media: PollMedia;
    }

    export enum PollLayoutType {
      DEFAULT = 1,
    }

    export interface PollResults {
      is_finalized: boolean;
      answer_counts: PollAnswerCount[];
    }

    export interface PollAnswerCount {
      id: number;
      count: number;
      me_voted: boolean;
    }

    export interface SharedClientTheme {
      primary_color: number;
      secondary_color: number;
    }

    export interface MessageStickerItem {
      id: Snowflake;
      name: string;
      format_type: StickerFormatType;
    }

    /* ============================================================
       Message Components
       ============================================================ */

    export type MessageComponent =
      | ActionRowComponent
      | ButtonComponent
      | StringSelectComponent
      | UserSelectComponent
      | RoleSelectComponent
      | MentionableSelectComponent
      | ChannelSelectComponent
      | SectionComponent
      | TextDisplayComponent
      | ThumbnailComponent
      | MediaGalleryComponent
      | FileComponent
      | SeparatorComponent
      | ContainerComponent;

    /**
     * Components mostly share:
     * - type: tells Discord what component this is
     * - id: optional internal numeric identifier
     */
    export interface BaseComponent {
      type: ComponentType;
      id?: number;
    }

    export enum ComponentType {
      ACTION_ROW = 1,
      BUTTON = 2,
      STRING_SELECT = 3,
      TEXT_INPUT = 4,
      USER_SELECT = 5,
      ROLE_SELECT = 6,
      MENTIONABLE_SELECT = 7,
      CHANNEL_SELECT = 8,
      SECTION = 9,
      TEXT_DISPLAY = 10,
      THUMBNAIL = 11,
      MEDIA_GALLERY = 12,
      FILE = 13,
      SEPARATOR = 14,
      CONTAINER = 17,
      LABEL = 18,
      FILE_UPLOAD = 19,
      RADIO_GROUP = 21,
      CHECKBOX_GROUP = 22,
      CHECKBOX = 23,
    }

    /* ============================================================
       Action Row
       ============================================================ */

    export interface ActionRowComponent extends BaseComponent {
      type: ComponentType.ACTION_ROW;
      components: ActionRowChildComponent[];
    }

    export type ActionRowChildComponent =
      | ButtonComponent
      | StringSelectComponent
      | UserSelectComponent
      | RoleSelectComponent
      | MentionableSelectComponent
      | ChannelSelectComponent;

    /* ============================================================
       Button
       ============================================================ */

    export type ButtonComponent =
      | InteractiveButtonComponent
      | LinkButtonComponent
      | PremiumButtonComponent;

    export interface BaseButtonComponent extends BaseComponent {
      type: ComponentType.BUTTON;
      style: ButtonStyle;
      label?: string;
      emoji?: PartialEmoji;
      disabled?: boolean;
    }

    export interface InteractiveButtonComponent extends BaseButtonComponent {
      style:
        | ButtonStyle.PRIMARY
        | ButtonStyle.SECONDARY
        | ButtonStyle.SUCCESS
        | ButtonStyle.DANGER;
      custom_id: string;
      url?: never;
      sku_id?: never;
    }

    export interface LinkButtonComponent extends BaseButtonComponent {
      style: ButtonStyle.LINK;
      url: string;
      custom_id?: never;
      sku_id?: never;
    }

    export interface PremiumButtonComponent extends BaseButtonComponent {
      style: ButtonStyle.PREMIUM;
      sku_id: Snowflake;
      custom_id?: never;
      url?: never;
      label?: never;
      emoji?: never;
    }

    export enum ButtonStyle {
      PRIMARY = 1,
      SECONDARY = 2,
      SUCCESS = 3,
      DANGER = 4,
      LINK = 5,
      PREMIUM = 6,
    }

    /* ============================================================
       Select Menus
       ============================================================ */

    export interface BaseSelectComponent extends BaseComponent {
      custom_id: string;
      placeholder?: string;
      min_values?: number;
      max_values?: number;
      required?: boolean;
      disabled?: boolean;
    }

    export interface StringSelectComponent extends BaseSelectComponent {
      type: ComponentType.STRING_SELECT;
      options: SelectOption[];
    }

    export interface SelectOption {
      label: string;
      value: string;
      description?: string;
      emoji?: PartialEmoji;
      default?: boolean;
    }

    export interface UserSelectComponent extends BaseSelectComponent {
      type: ComponentType.USER_SELECT;
      default_values?: SelectDefaultValue[];
    }

    export interface RoleSelectComponent extends BaseSelectComponent {
      type: ComponentType.ROLE_SELECT;
      default_values?: SelectDefaultValue[];
    }

    export interface MentionableSelectComponent extends BaseSelectComponent {
      type: ComponentType.MENTIONABLE_SELECT;
      default_values?: SelectDefaultValue[];
    }

    export interface ChannelSelectComponent extends BaseSelectComponent {
      type: ComponentType.CHANNEL_SELECT;
      channel_types?: ChannelType[];
      default_values?: SelectDefaultValue[];
    }

    export interface SelectDefaultValue {
      id: Snowflake;
      type: "user" | "role" | "channel";
    }

    /* ============================================================
       Text Input
       Usually used in modals, not normal messages.
       ============================================================ */

    export interface TextInputComponent extends BaseComponent {
      type: ComponentType.TEXT_INPUT;
      custom_id: string;
      style: TextInputStyle;
      label?: string;
      min_length?: number;
      max_length?: number;
      required?: boolean;
      value?: string;
      placeholder?: string;
    }

    export enum TextInputStyle {
      SHORT = 1,
      PARAGRAPH = 2,
    }

    /* ============================================================
       Components V2 Layout / Content Components
       ============================================================ */

    export interface SectionComponent extends BaseComponent {
      type: ComponentType.SECTION;
      components: TextDisplayComponent[];
      accessory: ButtonComponent | ThumbnailComponent;
    }

    export interface TextDisplayComponent extends BaseComponent {
      type: ComponentType.TEXT_DISPLAY;
      content: string;
    }

    export interface ThumbnailComponent extends BaseComponent {
      type: ComponentType.THUMBNAIL;
      media: UnfurledMediaItem;
      description?: string;
      spoiler?: boolean;
    }

    export interface MediaGalleryComponent extends BaseComponent {
      type: ComponentType.MEDIA_GALLERY;
      items: MediaGalleryItem[];
    }

    export interface MediaGalleryItem {
      media: UnfurledMediaItem;
      description?: string;
      spoiler?: boolean;
    }

    export interface FileComponent extends BaseComponent {
      type: ComponentType.FILE;
      file: UnfurledMediaItem;
      spoiler?: boolean;
    }

    export interface SeparatorComponent extends BaseComponent {
      type: ComponentType.SEPARATOR;
      divider?: boolean;
      spacing?: SeparatorSpacing;
    }

    export enum SeparatorSpacing {
      SMALL = 1,
      LARGE = 2,
    }

    export interface ContainerComponent extends BaseComponent {
      type: ComponentType.CONTAINER;
      components: ContainerChildComponent[];
      accent_color?: number | null;
      spoiler?: boolean;
    }

    export type ContainerChildComponent =
      | ActionRowComponent
      | TextDisplayComponent
      | SectionComponent
      | MediaGalleryComponent
      | SeparatorComponent
      | FileComponent;

    export interface UnfurledMediaItem {
      url: string;
      proxy_url?: string;
      height?: number;
      width?: number;
      content_type?: string;
    }

    /* ============================================================
       Modal Components
       Not usually inside Message.components, but useful to keep here.
       ============================================================ */

    export type ModalComponent =
      | TextDisplayComponent
      | LabelComponent;

    export interface LabelComponent extends BaseComponent {
      type: ComponentType.LABEL;
      label: string;
      description?: string;
      component: LabelChildComponent;
    }

    export type LabelChildComponent =
      | TextInputComponent
      | StringSelectComponent
      | UserSelectComponent
      | RoleSelectComponent
      | MentionableSelectComponent
      | ChannelSelectComponent
      | FileUploadComponent
      | RadioGroupComponent
      | CheckboxGroupComponent
      | CheckboxComponent;

    export interface FileUploadComponent extends BaseComponent {
      type: ComponentType.FILE_UPLOAD;
      custom_id: string;
      min_values?: number;
      max_values?: number;
      required?: boolean;
    }

    export interface RadioGroupComponent extends BaseComponent {
      type: ComponentType.RADIO_GROUP;
      custom_id: string;
      options: RadioGroupOption[];
      required?: boolean;
    }

    export interface RadioGroupOption {
      label: string;
      value: string;
      description?: string;
      emoji?: PartialEmoji;
      default?: boolean;
    }

    export interface CheckboxGroupComponent extends BaseComponent {
      type: ComponentType.CHECKBOX_GROUP;
      custom_id: string;
      options: CheckboxGroupOption[];
      min_values?: number;
      max_values?: number;
      required?: boolean;
    }

    export interface CheckboxGroupOption {
      label: string;
      value: string;
      description?: string;
      default?: boolean;
    }

    export interface CheckboxComponent extends BaseComponent {
      type: ComponentType.CHECKBOX;
      custom_id: string;
      label: string;
      required?: boolean;
      checked?: boolean;
    }

    /* ============================================================
       Application Object
       ============================================================ */

    export interface Application {
      id: Snowflake;
      name: string;
      icon: string | null;
      description: string;

      rpc_origins?: string[];

      bot_public: boolean;
      bot_require_code_grant: boolean;

      bot?: PartialUser;

      terms_of_service_url?: string;
      privacy_policy_url?: string;

      owner?: PartialUser;

      verify_key: string;

      team: Team | null;

      guild_id?: Snowflake;
      guild?: PartialGuild;

      primary_sku_id?: Snowflake;
      slug?: string;
      cover_image?: string;

      flags?: number;
      flags_new?: string;

      approximate_guild_count?: number;
      approximate_user_install_count?: number;
      approximate_user_authorization_count?: number;

      redirect_uris?: string[];

      interactions_endpoint_url?: string | null;
      role_connections_verification_url?: string | null;

      event_webhooks_url?: string | null;
      event_webhooks_status?: ApplicationEventWebhookStatus;
      event_webhooks_types?: string[];

      tags?: string[];

      install_params?: InstallParams;

      integration_types_config?: Partial<
        Record<ApplicationIntegrationType, ApplicationIntegrationTypeConfiguration>
      >;

      custom_install_url?: string;
    }

    /* ============================================================
       Partial Application
       Useful when Discord returns only part of the app object
       ============================================================ */

    export type PartialApplication = Partial<Application> & {
      id: Snowflake;
      name: string;
    };

    /* ============================================================
       Team Object
       ============================================================ */

    export interface Team {
      icon: string | null;
      id: Snowflake;
      members: TeamMember[];
      name: string;
      owner_user_id: Snowflake;
    }

    export interface TeamMember {
      membership_state: TeamMembershipState;
      team_id: Snowflake;
      user: PartialUser;
      role: string;
    }

    export enum TeamMembershipState {
      INVITED = 1,
      ACCEPTED = 2,
    }

    /* ============================================================
       Application Integration Types
       ============================================================ */

    export enum ApplicationIntegrationType {
      GUILD_INSTALL = 0,
      USER_INSTALL = 1,
    }

    export interface ApplicationIntegrationTypeConfiguration {
      oauth2_install_params?: InstallParams;
    }

    /* ============================================================
       Application Event Webhook Status
       ============================================================ */

    export enum ApplicationEventWebhookStatus {
      DISABLED = 1,
      ENABLED = 2,
      DISABLED_BY_DISCORD = 3,
    }

    /* ============================================================
       Application Flags
       ============================================================ */

    export enum ApplicationFlags {
      APPLICATION_AUTO_MODERATION_RULE_CREATE_BADGE = 1 << 6,
      GATEWAY_PRESENCE = 1 << 12,
      GATEWAY_PRESENCE_LIMITED = 1 << 13,
      GATEWAY_GUILD_MEMBERS = 1 << 14,
      GATEWAY_GUILD_MEMBERS_LIMITED = 1 << 15,
      VERIFICATION_PENDING_GUILD_LIMIT = 1 << 16,
      EMBEDDED = 1 << 17,
      GATEWAY_MESSAGE_CONTENT = 1 << 18,
      GATEWAY_MESSAGE_CONTENT_LIMITED = 1 << 19,
      APPLICATION_COMMAND_BADGE = 1 << 23,
    }

    /* ============================================================
       Install Params Object
       ============================================================ */

    export interface InstallParams {
      scopes: OAuth2Scope[];
      permissions: string;
    }

    /* ============================================================
       Shared Supporting Types
       ============================================================ */

    export interface PartialUser {
      id: Snowflake;
      username: string;
      discriminator?: string;
      global_name?: string | null;
      avatar?: string | null;
      bot?: boolean;
      system?: boolean;
      public_flags?: number;
    }

    export interface PartialGuild {
      id: Snowflake;
      name: string;
      icon?: string | null;
      splash?: string | null;
      discovery_splash?: string | null;
      features?: string[];
      approximate_member_count?: number;
      approximate_presence_count?: number;
    }

    /* ============================================================
       Voice State Object
       Represents a user's voice connection status
       ============================================================ */

    export interface VoiceState {
      /**
       * The guild this voice state belongs to.
       * Omitted in some contexts like certain gateway events.
       */
      guild_id?: Snowflake;

      /**
       * The voice/stage channel the user is connected to.
       * null = not connected to a voice channel.
       */
      channel_id: Snowflake | null;

      /**
       * The user this voice state belongs to.
       */
      user_id: Snowflake;

      /**
       * Guild member data for this user.
       * Usually included in guild voice events.
       */
      member?: GuildMember;

      /**
       * Unique voice session identifier.
       * Used internally by Discord voice systems.
       */
      session_id: string;

      /**
       * Server deafened.
       * Set by moderators/admins.
       */
      deaf: boolean;

      /**
       * Server muted.
       * Set by moderators/admins.
       */
      mute: boolean;

      /**
       * User locally deafened themselves.
       */
      self_deaf: boolean;

      /**
       * User locally muted themselves.
       */
      self_mute: boolean;

      /**
       * Whether the user is streaming via Go Live.
       */
      self_stream?: boolean;

      /**
       * Whether the user's webcam is enabled.
       */
      self_video: boolean;

      /**
       * Whether the user is suppressed.
       * Common in Stage Channels when audience members
       * are not allowed to speak.
       */
      suppress: boolean;

      /**
       * When the user requested to speak in a Stage Channel.
       * null if they have not requested to speak.
       */
      request_to_speak_timestamp: ISO8601Timestamp | null;
    }
  }
}
