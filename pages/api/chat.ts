import apiQuotaAvailable from "@/utils/RateLimiting";
import {
  getAlerts,
  getRouteIsRunning,
  getRoutes,
} from "@/utils/TransiterUtils";
import type { NextApiRequest, NextApiResponse } from "next";
import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

type Data = {
  nextMessage: string;
};

type Error = {
  error: string;
};

type Message = {
  id: string;
  text: string;
  role: "user" | "assistant" | "system";
};

const MESSAGE_HISTORY_LIMIT = parseInt(
  process.env.NEXT_PUBLIC_MESSAGE_HISTORY_LIMIT || "5"
);

const MAX_MESSAGE_LENGTH = parseInt(
  process.env.NEXT_PUBLIC_MAX_MESSAGE_LENGTH || "2048"
);

const alertEffects = new Set<string>([
  "ADDITIONAL_SERVICE",
  "MODIFIED_SERVICE",
  "NO_SERVICE",
  "REDUCED_SERVICE",
  "SIGNIFICANT_DELAYS",
]);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | Error>
) {
  if (!(await apiQuotaAvailable(req))) {
    res.status(429).json({ error: "Exceeded request limit" });
    return;
  }

  const { messages } = JSON.parse(req.body) as {
    messages: Message[];
  };

  const validMessages = messages.filter(
    (m) => m.role === "assistant" || m.role === "user"
  );
  const limitedMessages = validMessages.slice(
    Math.max(validMessages.length - MESSAGE_HISTORY_LIMIT, 0)
  );

  for (const message of limitedMessages) {
    if (message.text.length > MAX_MESSAGE_LENGTH) {
      res.status(400).json({ error: "Message too long" });
      return;
    }
  }

  const runningRoutes = await getRunningRoutes("us-ny-subway");
  const runningRoutesText = runningRoutes
    .map((r) => `${r.id}`)
    .join(",")
    .trim();

  const activeAlerts = await getActiveAlerts("us-ny-subway");
  const activeAlertsText = activeAlerts
    .filter((a) => alertEffects.has(a.effect as unknown as string))
    .filter(
      (a) =>
        a.header.find((h) => h.language === "en") !== undefined ||
        a.description.find((d) => d.language === "en") !== undefined
    )
    .map(
      (a) =>
        `- ${a.header.find((h) => h.language === "en")?.text ?? ""}: ${
          a.description.find((d) => d.language === "en")?.text ?? ""
        }`
    )
    .join("\n")
    .trim();

  const systemPrompt = {
    role: "system",
    content: `You're a chatbot that knows all about NYC subway system. Users will ask you questions about the subway and you will answer them.
Whenever you reference a subway route letter or number, always enclose it in square brackets.
You are aware that the following routes are running, separated by commas. When you reference this, be sure to enclose each route in square brackets:
${runningRoutesText}
You are aware of the following active MTA alerts:
${activeAlertsText}
`,
  };

  const allMessages = [
    systemPrompt,
    ...limitedMessages.map((m) => ({
      role: m.role,
      content: m.text,
    })),
  ] as ChatCompletionRequestMessage[];

  try {
    const completion = await openai.createChatCompletion(
      {
        model: "gpt-3.5-turbo",
        messages: allMessages,
      },
      { timeout: 10000 }
    );

    res
      .status(200)
      .json({ nextMessage: completion.data.choices[0].message!.content });
  } catch (e: any) {
    console.error(e?.message);
    throw e;
  }
}

async function getRunningRoutes(system: string) {
  const routes = await getRoutes(system);
  return routes.filter((r) => getRouteIsRunning(r));
}

async function getActiveAlerts(system: string) {
  const allAlerts = await getAlerts(system);
  const nowUnix = Math.floor(Date.now() / 1000);

  return allAlerts
    .filter(
      (a) =>
        a.currentActivePeriod !== undefined &&
        a.currentActivePeriod.startsAt !== undefined
    )
    .filter(
      (a) =>
        a.currentActivePeriod!.startsAt! <= nowUnix &&
        (a.currentActivePeriod!.endsAt === undefined ||
          a.currentActivePeriod!.endsAt! >= nowUnix)
    );
}
