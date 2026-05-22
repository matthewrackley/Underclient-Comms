import { discordAPI } from "./api";
import { dbClient } from "./api";
import { useEffect, useRef, useState } from "react";
import { Timestamp } from "firebase/firestore";

import {
	AppShell,
	ShellHeader,
	HeaderTitle,
	HeaderMeta,
	HeaderActions,
	ShellRail,
	ShellSidebar,
	SidebarSection,
	SidebarTitle,
	ShellContent,
	ContentHeader,
	ContentTitle,
	ContentSubtitle
} from "@/client/components/layout/AppShell";
import { Button, Card, CardTitle, CardMeta, AvatarWrap, PresenceDot } from "@/client/components/ui";
import { ServerList, ChannelList, CrossChannelTabs } from "@/client/components/nav";
import { MessageList, Composer } from "@/client/components/chat";
import { LockedState } from "@/client/components/state";
import { useDiscord } from './hooks/useDiscord';
import LoadingScreen from '@/client/components/ui/LoadingScreen';
import useGuild from './hooks/useGuild';
import useChannels from './hooks/useChannels';
import { Snowflake as SnowFlake } from './helpers/Snowflake';
import Link from '@/client/components/ui/Link';


const App: React.FC = () => {
	const client = useDiscord();
	const discord = client.sdk;
	const initGuildId = discord?.sdk.guildId ?? "";
	const channelId = discord?.sdk.channelId ?? "";
	const [activeChannelId, setActiveChannelId] = useState<Snowflake>("" as Snowflake);
	const [isVoiceMember, setIsVoiceMember] = useState(true);
	const [messages, setMessages] = useState<Message[]>([]);
	const [guilds, setGuilds] = useState<PartialGuild[]>([]);
	const [guild, guildId, setGuild] = useGuild(discord);
	const [channels, selectedGuild, setSelectedGuild] = useChannels(discord);
	const wsRef = useRef<WebSocket | null>(null);
	const previousVoiceChannelId = useRef<string | null>(null);

	useEffect(() => {
		if (!initGuildId || !channelId) return;
		setGuild(initGuildId);
		setActiveChannelId(channelId as Snowflake);
		setSelectedGuild(guild);
	}, [initGuildId, channelId]);

	useEffect(() => {
		let cancelled = false;
		if (!discord) return;
		discordAPI.getGuilds(discord).then((data) => {
			if (cancelled) return;
			setGuilds(data);
		}).catch((reason) => {
			if (!cancelled) {
				console.error("Failed to load guilds:", reason);
				setGuilds([]);
			}
		});
		return () => {
			cancelled = true;
		}
	}, [discord]);

	useEffect(() => {
		let cancelled = false;
		if (!discord) return;
		discordAPI.getGuild(discord, guildId)
			.then((data) => {
				if (cancelled) return;
				setSelectedGuild(data);
				const channel = Object.values(data.channels)					.find(c => c.id === activeChannelId);
				if (channel) {
					setActiveChannelId(channel.id);
				}
			})
			.catch((reason) => {
				if (!cancelled) {
					console.error("Failed to load guild:", reason);
				}
			});
		return () => {
			cancelled = true;
		};
	}, [discord, guildId]);

	useEffect(() => {
		let cancelled = false;
		if (!guildId || !activeChannelId) return;

		dbClient.messages.getAll( guildId, activeChannelId, discord!)
			.then((loaded) => {
				if (!cancelled) setMessages((prev) => [...loaded ? loaded : prev]);
			})
			.catch(() => {
				if (!cancelled) setMessages((prev) => [...prev]);
			});

		return () => {
			cancelled = true;
		};
	}, [guildId, activeChannelId]);

	useEffect(() => {
		if (!discord || !guildId || !activeChannelId) return;
		const wsProtocol = window.location.protocol === "https:" ? "wss" : "ws";
		const ws = new WebSocket(`${wsProtocol}://${window.location.host}`);
		wsRef.current = ws;

		ws.addEventListener("open", () => {
			if (!guildId || !activeChannelId) return;
			ws.send(JSON.stringify({
				event: "activity:join",
				payload: {
					guildId: guildId,
					channelId: activeChannelId,
					userId: discord.auth.user.id,
				},
			}));
			if (isVoiceMember) {
				ws.send(JSON.stringify({
					event: "voice:join",
					payload: {
						guildId: guildId,
						userId: discord.auth.user.id,
						voiceChannelId: activeChannelId,
						previousVoiceChannelId: previousVoiceChannelId.current,
					},
				}));
				previousVoiceChannelId.current = activeChannelId;
			}
		});

		ws.addEventListener("message", (event) => {
			try {
				const data = JSON.parse(event.data);
				if (data.event !== "message:add") return;
				const payload = data.payload as Message;
				if (payload?.guildId !== guildId || payload?.channelId !== activeChannelId) return;
				// Prevent double posting: only add if message doesn't already exist
				setMessages((prev) => {
					if (prev.some(msg => msg.id === payload.id)) {
						return prev;
					}
					return [...prev, payload];
				});
			} catch {
				return;
			}
		});

		return () => {
			if (ws.readyState === WebSocket.OPEN && guildId && activeChannelId) {
				ws.send(JSON.stringify({
					event: "activity:leave",
					payload: {
						guildId: guildId,
						channelId: activeChannelId,
						userId: discord.auth.user.id,
					},
				}));
			}
			ws.close();
			if (wsRef.current === ws) {
				wsRef.current = null;
			}
		};
	}, [discord, guildId, activeChannelId, isVoiceMember]);

	useEffect(() => {
		const ws = wsRef.current;
		if (!discord || !ws || ws.readyState !== WebSocket.OPEN || !guildId || !activeChannelId) return;
		let event: string | null = null;
		const previous = previousVoiceChannelId.current;
		if (isVoiceMember) {
			if (!previous) {
				event = "voice:join";
			} else if (previous !== activeChannelId) {
				event = "voice:move";
			}
		} else if (previous) {
			event = "voice:leave";
		}

		if (event) {
			ws.send(JSON.stringify({
				event,
				payload: {
					guildId: guildId,
					userId: discord.auth.user.id,
					voiceChannelId: activeChannelId,
					previousVoiceChannelId: previous,
				},
			}));
		}

		previousVoiceChannelId.current = isVoiceMember ? activeChannelId : null;
	}, [discord, guildId, activeChannelId, isVoiceMember]);

	if (!discord) return <LoadingScreen />;

	const handleSend = (value: string) => {
		const messageId = SnowFlake.generate();
		console.log("Discord Data:", discord);
		console.log("Auth data:", discord.auth);
		console.log("Sending message:", { id: messageId, content: value, author: discord.auth.user });
		const payload: Message = {
			id: messageId,
			guildId: guildId as any,
			channelId: activeChannelId!,
			content: value,
			author: discord.auth.user,
			createdAt: Timestamp.fromDate(new Date())
		};
		dbClient.messages.post(discord, payload).then(() => {
			console.log("Message sent successfully");
		}).catch((error) => {
			console.error("Failed to send message:", error);
			// Implement retry logic here.
			// For example, you could add the message to a retry queue and attempt to resend it after a delay.

		});
		setMessages((prev) => [payload, ...prev]);
	};

	return (
			<AppShell>
				<ShellHeader>
					<div>
						<HeaderTitle>{discord.guild.name || "Channel Activity"}</HeaderTitle>
						<HeaderMeta>Voice-gated chatroom activity</HeaderMeta>
					</div>
				<HeaderActions>
					<Link href={ "/terms-of-service" } textContent="Terms of Service" />
					<Link href={"/privacy-policy"} textContent="Privacy Policy" />
						<CrossChannelTabs tabs={["This Channel", "Multi-Channel"]} activeIndex={0} />
						<Button $variant="outline" $size="sm">
							Session Settings
						</Button>
					</HeaderActions>
				</ShellHeader>

				<ShellRail>
					<ServerList items={guilds} discord={discord} guildId={selectedGuild?.id || guildId} onSelect={setGuild} />
				</ShellRail>

				<ShellSidebar>
					<SidebarSection>
						<SidebarTitle>Channels</SidebarTitle>
						<ChannelList items={channels} channelId={activeChannelId} onSelect={setActiveChannelId} />
					</SidebarSection>
					<SidebarSection>
						<SidebarTitle>Voice Gate</SidebarTitle>
						<Card>
							<CardTitle>Access</CardTitle>
							<CardMeta>
								{isVoiceMember ? "Unlocked" : "Join the voice channel to unlock chat"}
							</CardMeta>
							<Button
								$variant={isVoiceMember ? "outline" : "primary"}
								$size="sm"
								onClick={() => setIsVoiceMember((prev) => !prev)}
							>
								{isVoiceMember ? "Leave Voice" : "Simulate Join"}
							</Button>
						</Card>
					</SidebarSection>
				</ShellSidebar>

				<ShellContent>
					<ContentHeader>
						<div>
							<ContentTitle>{discord.channel.name || `#${activeChannelId}`}</ContentTitle>
							<ContentSubtitle>Live voice-room chat stream</ContentSubtitle>
						</div>
						<AvatarWrap $size={40}>
							Y
							<PresenceDot $status={isVoiceMember ? "online" : "idle"} />
						</AvatarWrap>
					</ContentHeader>

					{isVoiceMember ? (
						<>
							<MessageList messages={messages} />
							<Composer onSend={handleSend} />
						</>
					) : (
						<LockedState joined={true} onJoin={() => setIsVoiceMember(true)} />
					)}
				</ShellContent>
			</AppShell>
	);
};

export default App;
