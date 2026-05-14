import * as React from 'react';
import { ShareLayout, Aside, Diff } from '../src/components';
import type { ShareMeta } from '../src/types';

export const meta: ShareMeta = {
  title: 'DNS Rebinding',
  slug: 'dns-rebinding',
  date: '2026-05-14',
  description: 'How an attacker swaps an IP after your browser caches the origin',
  tags: ['demo', 'security', 'web'],
  audience: 'public',
};

export default function Share() {
  return (
    <ShareLayout meta={meta}>
      <p>
        The same-origin policy says JavaScript on
        <code>https://evil.com</code> can&rsquo;t read responses from
        <code>https://your-router.local</code>. The browser enforces this
        by checking the <em>origin</em> — a tuple of scheme, host, and
        port. Hostnames, not IP addresses. That distinction is the bug.
      </p>

      <h2>The attack in five steps</h2>

      <ol>
        <li>The victim visits <code>evil.com</code>.</li>
        <li>The page loads a script from <code>victim.evil.com</code>. The attacker&rsquo;s DNS server replies with a real IP (their server) and a TTL of one second.</li>
        <li>After the script loads, it polls <code>victim.evil.com</code> every two seconds.</li>
        <li>The TTL expires. The browser asks DNS again. This time the attacker&rsquo;s server replies with <em>the victim&rsquo;s</em> IP — e.g. <code>192.168.1.1</code>, the local router.</li>
        <li>The same origin (<code>victim.evil.com</code>) now points at the router. The script&rsquo;s next fetch goes to the router&rsquo;s admin interface, with the router&rsquo;s cookies, from a page the same-origin policy treats as identical.</li>
      </ol>

      <h2>What the attacker reaches</h2>

      <table>
        <thead>
          <tr><th>Target</th><th>Why it&rsquo;s reachable</th></tr>
        </thead>
        <tbody>
          <tr><td>Home router admin</td><td>Listens on RFC1918; usually no auth or default creds</td></tr>
          <tr><td>Smart speakers, printers</td><td>HTTP APIs bound to <code>0.0.0.0</code></td></tr>
          <tr><td>Cloud metadata service</td><td><code>169.254.169.254</code> answers any caller from inside the VPC</td></tr>
          <tr><td>localhost dev servers</td><td>Postgres admin, debuggers, code-server, vibe-coding tools</td></tr>
          <tr><td>Internal corporate apps</td><td>Anything bound to a private IP, unauthenticated for &ldquo;internal use&rdquo;</td></tr>
        </tbody>
      </table>

      <h2>Why TLS doesn&rsquo;t save you</h2>

      <p>
        TLS validates the hostname on the certificate against the
        hostname requested. The attacker is impersonating their own
        hostname (<code>victim.evil.com</code>), so the cert is valid.
        The target service usually serves plain HTTP, so TLS isn&rsquo;t
        even in play on the second request.
      </p>

      <h2>The four defenses</h2>

      <h3>1. Validate the <code>Host</code> header on the server</h3>

      <p>
        The router or service must reject any request whose
        <code>Host</code> doesn&rsquo;t match an expected value. This is
        the single most effective fix, and it&rsquo;s the responsibility
        of the service, not the browser.
      </p>

      <Diff filename="server.js">{`
 app.use((req, res, next) => {
-  next();
+  const ok = ['router.local', '192.168.1.1'];
+  if (!ok.includes(req.hostname)) return res.status(421).end();
+  next();
 });
`}</Diff>

      <h3>2. Pin DNS in the resolver</h3>

      <p>
        Stub resolvers like dnsmasq and unbound can drop responses that
        resolve to RFC1918 addresses for non-local zones. This blocks
        the second-stage answer entirely.
      </p>

      <pre><code>{`# dnsmasq.conf
stop-dns-rebind
rebind-localhost-ok
rebind-domain-ok=/trusted.example/`}</code></pre>

      <h3>3. Require authentication on local services</h3>

      <p>
        Even a four-character password defeats this attack, because the
        attacker&rsquo;s script can&rsquo;t see the response from the
        login form (different origin from the attacker&rsquo;s point of
        view, even though browsers treat them as identical). Most
        consumer routers ship without one, which is the original sin.
      </p>

      <h3>4. CORS preflight on dangerous endpoints</h3>

      <p>
        Browsers send an <code>OPTIONS</code> preflight before non-simple
        requests. If the local service refuses to add
        <code>Access-Control-Allow-Origin</code>, the script can fire
        the request but cannot read the response. For state-changing
        endpoints, that is enough.
      </p>

      <Aside>
        <strong>Browser-side mitigations exist but are spotty.</strong>
        Chrome&rsquo;s Private Network Access spec requires preflight
        when a public-network page reaches a private one. It&rsquo;s
        landed in stages and gated behind enterprise overrides.
        Don&rsquo;t rely on it as a primary defense.
      </Aside>

      <h2>What this actually looks like in logs</h2>

      <Diff>{`
 GET /admin HTTP/1.1
 Host: victim.evil.com
-X-Forwarded-For: 198.51.100.7
+X-Forwarded-For: 192.168.1.42
 User-Agent: Mozilla/5.0 (\u2026)
 Cookie: session=...
`}</Diff>

      <p>
        The router sees a request whose <code>Host</code> header is a
        hostname it doesn&rsquo;t own. That is the signature. Validate
        the header, and the attack collapses.
      </p>

      <h2>Further reading</h2>

      <ul>
        <li>Daniel B. Jackson, &ldquo;DNS Rebinding 101&rdquo; (2008) — the canonical writeup.</li>
        <li><code>singularity</code> — open-source toolkit by NCC Group that demonstrates the attack end to end on a lab network.</li>
        <li>Google Project Zero, <em>The fully remote attack surface of the iPhone</em> (2019) — uses rebinding to exfiltrate from a local helper service.</li>
      </ul>
    </ShareLayout>
  );
}
