"use client";

import { useState } from "react";
import Image from "next/image";

interface EbookDownloadProps {
  title?: string;
  subtitle?: string;
  description?: string;
  bookImage?: string;
  apiEndpoint: string;
  privacyPolicyUrl?: string;
  fields?: {
    firstName?: boolean;
    email?: boolean;
    phone?: boolean;
    companyName?: boolean;
    jobTitle?: boolean;
  };
}

interface FormData {
  firstName?: string;
  email?: string;
  phone?: string;
  companyName?: string;
  jobTitle?: string;
}

export default function EbookDownload({
  title = "Download the ebook",
  subtitle = "Get your free copy today",
  description = "Discover valuable insights and practical strategies in our comprehensive ebook. Perfect for professionals looking to enhance their knowledge and skills.",
  bookImage,
  apiEndpoint,
  privacyPolicyUrl = "#",
  fields = {
    firstName: true,
    email: true,
    phone: true,
    companyName: true,
    jobTitle: true
  }
}: EbookDownloadProps) {
  const [formData, setFormData] = useState<FormData>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error("Failed to submit form");
      }

      setIsSubmitted(true);
    } catch (err) {
      setError("Something went wrong. Please try again.");
      console.error("Form submission error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="max-w-7xl mx-auto" data-oid="u5r:9pb">
        <div
          className="grid lg:grid-cols-2 gap-8 items-start"
          data-oid="u_p7s0d">

          {/* Success Message Block */}
          <div className="relative" data-oid=":eoe.:o">
            <div
              className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-2xl transform hover:scale-105 transition-transform duration-300 border border-gray-100 dark:border-slate-700 hover:shadow-3xl"
              style={{
                boxShadow:
                "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)"
              }}
              data-oid="nwylor3">

              <div className="text-center" data-oid="pv..k.6">
                <div
                  className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                  data-oid="gmw_n66">

                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    data-oid="m5n36u7">

                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                      data-oid="z52qd6-" />

                  </svg>
                </div>
                <h2
                  className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4"
                  data-oid="02mxh3n">

                  Thank you!
                </h2>
                <p
                  className="text-gray-600 dark:text-gray-400"
                  data-oid="a:ihzeo">

                  Your download should start automatically. If not, check your
                  email for the download link.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>);

  }

  return (
    <div className="max-w-5xl mx-auto" data-oid="bc-nokx">
      <div
        className="grid lg:grid-cols-2 gap-6 items-stretch"
        data-oid="..lfzs2">

        {/* Content Block */}
        <div className="relative" data-oid="o:xy0sx">
          <div
            className="h-full flex flex-col justify-start text-white"
            data-oid="mjmu8h7">

            <div className="space-y-4" data-oid="weyf2az">
              <h1
                className="text-4xl lg:text-5xl font-bold leading-tight"
                data-oid="3as:0uo">
                {title}
              </h1>
              
              <p
                className="text-lg lg:text-xl text-gray-300 leading-relaxed"
                data-oid="lhn.xm.">
                {description}
              </p>
              
              <p
                className="text-base text-gray-400 leading-relaxed"
                data-oid="dfl6m0x">
                {subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Form Block */}
        <div className="relative" data-oid="dfl6m0x">
          <div
            className="bg-white rounded-xl p-6 h-full flex flex-col justify-start shadow-lg"
            data-oid=":rikdde">

              

            <div data-oid="h2gx:c8">
              <div className="mb-6" data-oid="cwuc:0.">
                <div className="text-black">

                  <h1
                    className="text-4xl lg:text-5xl font-bold leading-tight"
                    data-oid="3as:0uo">
                    AIWORKPLACE
                  </h1>
                  
                  <div className="text-xl font-normal mt-1">Скачать исследование</div>
                </div>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-3"
              data-oid="t-qaw8:">

              {fields.firstName && fields.email && (
                <div className="grid grid-cols-2 gap-3" data-oid="9urd9-o">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block text-sm font-medium text-gray-700 mb-1"
                      data-oid="5rvts.8">
                      Имя*
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      required
                      value={formData.firstName || ""}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-gray-900"
                      data-oid="oozcl2d" />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-1"
                      data-oid="sd8c:_e">
                      Email*
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email || ""}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-gray-900"
                      data-oid="ez4mfc3" />
                  </div>
                </div>
              )}

              {fields.phone && (
                <div data-oid="mp28ipl">
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 mb-1"
                    data-oid="w_a0i7:">
                    Номер телефона*
                  </label>
                  <input
                    type="text"
                    id="phone"
                    name="phone"
                    required
                    value={formData.phone || ""}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-gray-900"
                    data-oid="37yjbx6" />
                </div>
              )}

              {fields.companyName && (
                <div data-oid="rw-u0kl">
                  <label
                    htmlFor="companyName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                    data-oid="sy2j7hs">
                    Название компании*
                  </label>
                  <input
                    type="text"
                    id="companyName"
                    name="companyName"
                    required
                    value={formData.companyName || ""}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-gray-900"
                    data-oid="zlf-.66" />
                </div>
              )}

              {fields.jobTitle && (
                <div data-oid="mp28ipl">
                  <label
                    htmlFor="jobTitle"
                    className="block text-sm font-medium text-gray-700 mb-1"
                    data-oid="sy2j7hs">
                    Должность*
                  </label>
                  <input
                    type="text"
                    id="jobTitle"
                    name="jobTitle"
                    required
                    value={formData.jobTitle || ""}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-gray-900"
                    data-oid="zlf-.66" />
                </div>
              )}

              {error &&
              <div
                className="text-red-600 text-sm"
                data-oid="qzkg57r">

                {error}
              </div>
              }

              <div className="pt-3" data-oid="08f27as">
                <p
                  className="text-xs text-gray-500 mb-4"
                  data-oid="w3n37aw">

                  Заполняя и отправляя эту форму, вы соглашаетесь, что AIWORKPLACE
                  может отправлять вам электронные письма, чтобы узнать больше
                  о том, как AIWORKPLACE использует вашу информацию, ознакомьтесь с нашей{" "}
                  <a
                    href={privacyPolicyUrl}
                    className="text-blue-600 hover:underline"
                    data-oid="osmzmx-">

                    Политикой конфиденциальности
                  </a>
                  .
                </p>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  data-oid="kikbcud">

                  {isSubmitting ? "Скачивание..." : "Скачать"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>);

}