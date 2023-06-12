"use client"

import { formStateAtom } from "@/atoms/transcription-atoms"
import { useAtomValue } from "jotai"

import TranscribeForm from "./ui/form/transcribe-form"
import TranscriptionEditForm from "./ui/form/transcription-edit-form"

const Transcribe = () => {
  const formState = useAtomValue(formStateAtom)

  return (
    <div>
      {formState === "transcribe" ? (
        <TranscribeForm />
      ) : (
        <TranscriptionEditForm />
      )}
    </div>
  )
}

export default Transcribe
