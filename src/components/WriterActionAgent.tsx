import React from "react";

interface WriterActionAgentProps {
  imageUrl?: string;
  imageAlt?: string;
  title?: string;
  ctaText?: string;
  href?: string;
}

export default function WriterActionAgent({
  imageUrl = "https://writer.com/wp-content/uploads/2024/07/How-to-evaluate-LLM-and-generative-AI-vendors-for-enterprise-solutions-1-1.png",
  imageAlt = "How to evaluate LLM and generative AI vendors for enterprise solutions",
  title = "How to evaluate LLM and generative AI vendors for enterprise solutions",
  ctaText = "Learn more on the blog",
  href = "#"
}: WriterActionAgentProps) {
  return (
    <a
      href={href}
      className="flex items-center gap-8 max-w-6xl mx-auto p-6 bg-white hover:bg-gray-50 transition-colors duration-200 group no-underline"
      data-oid="v.xaev7">

      {/* Left side - Image */}
      <div className="flex-shrink-0" data-oid="ijo8cqz">
        <div
          className="w-96 h-64 overflow-hidden rounded-lg"
          data-oid="d_mba98">

          <img
            src={imageUrl}
            alt={imageAlt}
            className="w-full h-full object-cover"
            data-oid="8btel7r" />

        </div>
      </div>

      {/* Right side - Text content */}
      <div
        className="flex-1 flex flex-col justify-between h-64"
        data-oid="8kl9i72">

        <div data-oid="36.s413">
          <h2
            className="text-3xl font-normal text-gray-900 mb-8 leading-tight"
            data-oid="2oz1erx">

            {title}
          </h2>
        </div>

        <div className="flex items-center justify-between" data-oid="2oz5cw.">
          <p
            className="text-sm font-semibold tracking-wider uppercase text-gray-900"
            data-oid="-ho5xz0">

            {ctaText}
          </p>
          <div
            className="w-10 h-10 bg-black rounded-full flex items-center justify-center group-hover:bg-gray-800 transition-colors duration-200"
            data-oid="cwd98m1">

            <svg
              className="w-5 h-5 text-white transform group-hover:translate-x-0.5 transition-transform duration-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              data-oid="nnblngo">

              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
                data-oid="vh7il.f" />

            </svg>
          </div>
        </div>
      </div>
    </a>);

}