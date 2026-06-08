import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { PageHeader, ConfirmDelete } from "@/components/Common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import type { Question, QuestionType } from "@/lib/types";

export const Route = createFileRoute("/app/builder")({ component: Builder });

function Builder() {
  const { db, setDB, uid } = useStore();
  const [activeProjectId, setActive] = useState<string>(db.projects[0]?.id ?? "");
  const survey = db.surveys.find((s) => s.projectId === activeProjectId);
  const project = db.projects.find((p) => p.id === activeProjectId);

  const update = (questions: Question[]) => {
    if (!survey) return;
    setDB((db) => ({ ...db, surveys: db.surveys.map((s) => s.id === survey.id ? { ...s, questions } : s) }));
  };

  const addQ = () => {
    if (!survey) return;
    update([...survey.questions, { id: uid("q"), type: "single", title: "New question", required: false, options: ["Option 1", "Option 2"] }]);
    toast.success("Question added");
  };

  const move = (i: number, dir: -1 | 1) => {
    if (!survey) return;
    const next = [...survey.questions];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    update(next);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Survey Builder" subtitle="Drag-and-drop builder for your survey questions."
        action={<Select value={activeProjectId} onValueChange={setActive}><SelectTrigger className="w-64"><SelectValue placeholder="Project" /></SelectTrigger><SelectContent>{db.projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.code} — {p.name}</SelectItem>)}</SelectContent></Select>} />
      {!survey ? (
        <div className="text-center text-muted-foreground py-12">No survey selected.</div>
      ) : (
        <>
          <div className="rounded-2xl border border-border bg-card p-5 flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold">{project?.name}</h3>
              <p className="text-xs text-muted-foreground">{survey.questions.length} questions</p>
            </div>
            <Button onClick={addQ}><Plus className="size-4" /> Add question</Button>
          </div>

          <div className="space-y-3">
            {survey.questions.map((q, i) => (
              <div key={q.id} className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-start gap-3">
                  <div className="flex flex-col gap-1 mt-1">
                    <Button size="icon" variant="ghost" className="size-6" onClick={() => move(i, -1)}><ChevronUp className="size-3" /></Button>
                    <span className="text-xs text-center text-muted-foreground">{i + 1}</span>
                    <Button size="icon" variant="ghost" className="size-6" onClick={() => move(i, 1)}><ChevronDown className="size-3" /></Button>
                  </div>
                  <div className="flex-1 grid grid-cols-3 gap-3">
                    <div className="space-y-2 col-span-2"><Label>Question</Label><Input value={q.title} onChange={(e) => update(survey.questions.map((x) => x.id === q.id ? { ...x, title: e.target.value } : x))} /></div>
                    <div className="space-y-2"><Label>Type</Label><Select value={q.type} onValueChange={(v) => update(survey.questions.map((x) => x.id === q.id ? { ...x, type: v as QuestionType } : x))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{(["single", "multiple", "text", "rating", "dropdown", "number", "date"] as QuestionType[]).map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select></div>
                    {(q.type === "single" || q.type === "multiple" || q.type === "dropdown") && (
                      <div className="col-span-3 space-y-2"><Label>Options (comma separated)</Label><Input value={(q.options ?? []).join(", ")} onChange={(e) => update(survey.questions.map((x) => x.id === q.id ? { ...x, options: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) } : x))} /></div>
                    )}
                    <div className="col-span-3 flex items-center justify-between">
                      <div className="flex items-center gap-2"><Switch checked={q.required} onCheckedChange={(c) => update(survey.questions.map((x) => x.id === q.id ? { ...x, required: c } : x))} /><Label>Required</Label></div>
                      <ConfirmDelete onConfirm={() => { update(survey.questions.filter((x) => x.id !== q.id)); toast.success("Removed"); }}><Button size="sm" variant="ghost"><Trash2 className="size-3 text-destructive" /></Button></ConfirmDelete>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {survey.questions.length === 0 && <div className="rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center text-sm text-muted-foreground">No questions yet. Click "Add question" to start.</div>}
          </div>
        </>
      )}
    </div>
  );
}
