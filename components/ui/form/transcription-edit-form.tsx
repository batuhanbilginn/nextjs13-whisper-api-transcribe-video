import { FormEvent } from "react"
import {
  fileNameAtom,
  fileTypeAtom,
  handlingAtom,
  languageAtom,
  tokenSizeMessageAtom,
  transcriptionAtom,
  translateHandlerAtom,
} from "@/atoms/transcription-atoms"
import { useAtom, useAtomValue, useSetAtom } from "jotai"

import { Button } from "../button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../select"
import { Textarea } from "../textarea"
import { useToast } from "../use-toast"

const TranscriptionEditForm = () => {
  const handling = useAtomValue(handlingAtom)
  const fileType = useAtomValue(fileTypeAtom)
  const fileName = useAtomValue(fileNameAtom)
  const setLanguage = useSetAtom(languageAtom)
  const [transcription, setTranscription] = useAtom(transcriptionAtom)
  const translateHandler = useSetAtom(translateHandlerAtom)
  const tokenSizeMessage = useAtomValue(tokenSizeMessageAtom)
  const { toast } = useToast()

  const downloadHandler = () => {
    const blob = new Blob([transcription], { type: "text/plain" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.download = `${fileName.split(".")[0] ?? fileName}.${fileType}`
    a.href = url
    a.click()
  }
  return (
    <form
      className="space-y-6"
      onSubmit={async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (tokenSizeMessage.type !== "success") return
        try {
          await translateHandler()
        } catch (error: any) {
          toast({
            title: "Error",
            description: error?.message,
          })
        }
      }}
    >
      <Textarea
        name="transcription"
        className="h-96"
        value={transcription}
        onChange={(e) => {
          setTranscription(e.target.value)
        }}
      />
      <div className="flex items-center gap-2">
        <div
          className={
            "w-2 h-2 rounded-full inline-block " +
            (tokenSizeMessage.type === "success"
              ? "bg-green-500"
              : tokenSizeMessage.type === "warning"
              ? "bg-yellow-400"
              : "bg-red-500")
          }
        />
        <div className="text-sm text-neutral-500">
          {tokenSizeMessage.message}
        </div>
      </div>
      <div>
        <Select
          onValueChange={(value) => {
            setLanguage(value)
          }}
          defaultValue="spanish"
          name="language"
        >
          <SelectTrigger>
            <SelectValue placeholder="Choose a response type." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="spanish">Spanish</SelectItem>
            <SelectItem value="turkish">Turkish</SelectItem>
            <SelectItem value="german">German</SelectItem>
            <SelectItem value="french">French</SelectItem>
            <SelectItem value="italian">Italian</SelectItem>
            <SelectItem value="portuguese">Portuguese</SelectItem>
            <SelectItem value="russian">Russian</SelectItem>
            <SelectItem value="arabic">Arabic</SelectItem>
            <SelectItem value="chinese">Chinese</SelectItem>
            <SelectItem value="japanese">Japanese</SelectItem>
            <SelectItem value="korean">Korean</SelectItem>
            <SelectItem value="hindi">Hindi</SelectItem>
            <SelectItem value="indonesian">Indonesian</SelectItem>
            <SelectItem value="thai">Thai</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-6">
        <Button disabled={tokenSizeMessage.type !== "success"} type="submit">
          {!handling ? (
            "Translate"
          ) : (
            <span className="animate-pulse">Translating...</span>
          )}
        </Button>
        <Button type="button" onClick={downloadHandler} variant="outline">
          Download
        </Button>
      </div>
    </form>
  )
}

export default TranscriptionEditForm
