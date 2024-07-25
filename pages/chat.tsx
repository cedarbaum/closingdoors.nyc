import Link from "next/link";
import Chat from "@/components/Chat";
import { getChatEnabled } from "@/utils/features";
import { FullScreenError } from "@/components/FullScreenError";
import { useSettings } from "./settings";

export default function ChatPage() {
  const settings = useSettings();
  if (!settings?.settingsReady) {
    return null;
  }

  if (!getChatEnabled()) {
    return (
      <FullScreenError
        error={
          <div>
            Chat is not available. Click{" "}
            <Link className="underline" href="/">
              here
            </Link>{" "}
            to go back home.
          </div>
        }
      />
    );
  }

  if (!settings.chatEnabled) {
    return (
      <FullScreenError
        error={
          <div>
            Chat is not enabled. Enable it in{" "}
            <Link className="underline" href="/settings">
              settings
            </Link>{" "}
            to view this page.
          </div>
        }
      />
    );
  }

  return <Chat />;
}
