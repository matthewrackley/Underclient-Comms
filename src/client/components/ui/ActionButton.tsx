export const IconFiles = {
  home: "./assets/home-button.svg",
  reset: "./assets/reset-button.svg",
  back: "./assets/back-button.svg",
  send: "./assets/send-button.svg",
  trashcan: "./assets/trashcan-button.svg",
  app: "./assets/underclient-app-icon.svg",
  botAvatar: "./assets/bot-avatar.svg",
  teamAvatar: "./assets/team-avatar-marack-dev.svg",
  chatBubble: "./assets/chat-bubble.svg",
  privateRoom: "./assets/private-room.svg",
  voiceChannel: "./assets/voice-channel.svg",
  livestream: "./assets/livestream.svg",
  currencyToken: "./assets/currency-token.svg",
  donationHeart: "./assets/donation-heart.svg",
  subscriptionStar: "./assets/subscription-star.svg",
  payPerViewTicket: "./assets/ppv-ticket.svg",
  moderationShield: "./assets/moderation-shield.svg",
  settingsSliders: "./assets/settings-sliders.svg",
} as const;

export type IconName = keyof typeof IconFiles;

export type ActionButtonProps = {
  name: IconName;
  size?: number;
  label?: string;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  type?: "button" | "submit"
};
export type IconProps = {
  name: IconName;
  size?: number;
  alt?: string;
  className?: string;
};

export function Icon({
  name,
  size = 32,
  alt = "",
  className,
}: IconProps) {
  return (
    <img
      src={IconFiles[name]}
      width={size}
      height={size}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
    />
  );
}

export function ActionButton({
  name,
  size = 44,
  label,
  className,
  onClick,
  disabled = false,
  type = "button"
}: ActionButtonProps) {
  return (
    <button
      type={type}
      aria-label={label ?? name}
      className={className}
      onClick={onClick}
      disabled={disabled}
      style={{
        width: size,
        height: size,
        padding: 0,
        border: "none",
        borderRadius: Math.round(size * 0.25),
        background: "transparent",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.55 : 1,
      }}
    >
      <img
        src={IconFiles[name]}
        width={size}
        height={size}
        alt=""
        aria-hidden="true"
        draggable={false}
      />
    </button>
  );
}
