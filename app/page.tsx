import Transcribe from "@/components/transcribe"

export default function IndexPage() {
  return (
    <section className="container grid items-center gap-6 pt-6 pb-8 md:py-10">
      <div className="flex max-w-[980px] flex-col items-start gap-2">
        <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
          Transcribe your videos.
        </h1>
        <p className="max-w-[700px] text-lg text-muted-foreground">
          Just upload your video or audio and Whisper API will do the rest.
          Also, you can translate your transcription to listed languages.
        </p>
      </div>
      <Transcribe />
    </section>
  )
}
