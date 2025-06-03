import YoutubeClient from "./YoutubeClient";

export default function YoutubePage({ params }: { params: { locale: string } }) {
    return <YoutubeClient locale={params.locale} messages={{}} />;
}
