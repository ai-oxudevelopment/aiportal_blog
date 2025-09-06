"use client";

import { useState } from "react";
import Header from "../../../components/Header";
import Sidebar from "../../../components/Sidebar";
import WriterActionAgent from "../../../components/WriterActionAgent";
import EbookDownload from "../../../components/EbookDownload";

export default function Page() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isTocOpen, setIsTocOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div
      className="w-full min-h-screen dark:bg-black transition-colors duration-200 flex-col flex items-start justify-between bg-white"
      data-oid="r28vy42">

      {/* Header */}
      <Header onToggleMenu={toggleMenu} isMenuOpen={isMenuOpen} data-oid="13.7t1v" />

      {/* Sidebar */}
      <Sidebar isMenuOpen={isMenuOpen} data-oid="3ltv4f0" />

      {/* Overlay */}
      {isMenuOpen &&
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-25 transition-opacity duration-300 md:hidden"
        onClick={toggleMenu}
        data-oid="27np24_" />

      }

      {/* Hero Section */}
      <div
        className="relative w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
        data-oid="httvkxv">

        <div
          className="container mx-auto px-6 py-16 lg:py-24"
          data-oid="_slfhu_">

          <div
            className="grid lg:grid-cols-2 gap-12 items-center"
            data-oid="737rs6w">

            {/* Left side - Cover Image */}
            <div className="relative" data-oid="qgdir48">
              <div
                className="bg-slate-800 rounded-lg p-8 aspect-square flex items-center justify-center"
                data-oid="f5oswmx"
                key="olk-xNf7">

                {/* Abstract geometric patterns */}
                <div
                  className="grid grid-cols-2 gap-8 w-full h-full"
                  data-oid="4vrrzbc">

                  {/* Top left - Circles grid */}
                  <div className="grid grid-cols-3 gap-2" data-oid="7nd4xuo">
                    {Array.from({ length: 9 }).map((_, i) =>
                    <div
                      key={i}
                      className="border border-slate-600 rounded-full aspect-square"
                      data-oid="6:7.e5e">
                    </div>
                    )}
                  </div>

                  {/* Top right - Concentric circles */}
                  <div
                    className="relative flex items-center justify-center"
                    data-oid="ikyamyz">

                    {Array.from({ length: 5 }).map((_, i) =>
                    <div
                      key={i}
                      className="absolute border border-slate-600 rounded-full"
                      style={{
                        width: `${(i + 1) * 20}%`,
                        height: `${(i + 1) * 20}%`
                      }}
                      data-oid="4e2we-b">
                    </div>
                    )}
                  </div>

                  {/* Bottom left - Radial lines */}
                  <div
                    className="relative flex items-center justify-center"
                    data-oid="m20ltxb">

                    <div className="w-full h-full relative" data-oid="1uljnz8">
                      {Array.from({ length: 16 }).map((_, i) =>
                      <div
                        key={i}
                        className="absolute w-0.5 bg-slate-600 origin-bottom"
                        style={{
                          height: "50%",
                          left: "50%",
                          bottom: "50%",
                          transform: `translateX(-50%) rotate(${i * 22.5}deg)`
                        }}
                        data-oid="u00eier">
                      </div>
                      )}
                    </div>
                  </div>

                  {/* Bottom right - Pie chart */}
                  <div
                    className="relative flex items-center justify-center"
                    data-oid="jsjgcg.">

                    <div
                      className="w-20 h-20 border border-slate-600 rounded-full relative overflow-hidden"
                      data-oid="85wlg.:">

                      <div
                        className="absolute inset-0 bg-slate-600"
                        style={{
                          clipPath:
                          "polygon(50% 50%, 50% 0%, 100% 0%, 100% 50%)"
                        }}
                        data-oid="k7kx8sm">
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Content */}
            <div className="text-white" data-oid="mul5tn9">
              <div className="mb-6" data-oid="9-ah8i4">
                <span
                  className="text-sm font-medium text-slate-300 tracking-wider uppercase"
                  data-oid="h54_.0e">

                  WRITER • GUIDES
                </span>
              </div>

              <h1
                className="text-4xl lg:text-6xl font-bold mb-6 leading-tight"
                data-oid="n2tl4ws">

                The state of
                <br data-oid="qurfrb4" />
                <span className="text-slate-200" data-oid="iowdh7l">
                  generative AI
                </span>
              </h1>

              <p className="text-xl text-slate-300 mb-8" data-oid="x0oqvt_">
                in the enterprise 2024
              </p>

              {/* Social sharing buttons */}
              <div className="flex gap-4" data-oid="k4y_oxy">
                <button
                  className="w-10 h-10 bg-slate-700 hover:bg-slate-600 rounded-full flex items-center justify-center transition-colors"
                  data-oid="7:oxp.y">

                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    data-oid="xq6oliu">

                    <path
                      d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"
                      data-oid="2gea0qb" />

                  </svg>
                </button>
                <button
                  className="w-10 h-10 bg-slate-700 hover:bg-slate-600 rounded-full flex items-center justify-center transition-colors"
                  data-oid="ylxpf0m">

                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    data-oid="65ky4gs">

                    <path
                      d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
                      data-oid="fywgy8i" />

                  </svg>
                </button>
                <button
                  className="w-10 h-10 bg-slate-700 hover:bg-slate-600 rounded-full flex items-center justify-center transition-colors"
                  data-oid="sqpq1z4">

                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    data-oid="42modxu">

                    <path
                      d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                      data-oid="gskjdgd" />

                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div
        className="w-full flex justify-center px-6 py-16 pt-20"
        data-oid="v9telz_">

        <div className="max-w-4xl w-full" data-oid="u0zn_hi">
          {/* Main Content */}
          <div className="w-full" data-oid="qmev6xk" key="olk-0sKm">
            {/* Key Findings Section */}
            <section id="key-findings" className="mb-16" data-oid="lv:es4_">
              <div className="mb-8" data-oid="8vcd8hq">
                <div
                  className="w-16 h-1 bg-blue-500 mb-4"
                  data-oid="bwb4t9u">
                </div>
                <h2
                  className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6"
                  data-oid="io3ao8b">

                  Key findings
                </h2>
              </div>

              <div
                className="bg-blue-50 dark:bg-slate-800 rounded-lg p-8 space-y-8"
                data-oid="6gctv49">

                {/* Finding 1 */}
                <div className="flex gap-6" data-oid="6eekme.">
                  <div className="flex-shrink-0" data-oid="ssmb8mk">
                    <span
                      className="inline-flex items-center justify-center w-8 h-8 bg-blue-600 text-white font-bold rounded-full text-sm"
                      data-oid="zv9qvfp">

                      1
                    </span>
                  </div>
                  <div data-oid="r2_0:iq">
                    <h3
                      className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2"
                      data-oid="19_vg4d">

                      Widespread adoption and expectations
                    </h3>
                    <p
                      className="text-gray-700 dark:text-gray-300 leading-relaxed"
                      data-oid="84h0ai4">

                      96% of companies view generative AI as a key enabler, with
                      82% anticipating rapid growth in its adoption across
                      various departments.
                    </p>
                  </div>
                </div>

                {/* Finding 2 */}
                <div className="flex gap-6" data-oid="vxdeb7o">
                  <div className="flex-shrink-0" data-oid="89mhic5">
                    <span
                      className="inline-flex items-center justify-center w-8 h-8 bg-blue-600 text-white font-bold rounded-full text-sm"
                      data-oid=".cttqk5">

                      2
                    </span>
                  </div>
                  <div data-oid="yllu_e0">
                    <h3
                      className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2"
                      data-oid=":c5a9jt">

                      Significant benefits across departments
                    </h3>
                    <p
                      className="text-gray-700 dark:text-gray-300 leading-relaxed"
                      data-oid="gm15_-s">

                      The most significant benefits will be seen in IT,
                      security, and customer service, with generative AI
                      improving efficiency, reducing costs, and enhancing
                      customer satisfaction.
                    </p>
                  </div>
                </div>

                {/* Finding 3 */}
                <div className="flex gap-6" data-oid=".jo9if5">
                  <div className="flex-shrink-0" data-oid="d8d510b">
                    <span
                      className="inline-flex items-center justify-center w-8 h-8 bg-blue-600 text-white font-bold rounded-full text-sm"
                      data-oid="vpqotv4">

                      3
                    </span>
                  </div>
                  <div data-oid="npvjiwg">
                    <h3
                      className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2"
                      data-oid="wqscokt">

                      Security and data concerns
                    </h3>
                    <p
                      className="text-gray-700 dark:text-gray-300 leading-relaxed"
                      data-oid="4rr.hhi">

                      95% of companies have concerns about the need for enhanced
                      security measures, while 94% also have concerns about data
                      protection with generative AI applications.
                    </p>
                  </div>
                </div>

                {/* Finding 4 */}
                <div className="flex gap-6" data-oid="18ly5j-">
                  <div className="flex-shrink-0" data-oid="qod:9t3">
                    <span
                      className="inline-flex items-center justify-center w-8 h-8 bg-blue-600 text-white font-bold rounded-full text-sm"
                      data-oid="vyz5k6r">

                      4
                    </span>
                  </div>
                  <div data-oid="b0x3t13">
                    <h3
                      className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2"
                      data-oid="se9fq.e">

                      Challenges with in-house solutions
                    </h3>
                    <p
                      className="text-gray-700 dark:text-gray-300 leading-relaxed"
                      data-oid="q8e5tdh">

                      61% of companies have faced accuracy issues with in-house
                      generative AI solutions, and only 17% rate their in-house
                      projects as excellent. This highlights a general
                      dissatisfaction with the performance of self-developed AI
                      solutions.
                    </p>
                  </div>
                </div>

                {/* Finding 5 */}
                <div className="flex gap-6" data-oid="rx4pz7a">
                  <div className="flex-shrink-0" data-oid="t70r1k:">
                    <span
                      className="inline-flex items-center justify-center w-8 h-8 bg-blue-600 text-white font-bold rounded-full text-sm"
                      data-oid="mi92lzg">

                      5
                    </span>
                  </div>
                  <div data-oid="ejsh:yc">
                    <h3
                      className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2"
                      data-oid="l23gooe">

                      Preference for private (in-house) solutions
                    </h3>
                    <p
                      className="text-gray-700 dark:text-gray-300 leading-relaxed"
                      data-oid="z46_7rg">

                      76% of companies are using or planning to use home-grown
                      generative AI solutions because of their concerns about
                      security and data governance.
                    </p>
                  </div>
                </div>

                {/* Finding 6 */}
                <div className="flex gap-6" data-oid="m575xld">
                  <div className="flex-shrink-0" data-oid="6tt:yy1">
                    <span
                      className="inline-flex items-center justify-center w-8 h-8 bg-blue-600 text-white font-bold rounded-full text-sm"
                      data-oid="gb:.utc">

                      6
                    </span>
                  </div>
                  <div data-oid="hnx-dwd">
                    <h3
                      className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2"
                      data-oid="zrpq05l">

                      Expertise shortage
                    </h3>
                    <p
                      className="text-gray-700 dark:text-gray-300 leading-relaxed"
                      data-oid="fudfata">

                      Only 10% of AI professionals expressed high confidence in
                      their ability to develop effective in-house solutions.
                      This highlights a notable lack of confidence in building
                      quality in-house generative AI solutions.
                    </p>
                  </div>
                </div>

                {/* Finding 7 */}
                <div className="flex gap-6" data-oid="fk4-4e9">
                  <div className="flex-shrink-0" data-oid="m9:w7nd">
                    <span
                      className="inline-flex items-center justify-center w-8 h-8 bg-blue-600 text-white font-bold rounded-full text-sm"
                      data-oid="-up._0b">

                      7
                    </span>
                  </div>
                  <div data-oid="p2t3cco">
                    <h3
                      className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2"
                      data-oid="11bj-zf">

                      Security, reliability chief among commercial solutions
                      criteria
                    </h3>
                    <p
                      className="text-gray-700 dark:text-gray-300 leading-relaxed"
                      data-oid="jb84q:5">

                      Given the challenges and low confidence in in-house
                      development, there's a strong preference for commercial
                      generative AI solutions that can offer reliability,
                      security, and ease of integration.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Article Body */}
            <section
              className="prose prose-lg dark:prose-invert max-w-none"
              data-oid="chwj4kr">

              <p
                className="text-lg leading-relaxed text-gray-700 dark:text-gray-300 mb-6"
                data-oid="zi4.11b">

                In this report, we'll shed light on the widespread recognition
                of and trust in generative AI as a key enabler for businesses.
                We'll explore the specific teams at the forefront of adopting
                generative AI, as well as explore the potential for its
                expansion into new departments. Additionally, we'll address
                critical aspects such as security, data management, and the
                perspectives on building in-house solutions versus leveraging
                commercial offerings.
              </p>

              <p
                className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6"
                data-oid="cu:f:hz">

                The enterprise landscape is experiencing a fundamental shift as
                generative AI technologies mature and become more accessible.
                Organizations across industries are recognizing the
                transformative potential of these tools, not just as
                experimental technologies, but as core business enablers that
                can drive efficiency, innovation, and competitive advantage.
              </p>

              <p
                className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6"
                data-oid="d54mn0d">

                Our research reveals a complex picture of adoption patterns,
                challenges, and opportunities. While enthusiasm for generative
                AI is nearly universal among enterprise leaders, the path to
                successful implementation is fraught with technical, security,
                and organizational considerations that require careful
                navigation.
              </p>

              <h3
                id="current-state"
                className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-12 mb-6"
                data-oid="gbt.epr">

                The Current State of Enterprise AI Adoption
              </h3>

              <p
                className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6"
                data-oid="wzdkj7w">

                The data paints a clear picture: generative AI has moved from
                the realm of experimentation to strategic priority. With 96% of
                companies viewing it as a key enabler, we're witnessing one of
                the fastest technology adoption curves in recent enterprise
                history. This widespread recognition reflects not just the hype
                surrounding AI, but tangible results that early adopters are
                already experiencing.
              </p>

              <p
                className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6"
                data-oid="xy-_.hi">

                The anticipated rapid growth in adoption across departments
                signals a shift from isolated pilot projects to
                organization-wide transformation initiatives. Companies are
                moving beyond simple automation tasks to more sophisticated
                applications that can fundamentally change how work gets done.
              </p>

              <h3
                id="security-challenges"
                className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-12 mb-6"
                data-oid="hi.03ws">

                Security and Governance Challenges
              </h3>

              <p
                className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6"
                data-oid="z:pkqxx">

                Perhaps the most significant finding in our research is the
                tension between enthusiasm for AI capabilities and concerns
                about security and data protection. With 95% of companies
                expressing security concerns and 94% worried about data
                protection, it's clear that technical capabilities alone are not
                sufficient for enterprise adoption.
              </p>

              <p
                className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6"
                data-oid=":ob12w0">

                This security-first mindset is driving the preference for
                private, in-house solutions among 76% of companies. However,
                this preference creates its own set of challenges, as evidenced
                by the low confidence levels among AI professionals and the
                accuracy issues experienced by 61% of companies with in-house
                solutions.
              </p>

              <h3
                id="path-forward"
                className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-12 mb-6"
                data-oid="iqmojgj">

                The Path Forward
              </h3>

              <p
                className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6"
                data-oid="7z:gtgy">

                The future of enterprise generative AI lies in finding the right
                balance between security, functionality, and ease of
                implementation. As the technology continues to evolve, we expect
                to see more sophisticated commercial solutions that can meet
                enterprise security requirements while delivering the
                reliability and performance that in-house solutions often
                struggle to achieve.
              </p>

              <p
                className="leading-relaxed text-gray-700 dark:text-gray-300 mb-6"
                data-oid="6vsd5xe">

                Organizations that can successfully navigate these
                challenges—balancing innovation with security, leveraging both
                internal expertise and external solutions, and maintaining a
                strategic approach to AI adoption—will be best positioned to
                realize the transformative potential of generative AI in the
                enterprise.
              </p>
            </section>

            {/* Writer Action Agent Section */}
            <section className="mt-16 mb-16" data-oid="writer-action-agent">
              <WriterActionAgent data-oid="ykdzorc" />
            </section>

            {/* Ebook Download Section */}
            <section className="w-full flex-1 flex items-center justify-center py-16" data-oid="ebook-download-section">

              <EbookDownload
                title="The cost savings and business benefits of Writer"
                subtitle="Commissioned by Writer in April 2025, the Forrester Total Economic Impact™ (TEI) Study helps you weigh benefits and costs of the our end-to-end enterprise AI platform."
                description="Across the enterprise, employees are bogged down by time-consuming, repetitive work — the perfect job for AI. There's real opportunity to build human-centric use cases that tackle mission-critical processes. But without the right infrastructure, organizations struggle to build, scale, and supervise AI agents. It requires a purpose-built foundation to support enterprise-wide deployment and adoption."
                apiEndpoint="/api/ebook-download"
                privacyPolicyUrl="/privacy-policy"
                fields={{
                  firstName: true,
                  email: true,
                  phone: true,
                  companyName: true,
                  jobTitle: true
                }}
                data-oid="lx-szol" />

            </section>
          </div>
        </div>

        {/* Fixed Table of Contents Toggle Button */}

        {/* Sliding Table of Contents Menu */}
        <div
          className={`fixed right-0 top-0 h-full w-80 bg-white dark:bg-slate-900 shadow-2xl z-40 transform transition-transform duration-300 ease-in-out ${
          isTocOpen ? "translate-x-0" : "translate-x-full"}`
          }
          data-oid="sb.jtyz"
          key="olk-anUo">

          <div className="flex flex-col h-full" data-oid="esstwq-">
            {/* Menu Header */}
            <div
              className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700"
              data-oid=".vkdgh:">

              <h3
                className="text-lg font-semibold text-gray-900 dark:text-gray-100"
                data-oid="zwuec8r">

                Table of Contents
              </h3>
              <button
                onClick={() => setIsTocOpen(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                aria-label="Close menu"
                data-oid="-9i:y-s">

                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  data-oid="e--v.cd">

                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                    data-oid="rsi9i4w" />

                </svg>
              </button>
            </div>

            {/* Menu Content */}
            <div className="flex-1 overflow-y-auto p-6" data-oid="4ry7czl">
              <nav className="space-y-3" data-oid="3w-pxzv">
                <a
                  href="#key-findings"
                  onClick={() => setIsTocOpen(false)}
                  className="block text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 border-l-3 border-transparent hover:border-blue-600"
                  data-oid="n9.wk3d">

                  Key findings
                </a>
                <a
                  href="#current-state"
                  onClick={() => setIsTocOpen(false)}
                  className="block text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 border-l-3 border-transparent hover:border-blue-600"
                  data-oid="oiqvfy2">

                  The Current State of Enterprise AI Adoption
                </a>
                <a
                  href="#security-challenges"
                  onClick={() => setIsTocOpen(false)}
                  className="block text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 border-l-3 border-transparent hover:border-blue-600"
                  data-oid="7an57xf">

                  Security and Governance Challenges
                </a>
                <a
                  href="#path-forward"
                  onClick={() => setIsTocOpen(false)}
                  className="block text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 border-l-3 border-transparent hover:border-blue-600"
                  data-oid="-a.g6t3">

                  The Path Forward
                </a>
              </nav>
            </div>
          </div>
        </div>

        {/* Table of Contents Overlay */}
        {isTocOpen &&
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity duration-300"
          onClick={() => setIsTocOpen(false)}
          data-oid="i6ffj:y" />

        }
      </div>
    </div>);

}