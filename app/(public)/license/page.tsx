import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "License",
  description: "ForgeStack commercial license terms.",
};

/**
 * /license — commercial license terms for the ForgeStack starter kit.
 *
 * This page is a public marketing/legal page. The actual binding
 * license is a separate EULA document customers sign at purchase;
 * this page is a summary, not legal advice.
 */
export default function LicensePage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-12 sm:px-6">
      <div className="flex flex-col gap-2">
        <p className="font-mono text-caption-mono uppercase text-mute">Legal</p>
        <h1 className="text-display-lg text-ink">License.</h1>
        <p className="text-body-md text-body">
          ForgeStack is commercial software. The full text of the
          End-User License Agreement (EULA) is delivered with every
          purchase. The summary below is informational, not legal
          advice.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>What you can do</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-body-md text-body">
          <p>
            <strong>Use the Software</strong> to build commercial
            applications for yourself or your clients.
          </p>
          <p>
            <strong>Modify the Software</strong> for your own
            application. You may add features, remove features, and
            integrate with third-party services.
          </p>
          <p>
            <strong>Ship</strong> the resulting application to as
            many end users as you want, with no per-seat fees.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>What you can't do</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-body-md text-body">
          <p>
            <strong>Resell or redistribute the Software itself</strong>{" "}
            (the source code, unmodified or modified, as a competing
            starter kit or template).
          </p>
          <p>
            <strong>Share your license key</strong> with anyone outside
            your organization. One license = one organization.
          </p>
          <p>
            <strong>Hold us liable</strong> for damages arising from
            use of the Software. (See the full EULA for the
            indemnification clauses.)
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Support and updates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-body-md text-body">
          <p>
            <strong>12 months</strong> of email support and minor /
            patch version updates from the date of purchase.
          </p>
          <p>
            <strong>Major version upgrades</strong> (e.g. 1.x → 2.x)
            are sold separately. You'll get a discount.
          </p>
          <Badge variant="default">v1.0.0</Badge>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Questions?</CardTitle>
        </CardHeader>
        <CardContent className="text-body-md text-body">
          Email{" "}
          <a
            href="mailto:licensing@forgestack.dev"
            className="text-link underline-offset-4 hover:underline"
          >
            licensing@forgestack.dev
          </a>
          .
        </CardContent>
      </Card>
    </div>
  );
}
