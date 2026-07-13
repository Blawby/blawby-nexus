import { EmailsTable } from "./components/EmailsTable";

export const EmailsList = () => {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-normal">Emails</h1>
        <p className="text-sm text-muted-foreground">
          Search platform emails, preview stored content, and copy actionable links.
        </p>
      </div>
      <EmailsTable />
    </section>
  );
};
