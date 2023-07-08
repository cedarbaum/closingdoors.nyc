import { useEffect, useRef, useState } from "react";
import styles from "@/styles/loadingdots.module.css";
import { useQuery } from "react-query";
import { processMtaText } from "@/utils/TextProcessing";
import { ChatData, Datasource, DatasourceType } from "@/pages/api/chat";
import {
  InformationCircleIcon,
  ArrowTopRightOnSquareIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import { WatchMode, usePosition } from "@/utils/usePosition";

import { create } from "zustand";
import { useSettings } from "@/pages/settings";

interface Context {
  usingLocation?: boolean;
  userLocation?: {
    latitude: number;
    longitude: number;
  };
}

interface ChatState {
  messages: Message[];
  setMessages: (setMessages: (messages: Message[]) => Message[]) => void;
  context: Context;
  setUsingLocation: (usingLocation: boolean) => void;
  setUserLocation: (userLocation: Context["userLocation"]) => void;
}

const useChatState = create<ChatState>((set) => ({
  context: {},
  messages: [],
  setMessages: (setMessages: (messages: Message[]) => Message[]) =>
    set((state) => ({ messages: setMessages(state.messages) })),
  setUsingLocation: (usingLocation: boolean) => {
    set((state) => ({
      context: {
        ...state.context,
        usingLocation,
      },
    }));
  },
  setUserLocation: (userLocation: Context["userLocation"]) => {
    set((state) => ({
      context: {
        ...state.context,
        userLocation,
      },
    }));
  },
}));

type Chip = {
  message?: string;
  label: string;
  icon?: React.ReactNode;
  alwaysDisplay?: boolean;
  shouldDisplay?: () => boolean;
  onClick?: () => void;
};

type Message = {
  id: string | number;
  text?: string;
  html?: string;
  role: "user" | "assistant" | "system";
  isTyping?: boolean;
  contentType?: "text" | "html";
  intent?: "info" | "error";
  chips?: Chip[];
  datasources?: Datasource[];
};

const MESSAGE_HISTORY_LIMIT = parseInt(
  process.env.NEXT_PUBLIC_CHAT_MESSAGE_HISTORY_LIMIT || "5"
);

const MAX_MESSAGE_LENGTH = parseInt(
  process.env.NEXT_PUBLIC_CHAT_MAX_MESSAGE_LENGTH || "2048"
);

function getAttributionPrefix(datasourceType: DatasourceType) {
  switch (datasourceType) {
    case "google_maps":
      return "Uses data from Google Maps";
    default:
      throw new Error(`Unknown datasource type ${datasourceType}`);
  }
}

export default function Chat() {
  const { messages, setMessages, setUsingLocation, setUserLocation } =
    useChatState();

  let usingLocation = useChatState((state) => state.context.usingLocation);
  const userLocation = useChatState((state) => state.context.userLocation);

  const {
    chat: { useLocation: locationAlwaysAllowed },
    settingsReady,
  } = useSettings();
  usingLocation = usingLocation || (locationAlwaysAllowed && settingsReady);

  const messageContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const promptForLocation = !usingLocation && settingsReady;
    const introMessage: Message = {
      id: "intro",
      text: `Hey there! I am an <b>experimental</b> chatbot to help you with the NYC Subway! You can ask me things like:\n
1. How can I get from Times Square to downtown Brooklyn?
2. What's going on with the [G] train today?
3. What routes are currently running?
${
  promptForLocation
    ? '\nYou can optionally select "Use current location" to help with navigation.\n'
    : ""
}
<b>Note that my answers and directions may be incorrect, incomplete, or suboptimal, so always double-check with official MTA sources.</b>`,
      role: "system",
      chips: [
        {
          label: "Use current location",
          shouldDisplay: () => promptForLocation,
          icon: <MapPinIcon className="w-5 h-5 ml-2" />,
          onClick: () => {
            setUsingLocation(true);
          },
        },
      ],
    };
    setMessages((messages) => [
      introMessage,
      ...messages.filter((m) => m.id !== "intro"),
    ]);
  }, [usingLocation, settingsReady, setMessages, setUsingLocation]);

  const {
    latitude,
    longitude,
    error: locationErrorMessage,
  } = usePosition(
    { mode: WatchMode.Watch, skip: !usingLocation },
    {
      maximumAge: 60 * 1000,
      timeout: 30 * 1000,
      enableHighAccuracy: false,
    }
  );

  const waitingForLocation =
    usingLocation &&
    (latitude === undefined || longitude === undefined) &&
    !locationErrorMessage;

  useEffect(() => {
    if (!usingLocation && settingsReady) {
      setUserLocation(undefined);
      // Delete previous location messages
      setMessages((messages) =>
        messages.filter(
          (m) => m.id !== "location-error" && m.id !== "location-success"
        )
      );
    } else if (latitude !== undefined && longitude !== undefined) {
      setUserLocation({ latitude, longitude });
    }
  }, [
    usingLocation,
    settingsReady,
    latitude,
    longitude,
    setUserLocation,
    setMessages,
  ]);

  useEffect(() => {
    // Failed to get location and a previous location was never retrieved
    if (
      locationErrorMessage &&
      !userLocation &&
      !messages.find((m) => m.id === "location-error")
    ) {
      setMessages((messages: Message[]) => [
        ...messages,
        {
          id: "location-error",
          role: "system",
          text: "Failed to get your location. Ensure you have granted location permissions and reload the page.",
          intent: "error",
        },
      ]);
    } else if (
      userLocation &&
      !messages.find((m) => m.id === "location-success")
    ) {
      setMessages((messages) => [
        ...messages,
        {
          id: "location-success",
          role: "system",
          text: "📍 Successfully retrieved your location!",
          intent: "info",
        },
      ]);
    }
  }, [messages, userLocation, locationErrorMessage, setMessages]);

  const [processedMessages, setProcessedMessages] = useState<Message[]>([]);

  const handleAssistantResponse = (chatData: ChatData, id: number) => {
    let chips: Chip[] | undefined = undefined;
    const googleMapsDs = chatData.datasources.find(
      (ds) => ds.type === "google_maps"
    );
    if (googleMapsDs) {
      // Only URL returned is a Google Maps URL
      const mapUrl = googleMapsDs?.urls?.[0];
      if (mapUrl) {
        chips = [
          {
            label: "View on Google Maps",
            icon: <ArrowTopRightOnSquareIcon className="w-5 h-5 ml-2" />,
            alwaysDisplay: true,
            onClick: () => {
              window.open(mapUrl, "_blank");
            },
          },
        ];
      }
    }

    setMessages((messages) => [
      ...messages,
      {
        id,
        text: chatData.nextMessage,
        datasources: chatData.datasources,
        role: "assistant",
        chips,
      },
    ]);
  };

  const { isFetching, refetch } = useQuery(
    ["messages", messages.length],
    async () => {
      const validMessages = messages
        .filter((m) => m.role !== "system" && m.intent !== "error")
        // If assistant sent back a long message, skip it to avoid getting
        // API errors.
        .filter(
          (m) =>
            m.text && (m.role === "user" || m.text.length <= MAX_MESSAGE_LENGTH)
        );

      const limitedMessages = validMessages.slice(
        Math.max(validMessages.length - MESSAGE_HISTORY_LIMIT, 0)
      );

      const res = await fetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({
          messages: limitedMessages,
          context: {
            userLocation,
          },
        }),
      });

      if (!res.ok) {
        const errorMessage =
          res.status === 429
            ? "Too many requests sent, please wait a few moments."
            : "Something went wrong. Please try again.";
        setMessages((messages) => [
          ...messages,
          {
            role: "system",
            id: messages.length + 1,
            isTyping: false,
            text: errorMessage,
            contentType: "text",
            intent: "error",
            chips: [
              {
                label: "Retry",
                onClick: () => {
                  setMessages((messages) => [
                    ...messages.slice(0, messages.length - 1),
                  ]);
                },
              },
            ],
          },
        ]);

        throw new Error("Failed to fetch message");
      }

      const chatData = (await res.json()) as ChatData;
      handleAssistantResponse(chatData, messages.length + 1);

      return "OK";
    },
    {
      enabled: false,
    }
  );

  const handleSendMessage = (text: string) => {
    if (isFetching || waitingForLocation || text.trim().length === 0) {
      return;
    }

    const newMessage: Message = {
      id: messages.length + 1,
      text,
      role: "user",
    };
    setMessages((messages) => [...messages, newMessage]);
  };

  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1].role === "user") {
      refetch();
    }
  }, [messages, refetch]);

  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop =
        messageContainerRef.current.scrollHeight;
    }
  }, [processedMessages, isFetching]);

  useEffect(() => {
    queueMicrotask(() => {
      setProcessedMessages(
        messages.map((m) => {
          return {
            ...m,
            contentType: "html",
            html: processMtaText(m.text),
          };
        })
      );
    });
  }, [messages]);

  const renderMessages = () => {
    let allMessages = processedMessages;
    if (isFetching) {
      allMessages = [
        ...allMessages,
        {
          role: "assistant",
          id: "fetching",
          isTyping: true,
          text: undefined,
        },
      ];
    }

    return allMessages.map((message, msgIdx) => (
      <div className="w-full" key={message.id}>
        <MessageBubble message={message} />
        {message.datasources &&
          message.datasources.map((ds) => (
            <div
              key={ds.type}
              className="mb-2 mr-8 bg-gray-700 text-white p-2 flex"
            >
              <InformationCircleIcon className="w-4 h-4 mr-1" />
              <span className="text-xs">
                {getAttributionPrefix(ds.type)}, {ds.attributions.join(", ")}
              </span>
            </div>
          ))}
        {message.chips && (
          <Chips
            chips={message.chips}
            isLastMessage={msgIdx === messages.length - 1}
            onClick={(chip) => {
              if (isFetching) {
                return;
              }

              if (chip.onClick) {
                chip.onClick();
              } else if (chip.message) {
                setMessages((messages) => [
                  ...messages,
                  {
                    role: "user",
                    id: messages.length + 1,
                    isTyping: false,
                    text: chip.message,
                    contentType: "text",
                  },
                ]);
              }
            }}
          />
        )}
      </div>
    ));
  };

  return (
    <div className="px-2 bg-black flex flex-col h-full">
      <div
        ref={messageContainerRef}
        className="overflow-scroll h-full flex-grow scrollbar-hide"
      >
        <div className="pt-4">{renderMessages()}</div>
      </div>
      <div className="py-6 flex items-center border-color-white">
        <input
          id="message-input"
          type="text"
          placeholder="Type a message..."
          className="w-full bg-white border border-gray-300 py-2 px-4 mr-2"
          onKeyPress={(event: any) => {
            if (event.key === "Enter") {
              handleSendMessage(event.target.value);
              event.target.value = "";
            }
          }}
        />
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4"
          onClick={() => {
            const input = document.querySelector(
              "#message-input"
            ) as HTMLInputElement;
            handleSendMessage(input.value);
            input.value = "";
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  let innerHtml;
  if (message.isTyping) {
    innerHtml = (
      <div className="flex items-center">
        <LoadingDots style="large" color="white" />
      </div>
    );
  } else if (message.contentType === "html") {
    innerHtml = (
      <span
        className="inline-block whitespace-pre-wrap"
        dangerouslySetInnerHTML={{ __html: message.html! }}
      />
    );
  } else {
    innerHtml = (
      <span className="inline-block whitespace-pre-wrap">{message.text}</span>
    );
  }

  let bubbleClass = "bg-blue-500 text-white ml-8";
  if (message.intent === "error") {
    bubbleClass = "bg-mtaYellow text-black mr-8";
  } else if (message.role === "assistant" || message.role === "system") {
    bubbleClass = "bg-gray-700 text-white mr-8";
  }

  return (
    <div
      className={`flex ${
        message.role === "user" ? "justify-end" : "justify-start"
      } w-full ${
        message.datasources?.find((ds) => ds.attributions.length > 0)
          ? ""
          : "mb-2"
      }`}
    >
      <div className={`p-3 w-fit ${bubbleClass}`}>{innerHtml}</div>
    </div>
  );
}

function Chips({
  chips,
  onClick,
  isLastMessage,
}: {
  chips: Chip[];
  onClick: (chip: Chip) => void;
  isLastMessage?: boolean;
}) {
  if (
    !isLastMessage &&
    !chips.find(
      (c) => c.alwaysDisplay || (c.shouldDisplay && c.shouldDisplay())
    )
  ) {
    return null;
  }

  return (
    <div
      className={`w-full scrollbar-hide overflow-scroll mb-2 max-w-sm w-fit flex`}
    >
      {chips
        .filter(
          (chip) =>
            chip.alwaysDisplay ||
            (chip.shouldDisplay && chip.shouldDisplay()) ||
            isLastMessage
        )
        .map((chip) => {
          return (
            <div
              key={chip.label}
              className="flex items-center whitespace-nowrap text-white mr-2 bg-gray-700 py-2 px-4 hover:bg-gray-500 cursor-pointer"
              onClick={() => onClick(chip)}
            >
              {chip.label}
              {chip.icon}
            </div>
          );
        })}
    </div>
  );
}

function LoadingDots({
  color = "#000",
  style = "small",
}: {
  color: string;
  style: string;
}) {
  return (
    <span className={style == "small" ? styles.loading2 : styles.loading}>
      <span style={{ backgroundColor: color }} />
      <span style={{ backgroundColor: color }} />
      <span style={{ backgroundColor: color }} />
    </span>
  );
}
