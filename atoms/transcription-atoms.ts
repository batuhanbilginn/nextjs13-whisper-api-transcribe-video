import axios from "axios"
import tokenizer from "gpt-tokenizer"
import { atom } from "jotai"

import { ChatGPTMessage } from "@/types/openai"

tokenizer.modelName = "gpt-3.5-turbo"

export const apiKeyAtom = atom<string>("")

// TRANSCRIBE
export const fileNameAtom = atom<string>("")
export const fileTypeAtom = atom<"vtt" | "srt">("vtt")
export const formDataAtom = atom<FormData | null>(null)
export const transcriptionAtom = atom<string>("")
export const handlingAtom = atom(false)
export const formStateAtom = atom((get) => {
  const transcription = get(transcriptionAtom)
  return !transcription ? "transcribe" : "translate"
})
export const transcriptionHandlerAtom = atom(
  null,
  async (_get, set, formData: FormData) => {
    try {
      set(handlingAtom, true)
      const { data } = await axios.post("/api/transcribe", formData)
      if (!data) {
        throw new Error("No data from response.")
      }
      set(transcriptionAtom, data.data)
      set(handlingAtom, false)
    } catch (error: any) {
      set(handlingAtom, false)
      console.log(error.response.data.message)
      throw new Error(error.response.data.message)
    }
  }
)

// TRANSLATE
export const languageAtom = atom<string>("spanish")
const messagesAtom = atom<ChatGPTMessage[]>((get) => {
  const transcription = get(transcriptionAtom)
  const language = get(languageAtom)
  return [
    {
      role: "system",
      content:
        "You are a translator machine. Your mission is translating srt or vtt files into the language provided. Do not change the format of the file. Only return the translated file.",
    },
    {
      role: "user",
      content: `Please translate this file into ${language}. File: ${transcription}`,
    },
  ]
})
const tokenSizeAtom = atom((get) => {
  const maxTokenSize = 4096 // This is the token size limit of gpt-3.5-turbo
  const messages = get(messagesAtom)
  const currentTokenSize = tokenizer.encodeChat(
    messages,
    "gpt-3.5-turbo"
  ).length
  const remainingTokenSize = maxTokenSize - currentTokenSize
  return {
    maxTokenSize,
    currentTokenSize,
    remainingTokenSize,
    isTokenSizeExceeded: !tokenizer.isWithinTokenLimit(messages, maxTokenSize),
    canTokenSizeBeExceeded: maxTokenSize - currentTokenSize * 2 < 0,
  }
})
export const tokenSizeMessageAtom = atom((get) => {
  const tokenSize = get(tokenSizeAtom)
  if (tokenSize.isTokenSizeExceeded) {
    return {
      type: "error",
      message: `Maximum token size(${tokenSize.maxTokenSize}) exceeded. Please reduce the size of the file.`,
    }
  } else if (tokenSize.canTokenSizeBeExceeded) {
    return {
      type: "warning",
      message: `You are in the limit of the token size${
        tokenSize.maxTokenSize
      } however when you include the response (multiplying current token size (${
        tokenSize.currentTokenSize
      }) by 2 = ${
        tokenSize.currentTokenSize * 2
      }) the token size will be exceeded. Please reduce the size of the file.`,
    }
  } else {
    return {
      type: "success",
      message: `Token size: ${tokenSize.currentTokenSize}`,
    }
  }
})
export const translateHandlerAtom = atom(null, async (get, set) => {
  const messages = get(messagesAtom)
  try {
    set(handlingAtom, true)
    const response = await fetch("/api/translate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        max_tokens: get(tokenSizeAtom).remainingTokenSize,
        messages,
        api_key: get(apiKeyAtom),
      }),
    })

    if (!response.ok) {
      console.log("Response not ok", response)
      throw new Error(response.statusText)
    }

    // This data is a ReadableStream
    const data = response.body
    if (!data) {
      console.log("No data from response.", data)
      throw new Error("No data from response.")
    }

    const reader = data.getReader()
    const decoder = new TextDecoder()
    let done = false

    // Set transcription to empty
    set(transcriptionAtom, "")

    while (!done) {
      console.log("Reading...")
      const { value, done: doneReading } = await reader.read()
      done = doneReading
      const chunkValue = decoder.decode(value)
      // Set transcription
      set(transcriptionAtom, (prev) => prev + chunkValue)
    }
  } catch (error: any) {
    console.log(error)
    throw new Error(error.data.message)
  } finally {
    set(handlingAtom, false)
  }
})
