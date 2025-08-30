"use client";

import EbookDownload from "../../components/EbookDownload";
import Header from "../../components/Header";
import { useState } from "react";

export default function EbookDownloadPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div
      className="w-full min-h-screen dark:bg-black transition-colors duration-200 flex-col flex items-start justify-between bg-white"
      data-oid="ugk57hj">

      {/* Header */}
      <Header onToggleMenu={toggleMenu} isMenuOpen={isMenuOpen} data-oid="kk-5aib" />

      {/* Main Content */}
      <div
        className="w-full flex-1 flex items-center justify-center py-16"
        data-oid="8hhdi51">

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

      </div>
    </div>);

}