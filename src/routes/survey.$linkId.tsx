import { createFileRoute, useParams } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Logo } from "@/components/Logo";
import { CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/survey/$linkId")({
  head: () => ({ meta: [{ title: "Survey — SurveySathi Pro" }] }),
  component: PublicSurvey,
});

function PublicSurvey() {
  const { linkId } = useParams({ from: "/survey/$linkId" });
  const { db, setDB, uid, triggerAutomations } = useStore();
  const { user } = useAuth();
  const startTime = useMemo(() => Date.now(), []);

  const link = db.links.find((l) => l.id === linkId);
  const project = link ? db.projects.find((p) => p.id === link.projectId) : null;
  const survey = project ? db.surveys.find((s) => s.projectId === project.id) : null;
  const earnPoints = project ? Math.round(project.cpi * 10) : 0;

  const isRespondent = user?.role === "respondent";
  const [name, setName] = useState(isRespondent ? user.name : "");
  const [email, setEmail] = useState(isRespondent ? user.email : "");
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  if (!link || !project || !survey) {
    return <Center><h1 className="text-2xl font-bold">Survey not found</h1><p className="text-muted-foreground mt-2">This link is invalid.</p></Center>;
  }
  if (!link.active || project.status !== "live") {
    return <Center>
      <AlertCircle className="size-12 text-amber-500 mx-auto mb-4" />
      <h1 className="text-2xl font-display font-bold">Survey Closed</h1>
      <p className="text-muted-foreground mt-2">This survey is no longer accepting responses.</p>
    </Center>;
  }
  if (done) {
    return <Center>
      <CheckCircle2 className="size-12 text-emerald mx-auto mb-4" />
      <h1 className="text-2xl font-display font-bold">Thank you!</h1>
      <p className="text-muted-foreground mt-2">Your response has been recorded.</p>
      {isRespondent && <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-4 py-2 font-bold text-sm"><Sparkles className="size-4" /> +{earnPoints} pts pending approval</p>}
    </Center>;
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: string[] = [];
    survey.questions.forEach((q) => {
      if (q.required) {
        const v = answers[q.id];
        if (v === undefined || v === "" || (Array.isArray(v) && v.length === 0)) errs.push(q.title);
      }
    });
    if (errs.length) { setErrors(errs); toast.error("Please answer required questions"); return; }
    if (Object.keys(answers).length === 0) { toast.error("Cannot submit empty response"); return; }

    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    const tooFast = timeSpent < 10;
    const qualityScore = tooFast ? 35 : 70 + Math.floor(Math.random() * 25);
    const status = tooFast ? "rejected" : "pending";

    // Track click
    setDB((d) => ({
      ...d,
      links: d.links.map((l) => l.id === link.id ? { ...l, clicks: l.clicks + 1 } : l),
      responses: [
        {
          id: uid("r"),
          projectId: project.id,
          linkId: link.id,
          supplierId: link.supplierId,
          respondentName: name || "Anonymous",
          respondentEmail: email,
          respondentUserId: isRespondent ? user.id : undefined,
          answers,
          status: status as "pending" | "rejected",
          rejectionReason: tooFast ? "Auto-rejected: speeder" : undefined,
          qualityScore,
          timeSpent,
          ip: `0.0.0.${Math.floor(Math.random() * 255)}`,
          submittedAt: new Date().toISOString(),
        },
        ...d.responses,
      ],
    }));
    // run automation engine after submission (auto-approve/reject + credit points)
    setTimeout(() => triggerAutomations({ type: "response:submitted" }), 50);
    setDone(true);
  };

  return (
    <div className="min-h-screen bg-surface py-10 px-4">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex justify-center"><Logo /></div>
        <form onSubmit={submit} className="rounded-2xl border border-border bg-card p-8 shadow-elegant space-y-6">
          <div>
            <p className="text-xs font-bold text-primary uppercase tracking-wider">{project.code}</p>
            <h1 className="font-display text-2xl font-bold mt-1">{survey.title}</h1>
            <p className="text-sm text-muted-foreground mt-1">Please answer the following questions honestly.</p>
            {isRespondent && <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald/10 text-emerald px-3 py-1.5 text-xs font-bold"><Sparkles className="size-3.5" /> Earn ~{earnPoints} pts on approval</div>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div className="space-y-2"><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          </div>

          {survey.questions.map((q, idx) => (
            <div key={q.id} className={`rounded-xl border p-4 space-y-3 ${errors.includes(q.title) ? "border-destructive" : "border-border"}`}>
              <Label className="text-sm font-semibold">
                {idx + 1}. {q.title} {q.required && <span className="text-destructive">*</span>}
              </Label>
              {q.type === "single" && q.options && (
                <RadioGroup value={(answers[q.id] as string) ?? ""} onValueChange={(v) => setAnswers({ ...answers, [q.id]: v })}>
                  {q.options.map((opt) => (
                    <div key={opt} className="flex items-center gap-2"><RadioGroupItem value={opt} id={`${q.id}-${opt}`} /><Label htmlFor={`${q.id}-${opt}`} className="font-normal cursor-pointer">{opt}</Label></div>
                  ))}
                </RadioGroup>
              )}
              {q.type === "multiple" && q.options && (
                <div className="space-y-2">
                  {q.options.map((opt) => {
                    const arr = (answers[q.id] as string[]) ?? [];
                    return (
                      <div key={opt} className="flex items-center gap-2">
                        <Checkbox id={`${q.id}-${opt}`} checked={arr.includes(opt)} onCheckedChange={(c) => {
                          const next = c ? [...arr, opt] : arr.filter((x) => x !== opt);
                          setAnswers({ ...answers, [q.id]: next });
                        }} />
                        <Label htmlFor={`${q.id}-${opt}`} className="font-normal cursor-pointer">{opt}</Label>
                      </div>
                    );
                  })}
                </div>
              )}
              {q.type === "text" && <Textarea value={(answers[q.id] as string) ?? ""} onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })} />}
              {q.type === "number" && <Input type="number" value={(answers[q.id] as string) ?? ""} onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })} />}
              {q.type === "date" && <Input type="date" value={(answers[q.id] as string) ?? ""} onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })} />}
              {q.type === "rating" && (
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} type="button" onClick={() => setAnswers({ ...answers, [q.id]: n })}
                      className={`size-10 rounded-lg border font-bold transition-colors ${answers[q.id] === n ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-accent"}`}>{n}</button>
                  ))}
                </div>
              )}
              {q.type === "dropdown" && q.options && (
                <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={(answers[q.id] as string) ?? ""} onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}>
                  <option value="">Select…</option>
                  {q.options.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              )}
            </div>
          ))}

          <Button type="submit" size="lg" className="w-full">Submit response</Button>
          <p className="text-[10px] text-center text-muted-foreground">Powered by SurveySathi Pro</p>
        </form>
      </div>
    </div>
  );
}

function Center({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="mb-8 flex justify-center"><Logo /></div>
        <div className="rounded-2xl border border-border bg-card p-10 shadow-elegant">{children}</div>
      </div>
    </div>
  );
}
