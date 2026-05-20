import { EmptyState } from "@/components/ui/empty-state";

export default function NotFound() {
  return (
    <div className="route-shell state-route">
      <EmptyState
        title="That table is no longer on the floor."
        copy="Return to search and pick from the latest available restaurants."
      />
    </div>
  );
}
