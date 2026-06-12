import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      <Navbar />
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {/* Header */}
        <h1 className="text-center text-2xl sm:text-3xl lg:text-4xl font-bold text-black dark:text-white mb-8 sm:mb-10 lg:mb-12">Privacy Policy</h1>

        {/* Dates */}
        <div className="mb-6 sm:mb-8 space-y-1">
          <p className="text-sm text-black dark:text-white">
            <span className="font-semibold">Effective Date:</span> 8-12-2025
          </p>
          <p className="text-sm text-black dark:text-white">
            <span className="font-semibold">Last Updated:</span> 7-12-2025
          </p>
        </div>

        {/* Section 1 */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-base sm:text-lg font-bold text-black dark:text-white mb-3">1. Scope and Compliance</h2>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            This Privacy Policy describes how [Company Name] ("We," "Us," or "Our") collects, uses, and retains data generated through the use of our Warm Lead Sourcer tool (the "Service"). Our practices are guided by principles of data minimization and transparency, specifically considering global privacy regulations (e.g., GDPR, CCPA).
          </p>
        </div>

        {/* Section 2 */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-base sm:text-lg font-bold text-black dark:text-white mb-3">2. The Data We Source (Public-Only Policy)</h2>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            We adhere to a strict public-only data sourcing policy. We only collect data that is publicly accessible and explicitly provided by the user on third-party social media and content platforms based on the public post URL provided by our client.
          </p>
          
          <p className="text-sm font-semibold text-black dark:text-white mb-2">2.1 Types of Public Data Sourced:</p>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
            The data we source is limited to publicly accessible information, which may include:
          </p>
          
          <ul className="space-y-2 ml-2 sm:ml-4">
            <li className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              <span className="font-semibold">• Public Identity Information:</span> Publicly available names, usernames, profile URLs, and job titles/company names (if explicitly posted in a public profile).
            </li>
            <li className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              <span className="font-semibold">• Public Activity Data:</span> Information related to public user interactions, such as publicly posted reactions (likes, hearts) and comments on the specified public post URL.
            </li>
            <li className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              <span className="font-semibold">• Public Contact Information:</span> Business contact details (e.g., publicly listed business emails) only when available on a public profile.
            </li>
          </ul>

          <p className="text-sm font-semibold text-black dark:text-white mt-4 mb-2">2.2 Data We Are Not to Collect:</p>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            We strictly adhere to platform Terms of Service and do not access, scrape, or process any information that is private, protected, or requires user login or authentication, including private messages or information behind a login wall.
          </p>
        </div>

        {/* Section 3 */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-base sm:text-lg font-bold text-black dark:text-white mb-3">3. Data Storage and Retention</h2>
          
          <p className="text-sm font-semibold text-black dark:text-white mb-2">3.1 Encrypted, Temporary PII Storage</p>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            All extracted Personally Identifiable Information (PII) is stored temporarily in a secure, encrypted database solely for the purpose of compiling and delivering the requested lead list to you.
          </p>

          <p className="text-sm font-semibold text-black dark:text-white mb-2">3.2 30-Day Automatic Deletion</p>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            We strictly adhere to data minimization principles. All individual PII records extracted by the Service are automatically and permanently purged (deleted) from our internal database 30 days after the initial extraction date.
          </p>
        </div>

        {/* Section 4 */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-base sm:text-lg font-bold text-black dark:text-white mb-3">4. How We Use the Data</h2>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            The data is used only to compile a structured, enriched lead list for the client who initiated the sourcing request. We do not use this sourced data for our own marketing or share it with other third parties outside of the necessary service providers (e.g., hosting).
          </p>
        </div>

        {/* Section 5 */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-base sm:text-lg font-bold text-black dark:text-white mb-3">5. Client Responsibility (Data Controller Status)</h2>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            Upon downloading the compiled lead list (CSV/XLSX), the client (you) assumes the role of Data Controller for the data. The client is responsible for ensuring their subsequent storage, processing, and use of that data complies with all applicable privacy laws (GDPR, CCPA, etc.).
          </p>
        </div>

        {/* Section 6 */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-base sm:text-lg font-bold text-black dark:text-white mb-3">6. Data Subject Rights</h2>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
            Individuals whose public data was processed by the Service have the right to request access, rectification, or erasure of their data from our temporary records.
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            To submit a request for data access or deletion (Right to Erasure), please contact our Compliance Officer directly at:
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mt-2">
            Email: [compliance@yourcompanyname.com] Address: [Your Full Company Address]
          </p>
        </div>
      </div>

      <Footer />
    </div>
  )
}
