"use client";

import { useMemo, useState } from "react";
import { NoteRecord } from "@/types/note";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type NoteWorkspaceProps = {
  initialNotes: NoteRecord[];
};

export function NoteWorkspace({ initialNotes }: NoteWorkspaceProps) {
  const [notes, setNotes] = useState<NoteRecord[]>(initialNotes);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(
    initialNotes[0]?.id ?? null,
  );
  const [title, setTitle] = useState<string>(initialNotes[0]?.title ?? "");
  const [body, setBody] = useState<string>(initialNotes[0]?.body ?? "");
  const [tags, setTags] = useState<string>(
    initialNotes[0]?.tags.join(", ") ?? "",
  );
  const [pinned, setPinned] = useState<boolean>(
    initialNotes[0]?.pinned ?? false,
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const isEditing = Boolean(activeNoteId);

  const sortedNotes = useMemo(
    () =>
      [...notes].sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return (
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      }),
    [notes],
  );

  function resetForm() {
    setActiveNoteId(null);
    setTitle("");
    setBody("");
    setTags("");
    setPinned(false);
  }

  function selectNote(note: NoteRecord) {
    setActiveNoteId(note.id);
    setTitle(note.title);
    setBody(note.body);
    setTags(note.tags.join(", "));
    setPinned(note.pinned);
    setStatus(null);
    setError(null);
  }

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    if (!title.trim() || !body.trim()) {
      setError("Title and note body are required.");
      return;
    }
    setSaving(true);
    setError(null);
    setStatus(null);
    const payload = {
      title,
      body,
      tags: tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      pinned,
    };
    try {
      const response = await fetch(
        activeNoteId ? `/api/notes/${activeNoteId}` : "/api/notes",
        {
          method: activeNoteId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const data = (await response.json()) as {
        note?: NoteRecord;
        error?: string;
      };
      if (!response.ok || !data.note) {
        throw new Error(data.error ?? "Unable to save note.");
      }
      setNotes((prev) => {
        const withoutCurrent = prev.filter((note) => note.id !== data.note!.id);
        return [data.note!, ...withoutCurrent];
      });
      setActiveNoteId(data.note.id);
      setStatus("Note saved.");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to save note.";
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(noteId: string) {
    setSaving(true);
    setError(null);
    setStatus(null);
    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "Unable to delete note.");
      }
      setNotes((prev) => prev.filter((note) => note.id !== noteId));
      if (noteId === activeNoteId) {
        resetForm();
      }
      setStatus("Note deleted.");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to delete note.";
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            variant="outline"
            size="sm"
            onClick={resetForm}
            className="w-full"
          >
            New note
          </Button>
          <div className="space-y-2">
            {sortedNotes.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No notes yet. Capture customer calls, due diligence, or field
                research here.
              </p>
            )}
            {sortedNotes.map((note) => (
              <button
                key={note.id}
                type="button"
                onClick={() => selectNote(note)}
                className={`w-full rounded-xl border px-3 py-2 text-left text-sm transition hover:border-primary ${
                  activeNoteId === note.id ? "border-primary" : "border-border"
                }`}
              >
                <p className="font-semibold text-foreground">{note.title}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(note.updatedAt).toLocaleString()}
                </p>
                {note.tags.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {note.tags.slice(0, 4).map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="self-start">
        <CardHeader>
          <CardTitle>{isEditing ? "Edit note" : "New note"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSave}>
            <div className="space-y-1">
              <Label htmlFor="note-title">Title</Label>
              <Input
                id="note-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Investor briefing call"
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="note-tags">Tags</Label>
              <Input
                id="note-tags"
                value={tags}
                onChange={(event) => setTags(event.target.value)}
                placeholder="financing, due diligence"
              />
              <p className="text-xs text-muted-foreground">
                Separate tags with commas. Example: pipeline, regulation,
                product
              </p>
            </div>
            <div className="space-y-1">
              <Label htmlFor="note-body">Details</Label>
              <Textarea
                id="note-body"
                rows={8}
                value={body}
                onChange={(event) => setBody(event.target.value)}
                placeholder="Capture commitments, blockers, and next steps."
                required
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={pinned}
                onChange={(event) => setPinned(event.target.checked)}
                className="h-4 w-4"
              />
              Pin this note to the top of the list
            </label>

            <div className="flex flex-wrap items-center gap-3">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving…" : isEditing ? "Save changes" : "Save note"}
              </Button>
              {isEditing && (
                <Button
                  type="button"
                  variant="destructive"
                  disabled={saving}
                  onClick={() => handleDelete(activeNoteId!)}
                >
                  Delete
                </Button>
              )}
            </div>
          </form>
          {error && (
            <p className="mt-3 text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
          {status && (
            <p className="mt-3 text-sm text-green-700 dark:text-green-300" role="status">
              {status}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
