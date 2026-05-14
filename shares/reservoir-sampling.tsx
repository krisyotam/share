import * as React from 'react';
import { ShareLayout, Aside, Quote } from '../src/components';
import type { ShareMeta } from '../src/types';

export const meta: ShareMeta = {
  title: 'Reservoir Sampling',
  slug: 'reservoir-sampling',
  date: '2026-05-14',
  description: 'Picking a uniform sample from a stream when you don\u2019t know how long it is',
  tags: ['demo', 'algorithm', 'probability'],
  audience: 'public',
};

export default function Share() {
  return (
    <ShareLayout meta={meta}>
      <p>
        You have a stream of items arriving one at a time. You don&rsquo;t
        know how long the stream is. You can only hold a fixed amount in
        memory. You want a uniformly random sample of size <em>k</em>.
        That is the problem reservoir sampling solves, and the solution is
        four lines long.
      </p>

      <h2>Algorithm R (Vitter, 1985)</h2>

      <p>
        Keep the first <em>k</em> items in a buffer. For each subsequent
        item at position <em>i</em>, generate a random integer
        <code>j &isin; [0, i)</code>. If <code>j &lt; k</code>, replace
        slot <em>j</em> with the new item. Otherwise discard it. When the
        stream ends, the buffer holds a uniform sample.
      </p>

      <pre><code>{`function reservoir<T>(stream: Iterable<T>, k: number): T[] {
  const buf: T[] = [];
  let i = 0;
  for (const x of stream) {
    if (i < k) {
      buf.push(x);
    } else {
      const j = Math.floor(Math.random() * (i + 1));
      if (j < k) buf[j] = x;
    }
    i++;
  }
  return buf;
}`}</code></pre>

      <h2>Why it works</h2>

      <p>
        Inductive proof. After the first <em>k</em> items, every item is
        in the buffer with probability 1. When item <em>i+1</em> arrives
        (using 1-indexed positions), it replaces a buffered item with
        probability <code>k / (i+1)</code>. The chance that any earlier
        item survives this step is <code>1 &minus; k/(i+1) &middot; 1/k = 1 &minus; 1/(i+1) = i/(i+1)</code>.
      </p>

      <p>
        Telescoping over all later items, an item that arrived at position
        <em>m</em> survives to the end with probability
      </p>

      <pre><code>{`P(survives) = k/m \u00b7 (m/(m+1)) \u00b7 ((m+1)/(m+2)) \u00b7 \u2026 \u00b7 ((n-1)/n)
            = k/n`}</code></pre>

      <p>
        Every item from a stream of length <em>n</em> ends up in the
        buffer with probability <code>k/n</code>. That is the definition
        of a uniform sample.
      </p>

      <h2>Worked example</h2>

      <p>
        Stream: <code>A B C D E F G</code>. Sample size <em>k</em> = 3.
        After the first three items, the buffer is <code>[A, B, C]</code>.
      </p>

      <table>
        <thead>
          <tr><th>i</th><th>Item</th><th>j</th><th>Replace?</th><th>Buffer</th></tr>
        </thead>
        <tbody>
          <tr><td>3</td><td>D</td><td>1</td><td>yes &rarr; slot 1</td><td>A D C</td></tr>
          <tr><td>4</td><td>E</td><td>4</td><td>no (j &ge; k)</td><td>A D C</td></tr>
          <tr><td>5</td><td>F</td><td>0</td><td>yes &rarr; slot 0</td><td>F D C</td></tr>
          <tr><td>6</td><td>G</td><td>5</td><td>no (j &ge; k)</td><td>F D C</td></tr>
        </tbody>
      </table>

      <h2>Variants worth knowing</h2>

      <table>
        <thead>
          <tr><th>Name</th><th>Use when</th></tr>
        </thead>
        <tbody>
          <tr><td>Algorithm R</td><td>Default. O(n) time, O(k) memory.</td></tr>
          <tr><td>Algorithm L (Li, 1994)</td><td>Skips many items at once using a geometric distribution. O(k(1 + log(n/k))) time.</td></tr>
          <tr><td>A-Res / A-ExpJ (Efraimidis &amp; Spirakis)</td><td>Weighted sampling — each item has weight <em>w<sub>i</sub></em>, included with probability proportional to <em>w<sub>i</sub></em>.</td></tr>
          <tr><td>Distributed reservoir</td><td>Run R on each shard, then merge with weights equal to per-shard counts.</td></tr>
        </tbody>
      </table>

      <Aside>
        <strong>Practical note.</strong> If <code>n</code> is small and
        you can hold the whole stream, just shuffle and slice. Reservoir
        sampling earns its keep on logs, kafka topics, and anything you
        can&rsquo;t rewind.
      </Aside>

      <Quote author="Jeffrey Vitter" source="ACM TOMS, 1985">
        Random sampling with a reservoir is a one-pass technique requiring
        space proportional to the sample size, not to the population.
      </Quote>

      <h2>Common bugs</h2>

      <ul>
        <li><strong>Off-by-one in the index.</strong> The replacement check is <code>j &lt; k</code>, not <code>j &le; k</code>. The random range is <code>[0, i+1)</code> using 0-indexed <em>i</em>, equivalently <code>[0, i)</code> if <em>i</em> counts items already seen including the current one.</li>
        <li><strong>Reusing the same RNG state across threads.</strong> Use a thread-local generator, or you&rsquo;ll cluster replacements.</li>
        <li><strong>Returning the buffer in arrival order.</strong> If callers expect random order, shuffle the buffer at the end.</li>
        <li><strong>Sampling without replacement, then doing it again.</strong> Each pass is independent. Two reservoir samples of the same stream are <em>not</em> jointly uniform — they share items with elevated probability.</li>
      </ul>
    </ShareLayout>
  );
}
