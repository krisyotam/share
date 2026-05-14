import * as React from 'react';
import { ShareLayout, Diff, Aside, Quote } from '../src/components';
import type { ShareMeta } from '../src/types';

export const meta: ShareMeta = {
  title: 'The Git Patch Workflow',
  slug: 'git-patch-workflow',
  date: '2026-05-14',
  description: 'Sending and applying patches the way the kernel does — without a pull request',
  tags: ['demo', 'git', 'workflow'],
  audience: 'public',
};

export default function Share() {
  return (
    <ShareLayout meta={meta}>
      <p>
        Before pull requests took over, code review happened over email. A
        contributor ran <code>git format-patch</code>, attached a thread of
        <code>.patch</code> files, and a maintainer applied them with
        <code>git am</code>. The Linux kernel, Git itself, and Postgres still
        work this way. It is faster than you remember and outlives any one
        forge.
      </p>

      <h2>The five commands</h2>

      <table>
        <thead>
          <tr><th>Command</th><th>What it does</th></tr>
        </thead>
        <tbody>
          <tr><td><code>git format-patch -3</code></td><td>Write the last three commits as numbered <code>.patch</code> files in the cwd.</td></tr>
          <tr><td><code>git format-patch origin/main</code></td><td>Write every commit on the current branch that isn&rsquo;t on <code>main</code>.</td></tr>
          <tr><td><code>git send-email *.patch</code></td><td>Mail the patches to a list (uses your <code>~/.gitconfig</code> SMTP).</td></tr>
          <tr><td><code>git am 0001-fix-thing.patch</code></td><td>Apply a patch <em>as a commit</em> — preserves author, message, date.</td></tr>
          <tr><td><code>git apply --check foo.patch</code></td><td>Dry-run apply — works for any unified diff, not just git ones.</td></tr>
        </tbody>
      </table>

      <h2>Anatomy of a patch</h2>

      <p>
        Every file <code>format-patch</code> produces is a valid RFC 5322
        email. The header carries author, date, and subject; the body carries
        the commit message; the rest is a unified diff.
      </p>

      <Diff filename="0001-fix-trailing-whitespace.patch">{`
From a3b8e2f0d4c9a17f8c1bb3e8b2dee4c2c2f0fe11 Mon Sep 17 00:00:00 2001
From: Kris Yotam <kris@example.com>
Date: Wed, 14 May 2026 09:12:33 -0500
Subject: [PATCH] strip trailing whitespace in lexer

The tokenizer was emitting trailing spaces on continuation
lines, which broke equality checks downstream.
---
 src/lex.ts | 3 +--
 1 file changed, 1 insertion(+), 2 deletions(-)
@@ -42,8 +42,7 @@ function nextToken(s: string): Token {
   const m = s.match(/^\\s*(\\S+)/);
-  if (!m) return null;
-  return { kind: 'ident', text: m[1] };
+  return m ? { kind: 'ident', text: m[1].trimEnd() } : null;
 }
`}</Diff>

      <h2><code>am</code> vs <code>apply</code></h2>

      <table>
        <thead>
          <tr><th></th><th><code>git am</code></th><th><code>git apply</code></th></tr>
        </thead>
        <tbody>
          <tr><td>Input</td><td>RFC 5322 mail</td><td>Any unified diff</td></tr>
          <tr><td>Author</td><td>Preserved from headers</td><td>You (next commit)</td></tr>
          <tr><td>Date</td><td>Preserved</td><td>Now</td></tr>
          <tr><td>Creates commit</td><td>Yes</td><td>No — leaves working tree dirty</td></tr>
          <tr><td>Three-way merge</td><td><code>-3</code> flag</td><td><code>--3way</code> flag</td></tr>
          <tr><td>On conflict</td><td>Pauses; resolve, then <code>git am --continue</code></td><td>Refuses; you fix the diff or use <code>--reject</code></td></tr>
        </tbody>
      </table>

      <h2>When the patch doesn&rsquo;t apply</h2>

      <p>
        A patch fails when the surrounding context has drifted. The fix is
        almost always to add fuzz tolerance or fall back to a three-way
        merge using the blob SHAs the patch carries.
      </p>

      <Diff>{`
 $ git am 0001-fix.patch
 Applying: fix trailing whitespace
-error: patch failed: src/lex.ts:42
-error: src/lex.ts: patch does not apply
+Patch failed at 0001 fix trailing whitespace
+hint: Use 'git am --show-current-patch=diff' to see the failed patch
 $ git am --3way --continue
`}</Diff>

      <Aside>
        <strong>Three-way merge.</strong> The patch records the SHA of the
        original blobs. <code>--3way</code> looks those blobs up in your
        object store, applies the patch to them, then merges the result
        back into your tree. Works even when local context has changed.
      </Aside>

      <h2>Round-trip review</h2>

      <p>
        On the receiving side, a reviewer reads the patches, comments
        inline by quoting, and replies. Anything substantial gets a new
        version: <code>format-patch -v2</code> writes
        <code>v2-0001-…</code> files. The maintainer threads through
        revisions until a series is mergeable, then runs
        <code>git am</code> on the final round.
      </p>

      <Quote author="Linus Torvalds" source="LKML, 2014">
        I want a clean history. Patches over email give me that without
        forcing me to use a web interface.
      </Quote>

      <h2>When to reach for it</h2>

      <ul>
        <li>Contributing to a project that doesn&rsquo;t take PRs (kernel, Git, Postgres, OpenBSD).</li>
        <li>Moving a series of commits between forks without pushing branches.</li>
        <li>Bundling a feature into a single email attachment for review.</li>
        <li>Recovering work from a corrupted clone — patches are plain text and survive.</li>
      </ul>

      <p>
        The pull request didn&rsquo;t replace this workflow; it sits on top
        of it. Every PR is, in the end, a series of patches.
      </p>
    </ShareLayout>
  );
}
