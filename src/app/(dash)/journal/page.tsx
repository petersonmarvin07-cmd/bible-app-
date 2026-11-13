import { JournalBoard } from "@/components/journal-board";
import { requireUser } from "@/lib/auth";
import { getJournal, getPassageOptions } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function JournalPage({
  searchParams,
}: {
  searchParams: Promise<{ entry?: string; passage?: string }>;
}) {
  const user = await requireUser();
  const [entries, options, params] = await Promise.all([
    getJournal(user.id),
    getPassageOptions(),
    searchParams,
  ]);

  return (
    <JournalBoard
      initialEntries={entries}
      passageOptions={options}
      focusId={params.entry}
      defaultPassageId={params.passage}
    />
  );
}
