
import { notFound } from "next/navigation";
import { stories } from "@/lib/stubData";
import { FlipStoryReader } from "@/components/FlipStoryReader";

export default async function FlipStoryPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const story = stories.find((s) => s.storyId === id);
    if (!story) return notFound();

    return <FlipStoryReader story={story} />;
}
