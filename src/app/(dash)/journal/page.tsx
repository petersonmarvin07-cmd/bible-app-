import { JournalBoard } from "@/components/journal-board";
import { requireUser } from "@/lib/auth";
import { getJournal, getPassageOptions } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function JournalPage({
  searchParams,
}: {
  searchParams: Promise<{ entry?: string; passage?: string; reference?: string }>;
}) {
  const user = await requireUser();
  const [entries, options, params] = await Promise.all([
    getJournal(user.id),
    getPassageOptions(),
    searchParams,
  ]);

  let defaultPassageId = "";
  let defaultReference = params.reference ?? "";

  if (params.passage) {
    const matched = options.find(
      (opt) =>
        opt.id === params.passage ||
        opt.slug === params.passage ||
        opt.reference.toLowerCase() === params.passage?.toLowerCase(),
    );
    if (matched) {
      defaultPassageId = matched.id;
    } else if (!defaultReference) {
      defaultReference = params.passage;
    }
  }

  return (
    <JournalBoard
      initialEntries={entries}
      passageOptions={options}
      focusId={params.entry}
      defaultPassageId={defaultPassageId}
      defaultReference={defaultReference}
    />
  );
}
