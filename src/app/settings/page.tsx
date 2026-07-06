import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const SHORTCUTS = [
  ["T", "Create task"], ["C", "Create client"], ["P", "Create project"], ["N", "Create note"],
  ["/", "Search"], ["⌘K / Ctrl+K", "Command palette"],
  ["D", "Dashboard"], ["G", "Calendar"], ["I", "Inbox"],
];

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <div className="text-[11px] uppercase tracking-widest text-white/40">Preferences</div>
        <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">Settings</h1>
      </header>

      <Card>
        <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
        <CardBody className="space-y-3">
          <Row label="Display name" value="Devima" />
          <Row label="Timezone" value="Asia/Kolkata" />
          <Row label="Email" value="thedevimapro@gmail.com" />
        </CardBody>
      </Card>

      <Card id="shortcuts">
        <CardHeader><CardTitle>Keyboard shortcuts</CardTitle></CardHeader>
        <CardBody className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {SHORTCUTS.map(([k, l]) => (
            <div key={k} className="flex items-center justify-between rounded-xl border border-white/[0.05] bg-white/[0.02] px-3 py-2 text-sm">
              <span>{l}</span>
              <kbd className="rounded border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[11px] text-white/70">{k}</kbd>
            </div>
          ))}
        </CardBody>
      </Card>

      <Card>
        <CardHeader><CardTitle>Appearance</CardTitle></CardHeader>
        <CardBody className="space-y-2">
          <Row label="Theme" value={<Badge className="border-brand-400/30 bg-brand-500/10 text-brand-200">Dark (default)</Badge>} />
          <Row label="Density" value="Comfortable" />
          <Row label="Reduce motion" value="System" />
        </CardBody>
      </Card>

      <Card>
        <CardHeader><CardTitle>Pomodoro</CardTitle></CardHeader>
        <CardBody className="space-y-2">
          <Row label="Focus length" value="25 minutes" />
          <Row label="Break length" value="5 minutes" />
        </CardBody>
      </Card>

      <Card>
        <CardHeader><CardTitle>About</CardTitle></CardHeader>
        <CardBody className="space-y-2 text-sm text-white/60">
          <p>Todu — a premium productivity OS made for freelance developers.</p>
          <p className="text-white/40">v0.1.0 · built with Next.js, Prisma & love.</p>
        </CardBody>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/[0.05] bg-white/[0.02] px-3 py-2 text-sm">
      <span className="text-white/60">{label}</span>
      <span className="font-medium text-white">{value}</span>
    </div>
  );
}
