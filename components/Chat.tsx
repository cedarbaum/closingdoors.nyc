import { useEffect, useRef, useState } from "react";
import styles from "@/styles/loadingdots.module.css";
import { useQuery } from "react-query";
import { processMtaText } from "@/utils/TextProcessing";

type Chip = {
  message: string;
  label: string;
};

type Message = {
  id: number;
  text?: string;
  html?: string;
  role: "user" | "assistant" | "system";
  isTyping?: boolean;
  contentType?: "text" | "html";
  intent?: "info" | "error";
  chips?: Chip[];
};

const MESSAGE_HISTORY_LIMIT = parseInt(
  process.env.NEXT_PUBLIC_CHAT_MESSAGE_HISTORY_LIMIT || "5"
);

export default function Chat() {
  const messageContainerRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: `Hey there! I am an <b>experimental</b> chatbot to help you with the NYC Subway! You can ask me things like:\n
1. How can I get from midtown to downtown Brooklyn?
2. What's going on with the [G] train today?
3. What routes are currently running?

<b>Note that my answers may be incorrect, so always double-check with official MTA sources.</b>`,
      role: "system",
    },
  ]);

  const [processedMessages, setProcessedMessages] = useState<Message[]>([]);

  const handleAssistantResponse = (response: string, id: number) => {
    setMessages((messages) => [
      ...messages,
      { id, text: response, role: "assistant" },
    ]);
  };

  const { isFetching, refetch, error } = useQuery(
    ["messages", messages.length],
    async () => {
      const validMessages = messages.filter(
        (m) => m.role !== "system" && m.intent !== "error"
      );
      const limitedMessages = validMessages.slice(
        Math.max(validMessages.length - MESSAGE_HISTORY_LIMIT, 0)
      );

      const res = await fetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({
          messages: limitedMessages,
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
          },
        ]);

        throw new Error("Failed to fetch message");
      }

      const resJson = await res.json();

      const nextMessage = resJson.nextMessage as string;
      handleAssistantResponse(nextMessage, messages.length + 1);

      return nextMessage;
    },
    {
      enabled: false,
    }
  );

  const handleSendMessage = (text: string) => {
    if (isFetching) {
      return;
    }

    const newMessage: Message = {
      id: messages.length + 1,
      text,
      role: "user",
    };
    setMessages([...messages, newMessage]);
  };

  useEffect(() => {
    if (messages[messages.length - 1].role === "user") {
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
          id: messages.length + 1,
          isTyping: true,
          text: undefined,
        },
      ];
    } else if (error) {
      allMessages = [
        ...allMessages,
        {
          role: "system",
          id: messages.length + 1,
          isTyping: false,
          text: "Something went wrong. Please try again.",
          intent: "error",
        },
      ];
    }

    return allMessages.map((message) => (
      <div key={message.id}>
        <MessageBubble message={message} />
        {message.chips && (
          <div className="pl-4">
            <Chips
              chips={message.chips}
              onClick={(chip) => {
                if (isFetching) {
                  return;
                }

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
              }}
            />
          </div>
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
      } w-full mb-2`}
    >
      <div className={`p-3 w-fit ${bubbleClass}`}>{innerHtml}</div>
    </div>
  );
}

function Chips({
  chips,
  onClick,
}: {
  chips: Chip[];
  onClick: (chip: Chip) => void;
}) {
  return (
    <div
      className={`w-full scrollbar-hide overflow-scroll pt-2 mb-2 max-w-sm w-fit flex`}
    >
      {chips.map((chip) => {
        return (
          <div
            key={chip.label}
            className="whitespace-nowrap text-white mr-2 bg-gray-700 py-2 px-4 hover:bg-gray-500 cursor-pointer"
            onClick={() => onClick(chip)}
          >
            {chip.label}
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
