import * as React from 'react';
import { ShareLayout, Aside, Quote } from '../src/components';
import type { ShareMeta } from '../src/types';

export const meta: ShareMeta = {
  title: 'The Antikythera Mechanism',
  slug: 'antikythera-mechanism',
  date: '2026-05-14',
  description: 'An analog computer from the second century BC, dredged out of a Greek shipwreck',
  tags: ['demo', 'history', 'computing'],
  audience: 'public',
};

export default function Share() {
  return (
    <ShareLayout meta={meta}>
      <p>
        In 1901 a sponge diver named Elias Stadiatos surfaced off the
        island of Antikythera with a bronze gear-wheel in his hand. The
        wreck below him had been on the bottom for two thousand years.
        The wheel was part of a shoebox-sized machine of at least thirty
        meshed gears that predicted eclipses, tracked the moon&rsquo;s
        anomalistic orbit, and read out the four-year cycle of the
        Olympic games. Nothing of comparable mechanical complexity
        survives from earlier than the fourteenth century. The mechanism
        sat in a museum drawer for sixty years before anyone realized
        what it was.
      </p>

      <h2>What it did</h2>

      <p>
        Turn the side handle. The front face displays the position of
        the sun and moon against the zodiac, with a small ball tracking
        lunar phase. The back face displays two spiral dials — the
        upper one a 235-month Metonic calendar, the lower a 223-month
        Saros eclipse cycle. Small auxiliary dials count the
        four-year Olympiad cycle and the 76-year Callippic cycle. Every
        marker advances by the right ratio because the gears were cut
        to the right tooth counts.
      </p>

      <table>
        <thead>
          <tr><th>Output</th><th>Cycle</th><th>Realized by</th></tr>
        </thead>
        <tbody>
          <tr><td>Solar position</td><td>365.25 days</td><td>Main drive gear &times; calendar dial</td></tr>
          <tr><td>Lunar position</td><td>27.32 days (sidereal)</td><td>Compound gear train, ratio 254:19</td></tr>
          <tr><td>Lunar anomaly</td><td>&asymp; 8.85 years</td><td>Pin-and-slot mechanism &mdash; gears off-axis to vary speed</td></tr>
          <tr><td>Lunar phase</td><td>29.53 days (synodic)</td><td>Differential gear subtracting sun from moon</td></tr>
          <tr><td>Saros</td><td>223 synodic months</td><td>Spiral back-dial pointer</td></tr>
          <tr><td>Metonic</td><td>235 synodic months</td><td>Upper spiral, 5 turns</td></tr>
          <tr><td>Olympiad</td><td>4 years</td><td>Small auxiliary dial, names of games inscribed</td></tr>
        </tbody>
      </table>

      <h2>The pin-and-slot</h2>

      <p>
        The moon does not move at a constant speed across the sky. It
        runs faster near perigee and slower near apogee. To model this,
        the maker mounted one gear off-center on the face of another and
        coupled them with a pin engaging a radial slot. As the carrier
        gear rotates, the pin&rsquo;s distance from the slot&rsquo;s
        pivot varies, and the driven gear&rsquo;s angular speed varies
        with it. The result is a sinusoidal modulation of the
        moon&rsquo;s indicator — the first known mechanical
        implementation of an epicycle.
      </p>

      <Aside>
        <strong>Why it matters.</strong> Hipparchus had described the
        moon&rsquo;s anomaly mathematically a century earlier. The
        Antikythera mechanism translates his geometry directly into
        metal. It is the earliest physical object that we know was
        designed by reading a model and reproducing it in gears.
      </Aside>

      <h2>How they figured it out</h2>

      <p>
        Three campaigns of imaging, decades apart, slowly revealed the
        inscriptions and gear counts on fragments too corroded to handle:
      </p>

      <table>
        <thead>
          <tr><th>Year</th><th>Method</th><th>What it added</th></tr>
        </thead>
        <tbody>
          <tr><td>1902</td><td>Naked eye, then plaster casts</td><td>Identified as a clockwork artifact</td></tr>
          <tr><td>1971</td><td>X-ray radiography (Derek de Solla Price)</td><td>First gear-count estimates, hypothesis of an astronomical computer</td></tr>
          <tr><td>2005</td><td>3D X-ray microtomography &amp; PTM imaging (Antikythera Mechanism Research Project)</td><td>Read ~3500 characters of inscription, full gear topology, Saros &amp; Metonic confirmed</td></tr>
          <tr><td>2021</td><td>UCL physical reconstruction</td><td>Verified the front cosmos display reproduces the inscriptions</td></tr>
        </tbody>
      </table>

      <h2>The shipwreck</h2>

      <p>
        Carbon dating of the wreck&rsquo;s timbers and the amphorae on
        board place the sinking around 70&ndash;60 BC. The mechanism
        itself was older — its inscriptions use letterforms consistent
        with the second century BC, and the Olympiad dial names games
        whose order points to a maker working in Corinth or Syracuse.
        It was probably ten to a hundred years old when it went down.
      </p>

      <Quote author="Derek de Solla Price" source="Gears from the Greeks, 1974">
        Nothing like this instrument is preserved elsewhere. Nothing
        comparable to it is known from any ancient scientific text or
        literary allusion. It is as if a jet plane were found in
        Tutankhamen&rsquo;s tomb.
      </Quote>

      <h2>What we still don&rsquo;t know</h2>

      <ul>
        <li>Whether it predicted planetary positions. The front face has empty bearings consistent with planet pointers, but no surviving gears for them. The inscriptions reference Venus and Mercury cycles, so the design probably included them.</li>
        <li>Who built it. The most popular candidate is the school of Posidonius on Rhodes, but it is a guess.</li>
        <li>How many existed. The skill required to cut the gears was real. The materials were cheap. There were probably more.</li>
        <li>Why no successor survives. The mechanism is a thousand years older than the next comparable European artifact (the Verge escapement clock, 14th c.). The technique went somewhere, then disappeared.</li>
      </ul>
    </ShareLayout>
  );
}
