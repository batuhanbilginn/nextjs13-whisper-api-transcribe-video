"use client"

import { FormEvent } from "react"
import {
  apiKeyAtom,
  fileNameAtom,
  fileTypeAtom,
  handlingAtom,
  transcriptionHandlerAtom,
} from "@/atoms/transcription-atoms"
import { useAtomValue, useSetAtom } from "jotai"

import { Button } from "../button"
import { Input } from "../input"
import { Label } from "../label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../select"
import { useToast } from "../use-toast"

const TranscribeForm = () => {
  const handling = useAtomValue(handlingAtom)
  const submitHandler = useSetAtom(transcriptionHandlerAtom)
  const setFileName = useSetAtom(fileNameAtom)
  const setFileType = useSetAtom(fileTypeAtom)
  const setAPIKey = useSetAtom(apiKeyAtom)
  const { toast } = useToast()

  return (
    <form
      onSubmit={async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        try {
          await submitHandler(formData)
        } catch (error: any) {
          console.log(error)
          toast({
            title: "Error",
            description: error?.message,
          })
        }
      }}
      className="space-y-6"
    >
      <div className="space-y-4">
        <Label>
          Choose your video or audio{" "}
          <span className="text-xs text-neutral-500">Max: 25MB</span>
        </Label>
        <Input
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setFileName(e?.target?.files?.[0]?.name as string)
          }}
          type="file"
          max={25 * 1024 * 1024}
          accept="audio/*,video/*"
          name="file"
        />
      </div>
      <div className="space-y-4">
        <Label>
          Write a propmt{" "}
          <span className="text-xs text-neutral-500">
            You can improve your transcription with a prompt.
          </span>
        </Label>
        <Input name="prompt" placeholder="Next.js, Typescript..." />
      </div>
      <div className="space-y-4">
        <Label>
          Choose a response type{" "}
          <span className="text-xs text-neutral-500">
            You choose SRT or VTT.
          </span>
        </Label>
        <Select
          onValueChange={(value) => {
            setFileType(value as "vtt" | "srt")
          }}
          defaultValue="vtt"
          name="response_format"
        >
          <SelectTrigger>
            <SelectValue placeholder="Choose a response type." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="vtt">VTT</SelectItem>
            <SelectItem value="srt">SRT</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-4">
        <Label>
          OpenAI API Key{" "}
          <span className="text-xs text-neutral-500">
            You key will not be stored anywhere.{" "}
            <a
              className="dark:text-neutral-200 text-neutral-700"
              href="https://platform.openai.com/account/api-keys"
            >
              Get your key ↗
            </a>
          </span>
        </Label>
        <Input
          onChange={(e) => {
            setAPIKey(e.target.value)
          }}
          type="password"
          name="api_key"
          placeholder="sk-QT"
        />
      </div>
      <div className="flex gap-4">
        <Button type="submit">
          {!handling ? (
            "Transcribe"
          ) : (
            <span className="animate-pulse">Transcribing...</span>
          )}{" "}
        </Button>
      </div>
    </form>
  )
}

export default TranscribeForm
