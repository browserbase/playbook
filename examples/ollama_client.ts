/**
 * Welcome to the Stagehand Ollama client!
 *
 * This is a client for the Ollama API. It is a wrapper around the OpenAI API
 * that allows you to create chat completions with Ollama.
 *
 * To use this client, you need to have an Ollama instance running. You can
 * start an Ollama instance by running the following command:
 *
 * ```bash
 * ollama run llama3.2
 * ```
 */

import type { AvailableModel } from "@browserbasehq/stagehand";
import { LLMClient } from "@browserbasehq/stagehand";
import type { CreateChatCompletionOptions } from "@browserbasehq/stagehand/dist/lib/llm/LLMClient";
import {
  CoreAssistantMessage,
  CoreMessage,
  CoreSystemMessage,
  CoreTool,
  CoreUserMessage,
  generateObject,
  generateText,
  ImagePart,
  LanguageModel,
  TextPart,
} from "ai";
import type { ChatCompletion } from "openai/resources/chat/completions";

export class OllamaClient extends LLMClient {
  public type = "ollama" as const;
  private model: LanguageModel;

  constructor({ model }: { model: LanguageModel }) {
    super("ollama" as AvailableModel);
    this.model = model;
  }

  async createChatCompletion<T = ChatCompletion>({
    options,
  }: CreateChatCompletionOptions): Promise<T> {
    const formattedMessages: CoreMessage[] = options.messages.map((message) => {
      if (Array.isArray(message.content)) {
        if (message.role === "system") {
          const systemMessage: CoreSystemMessage = {
            role: "system",
            content: message.content
              .map((c) => ("text" in c ? c.text : ""))
              .join("\n"),
          };
          return systemMessage;
        }

        const contentParts = message.content.map((content) => {
          if ("image_url" in content) {
            const imageContent: ImagePart = {
              type: "image",
              image: content.image_url.url,
            };
            return imageContent;
          } else {
            const textContent: TextPart = {
              type: "text",
              text: content.text,
            };
            return textContent;
          }
        });

        if (message.role === "user") {
          const userMessage: CoreUserMessage = {
            role: "user",
            content: contentParts,
          };
          return userMessage;
        } else {
          const textOnlyParts = contentParts.map((part) => ({
            type: "text" as const,
            text: part.type === "image" ? "[Image]" : part.text,
          }));
          const assistantMessage: CoreAssistantMessage = {
            role: "assistant",
            content: textOnlyParts,
          };
          return assistantMessage;
        }
      }

      return {
        role: message.role,
        content: message.content,
      };
    });

    if (options.response_model) {
      const response = await generateObject({
        model: this.model,
        messages: formattedMessages,
        schema: options.response_model.schema,
      });

      return response.object as T;
    }

    const tools: Record<string, CoreTool> = {};

    if (options.tools) {
      for (const rawTool of options.tools) {
        tools[rawTool.name] = {
          description: rawTool.description,
          parameters: rawTool.parameters,
        };
      }
    }

    const response = await generateText({
      model: this.model,
      messages: formattedMessages,
      tools,
    });

    return response as T;
  }
}
