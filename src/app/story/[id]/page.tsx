import { notFound } from "next/navigation";
import { stories as stubStories } from "@/lib/stubData";
import { StoryReader } from "@/components/StoryReader";
import { promises as fs } from 'fs';
import path from 'path';

export const dynamic = "force-dynamic";

export default async function StoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // 1. Check Stubs
  let story = stubStories.find((s) => s.storyId === id);

  // 2. Check Published (Server Data)
  if (!story) {
    try {
      const DATA_FILE = path.join(process.cwd(), 'src', 'data', 'published-stories.json');
      const fileData = await fs.readFile(DATA_FILE, 'utf-8');
      const published: any[] = JSON.parse(fileData);
      story = published.find((s) => s.storyId === id);
    } catch (e) {
      console.error("Failed to read published stories", e);
    }
  }

  if (!story) return notFound();

  return <StoryReader story={story} />;
}
